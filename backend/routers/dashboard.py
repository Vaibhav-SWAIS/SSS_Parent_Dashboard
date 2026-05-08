from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import DashboardResponse, MappedChildSchema, AssignmentSchema, QuizSchema, RemarkSchema, NoticeSchema, CallRequestCreate, CallRequestResponse
from services.dashboard_service import get_dashboard_data
from models import (
    ParentStudentMap, StudentMaster, ClassMaster, AssignmentMaster, SubjectMaster, ChapterMaster, StudentSubmission, QuizMaster, QuizResponse, TeacherParentInteractionV2, TeacherMaster, NoticeBoard, CallRequest
)
from typing import List
from datetime import date, datetime

router = APIRouter()

@router.get("/dashboard/{student_id}", response_model=DashboardResponse)
def get_dashboard(student_id: int, db: Session = Depends(get_db)):
    try:
        return get_dashboard_data(db, student_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/parents/{parent_id}/children", response_model=List[MappedChildSchema])
def get_parent_children(parent_id: int, db: Session = Depends(get_db)):
    children_query = db.query(StudentMaster, ClassMaster)\
        .join(ParentStudentMap, ParentStudentMap.student_id == StudentMaster.student_id)\
        .join(ClassMaster, StudentMaster.class_id == ClassMaster.class_id)\
        .filter(ParentStudentMap.parent_id == parent_id).all()
        
    result = []
    for student, class_info in children_query:
        result.append(MappedChildSchema(
            student_id=student.student_id,
            full_name=student.full_name,
            class_name=class_info.class_name,
            section=student.section
        ))
    return result

@router.get("/assignments/history/{student_id}", response_model=List[AssignmentSchema])
def get_assignments_history(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentMaster).filter(StudentMaster.student_id == student_id).first()
    if not student: raise HTTPException(status_code=404, detail="Student not found")

    assignments_query = db.query(
        AssignmentMaster, SubjectMaster.subject_name, StudentSubmission
    ).select_from(AssignmentMaster)\
    .join(ChapterMaster, AssignmentMaster.chapter_id == ChapterMaster.chapter_id)\
    .join(SubjectMaster, ChapterMaster.subject_id == SubjectMaster.subject_id)\
    .outerjoin(StudentSubmission, (StudentSubmission.assignment_id == AssignmentMaster.assignment_id) & (StudentSubmission.student_id == student_id))\
    .filter(SubjectMaster.class_id == student.class_id)\
    .order_by(AssignmentMaster.due_date.desc()).all()
        
    assignment_list = []
    today = date.today()
    for assign, subject_name, submission in assignments_query:
        if submission: status = "Completed"
        elif assign.due_date and assign.due_date < today: status = "Overdue"
        else: status = "Pending"
        assignment_list.append(AssignmentSchema(
            title=assign.title, subject=subject_name,
            due_date=assign.due_date.isoformat() if assign.due_date else "",
            status=status, marks_obtained=submission.marks_obtained if submission else None
        ))
    return assignment_list

@router.get("/quiz/history/{student_id}", response_model=List[QuizSchema])
def get_quiz_history(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentMaster).filter(StudentMaster.student_id == student_id).first()
    if not student: raise HTTPException(status_code=404, detail="Student not found")

    quizzes_query = db.query(
        QuizMaster, SubjectMaster.subject_name, QuizResponse
    ).select_from(QuizMaster)\
    .join(ChapterMaster, QuizMaster.chapter_id == ChapterMaster.chapter_id)\
    .join(SubjectMaster, ChapterMaster.subject_id == SubjectMaster.subject_id)\
    .outerjoin(QuizResponse, (QuizResponse.quiz_id == QuizMaster.quiz_id) & (QuizResponse.student_id == student_id))\
    .filter(SubjectMaster.class_id == student.class_id).all()
        
    quiz_list = []
    for quiz, subject_name, response in quizzes_query:
        quiz_list.append(QuizSchema(
            subject=subject_name,
            score=str(response.score) if response and response.score is not None else "--",
            total=str(quiz.total_marks) if quiz.total_marks is not None else "--"
        ))
    return quiz_list

@router.get("/remarks/history/{student_id}", response_model=List[RemarkSchema])
def get_remarks_history(student_id: int, db: Session = Depends(get_db)):
    submissions_remarks = db.query(StudentSubmission, TeacherMaster.full_name)\
        .join(AssignmentMaster, StudentSubmission.assignment_id == AssignmentMaster.assignment_id)\
        .join(TeacherMaster, AssignmentMaster.assigned_by == TeacherMaster.teacher_id)\
        .filter(StudentSubmission.student_id == student_id)\
        .filter(StudentSubmission.teacher_remarks.isnot(None))\
        .filter(StudentSubmission.teacher_remarks != '').all()
        
    interactions = db.query(TeacherParentInteractionV2, TeacherMaster.full_name)\
        .join(TeacherMaster, TeacherParentInteractionV2.teacher_id == TeacherMaster.teacher_id)\
        .filter(TeacherParentInteractionV2.student_id == student_id)\
        .filter(TeacherParentInteractionV2.comments.isnot(None))\
        .filter(TeacherParentInteractionV2.comments != '').all()
        
    all_remarks = []
    for sub, teacher_name in submissions_remarks:
        remark_date = sub.submitted_at or datetime.utcnow()
        all_remarks.append({"teacher_name": teacher_name, "comment": sub.teacher_remarks.strip(), "date_obj": remark_date, "date": remark_date.strftime("%Y-%m-%d")})
    for inter, teacher_name in interactions:
        remark_date = inter.created_at or datetime.utcnow()
        all_remarks.append({"teacher_name": teacher_name, "comment": inter.comments.strip(), "date_obj": remark_date, "date": remark_date.strftime("%Y-%m-%d")})
        
    all_remarks.sort(key=lambda x: x["date_obj"], reverse=True)
    return [RemarkSchema(teacher_name=r["teacher_name"], comment=r["comment"], date=r["date"]) for r in all_remarks]

@router.get("/notices/history/{student_id}", response_model=List[NoticeSchema])
def get_notices_history(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentMaster).filter(StudentMaster.student_id == student_id).first()
    if not student: raise HTTPException(status_code=404, detail="Student not found")

    notices_query = db.query(NoticeBoard, TeacherMaster.full_name)\
        .join(TeacherMaster, NoticeBoard.posted_by == TeacherMaster.teacher_id)\
        .filter(NoticeBoard.class_id == student.class_id)\
        .filter(NoticeBoard.content.isnot(None))\
        .filter(NoticeBoard.content != '')\
        .order_by(NoticeBoard.created_at.desc()).all()
        
    return [NoticeSchema(title=n.title or "Notice", content=n.content.strip(), date=n.created_at.strftime("%Y-%m-%d") if n.created_at else "", posted_by_name=t) for n, t in notices_query]

@router.get("/call-requests/history/{student_id}", response_model=List[CallRequestResponse])
def get_call_requests_history(student_id: int, db: Session = Depends(get_db)):
    call_requests_query = db.query(CallRequest, TeacherMaster.full_name)\
        .outerjoin(TeacherMaster, CallRequest.teacher_id == TeacherMaster.teacher_id)\
        .filter(CallRequest.student_id == student_id)\
        .order_by(CallRequest.created_at.desc()).all()

    return [CallRequestResponse(id=cr.id, message=cr.message, status=cr.status, created_at=cr.created_at.strftime("%Y-%m-%d") if cr.created_at else "", teacher_name=t) for cr, t in call_requests_query]

@router.post("/request-call", response_model=CallRequestResponse)
def create_call_request(request: CallRequestCreate, db: Session = Depends(get_db)):
    new_request = CallRequest(
        parent_id=request.parent_id,
        student_id=request.student_id,
        message=request.message,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    cr_date_str = new_request.created_at.strftime("%Y-%m-%d") if new_request.created_at else ""
    return CallRequestResponse(id=new_request.id, message=new_request.message, status=new_request.status, created_at=cr_date_str)


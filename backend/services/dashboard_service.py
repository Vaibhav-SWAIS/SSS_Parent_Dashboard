from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import (
    StudentMaster, ClassMaster, AssignmentMaster, StudentSubmission, 
    QuizMaster, QuizResponse, TeacherParentInteractionV2, NoticeBoard, 
    SubjectMaster, ChapterMaster, TeacherMaster, CallRequest
)
from schemas import DashboardResponse, StudentSchema, AssignmentSchema, QuizSchema, RemarkSchema, NoticeSchema, CallRequestResponse
from datetime import date, datetime

def get_dashboard_data(db: Session, student_id: int):
    print(f"Fetching dashboard for student: {student_id}")
    
    # 1. Get Student Info
    student_query = db.query(StudentMaster, ClassMaster)\
        .join(ClassMaster, StudentMaster.class_id == ClassMaster.class_id)\
        .filter(StudentMaster.student_id == student_id).first()
        
    if not student_query:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student, class_info = student_query
    
    student_data = StudentSchema(
        student_id=student.student_id,
        full_name=student.full_name,
        class_name=class_info.class_name,
        section=student.section,
        roll_no=student.roll_no or ""
    )
    
    # 2. Get Assignments & Submissions (Optimized JOIN)
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
        if submission:
            status = "Completed"
        elif assign.due_date and assign.due_date < today:
            status = "Overdue"
        else:
            status = "Pending"
            
        due_date_str = assign.due_date.isoformat() if assign.due_date else ""
            
        assignment_list.append(AssignmentSchema(
            title=assign.title,
            subject=subject_name,
            due_date=due_date_str,
            status=status,
            marks_obtained=submission.marks_obtained if submission else None
        ))

    # 3. Get Quiz Performance (Optimized JOIN)
    quizzes_query = db.query(
        QuizMaster, SubjectMaster.subject_name, QuizResponse
    ).select_from(QuizMaster)\
    .join(ChapterMaster, QuizMaster.chapter_id == ChapterMaster.chapter_id)\
    .join(SubjectMaster, ChapterMaster.subject_id == SubjectMaster.subject_id)\
    .outerjoin(QuizResponse, (QuizResponse.quiz_id == QuizMaster.quiz_id) & (QuizResponse.student_id == student_id))\
    .filter(SubjectMaster.class_id == student.class_id).all()
        
    quiz_list = []
    for quiz, subject_name, response in quizzes_query:
        score_str = str(response.score) if response and response.score is not None else "--"
        total_str = str(quiz.total_marks) if quiz.total_marks is not None else "--"
        
        quiz_list.append(QuizSchema(
            subject=subject_name,
            score=score_str,
            total=total_str
        ))

    # 4. Get Remarks/Interactions
    # From Submissions
    submissions_remarks = db.query(StudentSubmission, TeacherMaster.full_name)\
        .join(AssignmentMaster, StudentSubmission.assignment_id == AssignmentMaster.assignment_id)\
        .join(TeacherMaster, AssignmentMaster.assigned_by == TeacherMaster.teacher_id)\
        .filter(StudentSubmission.student_id == student_id)\
        .filter(StudentSubmission.teacher_remarks.isnot(None))\
        .filter(StudentSubmission.teacher_remarks != '').all()
        
    # From Interactions
    interactions = db.query(TeacherParentInteractionV2, TeacherMaster.full_name)\
        .join(TeacherMaster, TeacherParentInteractionV2.teacher_id == TeacherMaster.teacher_id)\
        .filter(TeacherParentInteractionV2.student_id == student_id)\
        .filter(TeacherParentInteractionV2.comments.isnot(None))\
        .filter(TeacherParentInteractionV2.comments != '').all()
        
    all_remarks = []
    for sub, teacher_name in submissions_remarks:
        remark_date = sub.submitted_at or datetime.utcnow()
        all_remarks.append({
            "teacher_name": teacher_name,
            "comment": sub.teacher_remarks.strip(),
            "date_obj": remark_date,
            "date": remark_date.strftime("%Y-%m-%d")
        })
        
    for inter, teacher_name in interactions:
        remark_date = inter.created_at or datetime.utcnow()
        all_remarks.append({
            "teacher_name": teacher_name,
            "comment": inter.comments.strip(),
            "date_obj": remark_date,
            "date": remark_date.strftime("%Y-%m-%d")
        })
        
    # Sort DESC (latest first)
    all_remarks.sort(key=lambda x: x["date_obj"], reverse=True)
    
    remark_list = [
        RemarkSchema(
            teacher_name=r["teacher_name"],
            comment=r["comment"],
            date=r["date"]
        ) for r in all_remarks
    ]

    # 5. Get Notices (Optimized JOIN, filter by class_id)
    notices_query = db.query(NoticeBoard, TeacherMaster.full_name)\
        .join(TeacherMaster, NoticeBoard.posted_by == TeacherMaster.teacher_id)\
        .filter(NoticeBoard.class_id == student.class_id)\
        .filter(NoticeBoard.content.isnot(None))\
        .filter(NoticeBoard.content != '')\
        .order_by(NoticeBoard.created_at.desc()).all()
        
    notice_list = []
    for notice, teacher_name in notices_query:
        notice_date_str = notice.created_at.strftime("%Y-%m-%d") if notice.created_at else ""
        notice_list.append(NoticeSchema(
            title=notice.title or "Notice",
            content=notice.content.strip(),
            date=notice_date_str,
            posted_by_name=teacher_name
        ))

    # 6. Call Requests
    call_requests_query = db.query(CallRequest, TeacherMaster.full_name)\
        .outerjoin(TeacherMaster, CallRequest.teacher_id == TeacherMaster.teacher_id)\
        .filter(CallRequest.student_id == student_id)\
        .order_by(CallRequest.created_at.desc()).all()

    call_req_list = []
    for cr, teacher_name in call_requests_query:
        cr_date_str = cr.created_at.strftime("%Y-%m-%d") if cr.created_at else ""
        call_req_list.append(CallRequestResponse(
            id=cr.id,
            message=cr.message,
            status=cr.status,
            created_at=cr_date_str,
            teacher_name=teacher_name
        ))

    # Limit lists for dashboard
    return DashboardResponse(
        student=student_data,
        assignments=assignment_list[:4],
        quiz=quiz_list[:4],
        remarks=remark_list[:4],
        notices=notice_list[:4],
        call_requests=call_req_list[:4]
    )

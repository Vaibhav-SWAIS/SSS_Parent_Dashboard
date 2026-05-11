from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from typing import List, Dict, Any
from datetime import datetime, date, timedelta
from services.dashboard_service import get_dashboard_data
from services.analytics_service import get_analytics_data
from schemas import DashboardResponse, AnalyticsResponse, MappedChildSchema, AssignmentSchema, QuizSchema, QuizDetailResponse, RemarkSchema, NoticeSchema, CallRequestCreate, CallRequestResponse, AssignmentSubmitRequest, AssignmentAnalyticsResponse
from models import (
    ParentStudentMap, StudentMaster, ClassMaster, AssignmentMaster, SubjectMaster, ChapterMaster, StudentSubmission, QuizMaster, QuizResponse, TeacherParentInteractionV2, TeacherMaster, NoticeBoard, CallRequest
)

router = APIRouter()

@router.get("/dashboard/{student_id}", response_model=DashboardResponse)
def get_dashboard(student_id: int, db: Session = Depends(get_db)):
    try:
        return get_dashboard_data(db, student_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/{student_id}", response_model=AnalyticsResponse)
def get_analytics(student_id: int, db: Session = Depends(get_db)):
    try:
        return get_analytics_data(db, student_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from schemas import TimelineItemSchema

@router.get("/communication/timeline/{student_id}", response_model=List[TimelineItemSchema])
def get_communication_timeline(student_id: int, db: Session = Depends(get_db)):
    try:
        timeline = []
        
        # Call Requests (PTM Requests / Parent Notes)
        calls = db.query(CallRequest, TeacherMaster.full_name).outerjoin(TeacherMaster, CallRequest.teacher_id == TeacherMaster.teacher_id).filter(CallRequest.student_id == student_id).all()
        for c, t_name in calls:
            if c.created_at:
                timeline.append({
                    "id": f"call_{c.id}",
                    "type": "PTM Request" if c.status == "pending" else "Parent Note",
                    "title": f"Status: {c.status.capitalize() if c.status else 'Pending'}",
                    "message": c.message or "",
                    "date_obj": c.created_at,
                    "date": c.created_at.strftime("%Y-%m-%d %H:%M"),
                    "author": "Parent"
                })
                
        # Remarks
        remarks = db.query(TeacherParentInteractionV2, TeacherMaster.full_name).join(TeacherMaster, TeacherParentInteractionV2.teacher_id == TeacherMaster.teacher_id).filter(TeacherParentInteractionV2.student_id == student_id).all()
        for r, t_name in remarks:
            if r.created_at:
                timeline.append({
                    "id": f"rem_{r.id}",
                    "type": "Teacher Remark",
                    "title": "Academic Feedback",
                    "message": r.comments or "",
                    "date_obj": r.created_at,
                    "date": r.created_at.strftime("%Y-%m-%d %H:%M"),
                    "author": t_name or "Teacher"
                })
                
        # Notices (Teacher Announcements)
        student = db.query(StudentMaster).filter(StudentMaster.student_id == student_id).first()
        if student:
            notices = db.query(NoticeBoard, TeacherMaster.full_name).join(TeacherMaster, NoticeBoard.posted_by == TeacherMaster.teacher_id).filter(NoticeBoard.class_id == student.class_id).all()
            for n, t_name in notices:
                if n.created_at:
                    timeline.append({
                        "id": f"not_{n.notice_id}",
                        "type": "Announcement",
                        "title": n.title or "Notice",
                        "message": n.content or "",
                        "date_obj": n.created_at,
                        "date": n.created_at.strftime("%Y-%m-%d %H:%M"),
                        "author": t_name or "Teacher"
                    })
                    
        timeline.sort(key=lambda x: x["date_obj"], reverse=True)
        return [TimelineItemSchema(**item) for item in timeline]
    except Exception as e:
        print(f"Error in timeline: {str(e)}")
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
        AssignmentMaster, SubjectMaster.subject_name, ChapterMaster.chapter_name,
        TeacherMaster.full_name, StudentSubmission
    ).select_from(AssignmentMaster)\
    .join(ChapterMaster, AssignmentMaster.chapter_id == ChapterMaster.chapter_id)\
    .join(SubjectMaster, ChapterMaster.subject_id == SubjectMaster.subject_id)\
    .outerjoin(TeacherMaster, AssignmentMaster.assigned_by == TeacherMaster.teacher_id)\
    .outerjoin(StudentSubmission, (StudentSubmission.assignment_id == AssignmentMaster.assignment_id) & (StudentSubmission.student_id == student_id))\
    .filter(SubjectMaster.class_id == student.class_id)\
    .order_by(AssignmentMaster.due_date.desc()).all()

    assignment_list = []
    today = date.today()
    for assign, subject_name, chapter_name, teacher_name, submission in assignments_query:
        if submission:
            status = "Graded" if submission.marks_obtained is not None else "Submitted"
        elif assign.due_date and assign.due_date < today:
            status = "Overdue"
        elif assign.due_date and (assign.due_date - today).days <= 7:
            status = "Ongoing"
        else:
            status = "Upcoming"
        assignment_list.append(AssignmentSchema(
            assignment_id=assign.assignment_id,
            title=assign.title,
            subject=subject_name,
            chapter_name=chapter_name,
            teacher_name=teacher_name or "",
            due_date=assign.due_date.isoformat() if assign.due_date else "",
            status=status,
            marks_obtained=submission.marks_obtained if submission else None,
            submitted_at=submission.submitted_at.isoformat() if submission and submission.submitted_at else None,
            submission_text=submission.submission_text if submission else None,
            teacher_remarks=submission.teacher_remarks if submission else None,
            file_path=submission.file_path if submission else None,
        ))
    return assignment_list

@router.get("/assignments/analytics/{student_id}", response_model=AssignmentAnalyticsResponse)
def get_assignment_analytics(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentMaster).filter(StudentMaster.student_id == student_id).first()
    if not student: raise HTTPException(status_code=404, detail="Student not found")

    rows = db.query(AssignmentMaster, StudentSubmission)\
        .select_from(AssignmentMaster)\
        .join(ChapterMaster, AssignmentMaster.chapter_id == ChapterMaster.chapter_id)\
        .join(SubjectMaster, ChapterMaster.subject_id == SubjectMaster.subject_id)\
        .outerjoin(StudentSubmission, (StudentSubmission.assignment_id == AssignmentMaster.assignment_id) & (StudentSubmission.student_id == student_id))\
        .filter(SubjectMaster.class_id == student.class_id).all()

    today = date.today()
    total = len(rows)
    submitted = sum(1 for a, s in rows if s and s.marks_obtained is None)
    graded = sum(1 for a, s in rows if s and s.marks_obtained is not None)
    overdue = sum(1 for a, s in rows if not s and a.due_date and a.due_date < today)
    ongoing = sum(1 for a, s in rows if not s and a.due_date and a.due_date >= today and (a.due_date - today).days <= 7)
    upcoming = sum(1 for a, s in rows if not s and (not a.due_date or (a.due_date >= today and (a.due_date - today).days > 7)))
    completion_pct = round((submitted + graded) / total * 100, 1) if total > 0 else 0.0
    return AssignmentAnalyticsResponse(total=total, submitted=submitted, pending=ongoing, overdue=overdue, graded=graded, completion_pct=completion_pct)

@router.post("/assignments/submit", response_model=AssignmentSchema)
def submit_assignment(request: AssignmentSubmitRequest, db: Session = Depends(get_db)):
    existing = db.query(StudentSubmission).filter(
        StudentSubmission.assignment_id == request.assignment_id,
        StudentSubmission.student_id == request.student_id
    ).first()
    if existing:
        existing.submission_text = request.submission_text
        existing.file_path = request.file_path
        existing.submitted_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        sub = existing
    else:
        sub = StudentSubmission(
            assignment_id=request.assignment_id,
            student_id=request.student_id,
            submission_text=request.submission_text,
            file_path=request.file_path,
            submitted_at=datetime.utcnow()
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)

    assign_row = db.query(AssignmentMaster, SubjectMaster.subject_name, ChapterMaster.chapter_name, TeacherMaster.full_name)\
        .join(ChapterMaster, AssignmentMaster.chapter_id == ChapterMaster.chapter_id)\
        .join(SubjectMaster, ChapterMaster.subject_id == SubjectMaster.subject_id)\
        .outerjoin(TeacherMaster, AssignmentMaster.assigned_by == TeacherMaster.teacher_id)\
        .filter(AssignmentMaster.assignment_id == request.assignment_id).first()

    if not assign_row:
        raise HTTPException(status_code=404, detail="Assignment not found")
    assign, subject_name, chapter_name, teacher_name = assign_row
    status = "Graded" if sub.marks_obtained is not None else "Submitted"
    return AssignmentSchema(
        assignment_id=assign.assignment_id, title=assign.title, subject=subject_name,
        chapter_name=chapter_name, teacher_name=teacher_name or "",
        due_date=assign.due_date.isoformat() if assign.due_date else "",
        status=status, marks_obtained=sub.marks_obtained,
        submitted_at=sub.submitted_at.isoformat() if sub.submitted_at else None,
        submission_text=sub.submission_text, teacher_remarks=sub.teacher_remarks, file_path=sub.file_path
    )

@router.get("/quiz/history/{student_id}", response_model=List[QuizDetailResponse])
def get_quiz_history(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentMaster).filter(StudentMaster.student_id == student_id).first()
    if not student: raise HTTPException(status_code=404, detail="Student not found")

    quizzes_query = db.query(
        QuizMaster, SubjectMaster.subject_name, QuizResponse
    ).select_from(QuizMaster)\
    .join(ChapterMaster, QuizMaster.chapter_id == ChapterMaster.chapter_id)\
    .join(SubjectMaster, ChapterMaster.subject_id == SubjectMaster.subject_id)\
    .join(QuizResponse, (QuizResponse.quiz_id == QuizMaster.quiz_id) & (QuizResponse.student_id == student_id))\
    .filter(SubjectMaster.class_id == student.class_id).all()
        
    quiz_list = []
    for quiz, subject_name, response in quizzes_query:
        if not response or response.score is None:
            continue
            
        score = float(response.score)
        total = float(quiz.total_marks or 100)
        percentage = round((score / total) * 100, 1) if total > 0 else 0
        
        if percentage >= 85:
            status = "Excellent"
            suggestion = "Excellent consistency."
        elif percentage >= 70:
            status = "Good"
            suggestion = "Good performance. Minor improvement possible."
        elif percentage >= 50:
            status = "Average"
            suggestion = "Needs more revision practice."
        else:
            status = "Needs Improvement"
            suggestion = "Immediate academic attention recommended."
            
        quiz_list.append(QuizDetailResponse(
            subject=subject_name,
            score=str(score),
            total=str(total),
            quiz_id=quiz.quiz_id,
            quiz_title=quiz.title or f"{subject_name} Quiz",
            percentage=percentage,
            teacher_name="Course Instructor",
            remarks=suggestion,
            quiz_date=quiz.created_at.isoformat() if hasattr(quiz, 'created_at') and quiz.created_at else datetime.utcnow().isoformat(),
            status=status,
            suggestion=suggestion
        ))
    return quiz_list

@router.get("/remarks/history/{student_id}", response_model=List[RemarkSchema])
def get_remarks_history(student_id: int, db: Session = Depends(get_db)):
    submissions_remarks = db.query(StudentSubmission, TeacherMaster.full_name, SubjectMaster.subject_name)\
        .join(AssignmentMaster, StudentSubmission.assignment_id == AssignmentMaster.assignment_id)\
        .join(TeacherMaster, AssignmentMaster.assigned_by == TeacherMaster.teacher_id)\
        .join(ChapterMaster, AssignmentMaster.chapter_id == ChapterMaster.chapter_id)\
        .join(SubjectMaster, ChapterMaster.subject_id == SubjectMaster.subject_id)\
        .filter(StudentSubmission.student_id == student_id)\
        .filter(StudentSubmission.teacher_remarks.isnot(None))\
        .filter(StudentSubmission.teacher_remarks != '').all()
        
    interactions = db.query(TeacherParentInteractionV2, TeacherMaster.full_name)\
        .join(TeacherMaster, TeacherParentInteractionV2.teacher_id == TeacherMaster.teacher_id)\
        .filter(TeacherParentInteractionV2.student_id == student_id)\
        .filter(TeacherParentInteractionV2.comments.isnot(None))\
        .filter(TeacherParentInteractionV2.comments != '').all()
        
    all_remarks = []
    idx = 1
    for sub, teacher_name, subject_name in submissions_remarks:
        remark_date = sub.submitted_at or datetime.utcnow()
        all_remarks.append({
            "remark_id": idx,
            "teacher_name": teacher_name,
            "subject": subject_name,
            "comment": sub.teacher_remarks.strip(),
            "date_obj": remark_date,
            "date": remark_date.strftime("%d %b %Y")
        })
        idx += 1
        
    for inter, teacher_name in interactions:
        remark_date = inter.created_at or datetime.utcnow()
        all_remarks.append({
            "remark_id": idx,
            "teacher_name": teacher_name,
            "subject": "General",
            "comment": inter.comments.strip(),
            "date_obj": remark_date,
            "date": remark_date.strftime("%d %b %Y")
        })
        idx += 1
        
    all_remarks.sort(key=lambda x: x["date_obj"], reverse=True)
    return [RemarkSchema(**r) for r in all_remarks]

@router.get("/notices/history/{student_id}", response_model=List[NoticeSchema])
def get_notices_history(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentMaster).filter(StudentMaster.student_id == student_id).first()
    if not student: raise HTTPException(status_code=404, detail="Student not found")
    
    # We optionally could match student's class name with applicable_class, but since we 
    # changed the DB, let's just pull all notices and filter by something reasonable or just return all for now 
    # (assuming all notices are relevant to the parent in this view).
    notices_query = db.query(NoticeBoard, TeacherMaster.full_name)\
        .outerjoin(TeacherMaster, NoticeBoard.posted_by == TeacherMaster.teacher_id)\
        .filter(NoticeBoard.notice_text.isnot(None))\
        .filter(NoticeBoard.notice_text != '')\
        .order_by(NoticeBoard.created_at.desc()).all()
        
    return [
        NoticeSchema(
            notice_id=n.notice_id,
            notice_title=n.notice_title or "Notice", 
            notice_text=n.notice_text.strip(), 
            notice_date=n.notice_date.strftime("%d %b %Y") if n.notice_date else (n.created_at.strftime("%d %b %Y") if n.created_at else ""), 
            applicable_class=n.applicable_class or "All",
            posted_by_name=t or "Admin"
        ) for n, t in notices_query
    ]

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


from models import ChatThread, ChatMessage
from schemas import ChatThreadSchema, ChatMessageSchema, ChatMessageCreate

@router.get("/chat/threads/{parent_id}/{student_id}", response_model=List[ChatThreadSchema])
def get_chat_threads(parent_id: int, student_id: int, db: Session = Depends(get_db)):
    threads = db.query(ChatThread, TeacherMaster.full_name, StudentMaster.full_name)\
        .join(TeacherMaster, ChatThread.teacher_id == TeacherMaster.teacher_id)\
        .join(StudentMaster, ChatThread.student_id == StudentMaster.student_id)\
        .filter(ChatThread.parent_id == parent_id, ChatThread.student_id == student_id)\
        .order_by(ChatThread.created_at.desc()).all()

    result = []
    for thread, t_name, s_name in threads:
        latest_msg = db.query(ChatMessage).filter(ChatMessage.thread_id == thread.id).order_by(ChatMessage.created_at.desc()).first()
        unread_count = db.query(ChatMessage).filter(ChatMessage.thread_id == thread.id, ChatMessage.is_read == False, ChatMessage.sender_type == 'teacher').count()
        
        msg_schema = None
        if latest_msg:
            msg_schema = ChatMessageSchema(
                id=latest_msg.id, thread_id=latest_msg.thread_id, sender_type=latest_msg.sender_type,
                sender_id=latest_msg.sender_id, message=latest_msg.message, translated_message=latest_msg.translated_message,
                created_at=latest_msg.created_at.isoformat(), is_read=latest_msg.is_read
            )
        
        result.append(ChatThreadSchema(
            id=thread.id, teacher_id=thread.teacher_id, teacher_name=t_name,
            student_id=thread.student_id, student_name=s_name,
            created_at=thread.created_at.isoformat(),
            latest_message=msg_schema, unread_count=unread_count
        ))
    return result

@router.get("/chat/messages/{thread_id}", response_model=List[ChatMessageSchema])
def get_chat_messages(thread_id: int, db: Session = Depends(get_db)):
    # mark all as read when fetched by parent
    db.query(ChatMessage).filter(ChatMessage.thread_id == thread_id, ChatMessage.sender_type == 'teacher', ChatMessage.is_read == False).update({"is_read": True})
    db.commit()

    messages = db.query(ChatMessage).filter(ChatMessage.thread_id == thread_id).order_by(ChatMessage.created_at.asc()).all()
    
    return [ChatMessageSchema(
        id=m.id, thread_id=m.thread_id, sender_type=m.sender_type, sender_id=m.sender_id,
        message=m.message, translated_message=m.translated_message, created_at=m.created_at.isoformat(), is_read=m.is_read
    ) for m in messages]

@router.post("/chat/messages", response_model=ChatMessageSchema)
def create_chat_message(request: ChatMessageCreate, db: Session = Depends(get_db)):
    new_msg = ChatMessage(
        thread_id=request.thread_id, sender_type=request.sender_type, sender_id=request.sender_id,
        message=request.message, translated_message=request.translated_message,
        created_at=datetime.utcnow(), is_read=False
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    
    return ChatMessageSchema(
        id=new_msg.id, thread_id=new_msg.thread_id, sender_type=new_msg.sender_type, sender_id=new_msg.sender_id,
        message=new_msg.message, translated_message=new_msg.translated_message, created_at=new_msg.created_at.isoformat(), is_read=new_msg.is_read
    )

from models import SupportTicket, TicketMessage
from schemas import SupportTicketSchema, TicketMessageSchema, TicketCreateSchema, TicketMessageCreateSchema, NotificationSchema

@router.get("/tickets/{parent_id}/{student_id}", response_model=List[SupportTicketSchema])
def get_tickets(parent_id: int, student_id: int, db: Session = Depends(get_db)):
    tickets = db.query(SupportTicket).filter(SupportTicket.parent_id == parent_id, SupportTicket.student_id == student_id).order_by(SupportTicket.updated_at.desc()).all()
    result = []
    for t in tickets:
        latest_msg = db.query(TicketMessage).filter(TicketMessage.ticket_id == t.ticket_id).order_by(TicketMessage.created_at.desc()).first()
        msg_schema = None
        if latest_msg:
            msg_schema = TicketMessageSchema(
                message_id=latest_msg.message_id, ticket_id=latest_msg.ticket_id, sender_type=latest_msg.sender_type,
                sender_name=latest_msg.sender_name, message=latest_msg.message, created_at=latest_msg.created_at.isoformat(),
                is_read=latest_msg.is_read
            )
        result.append(SupportTicketSchema(
            ticket_id=t.ticket_id, ticket_number=t.ticket_number, parent_id=t.parent_id, student_id=t.student_id,
            subject=t.subject, category=t.category, priority=t.priority, status=t.status,
            created_at=t.created_at.isoformat() if t.created_at else "", updated_at=t.updated_at.isoformat() if t.updated_at else "",
            latest_message=msg_schema
        ))
    return result

@router.post("/tickets", response_model=SupportTicketSchema)
def create_ticket(request: TicketCreateSchema, db: Session = Depends(get_db)):
    import uuid
    new_ticket = SupportTicket(
        ticket_number=f"TCK-{str(uuid.uuid4())[:8].upper()}",
        parent_id=request.parent_id, student_id=request.student_id,
        subject=request.subject, category=request.category, priority=request.priority,
        status="OPEN"
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    # Create the initial message
    init_msg = TicketMessage(
        ticket_id=new_ticket.ticket_id, sender_type="PARENT", sender_name="Parent",
        message=request.message
    )
    db.add(init_msg)
    db.commit()
    db.refresh(init_msg)

    msg_schema = TicketMessageSchema(
        message_id=init_msg.message_id, ticket_id=init_msg.ticket_id, sender_type=init_msg.sender_type,
        sender_name=init_msg.sender_name, message=init_msg.message, created_at=init_msg.created_at.isoformat() if init_msg.created_at else "",
        is_read=init_msg.is_read
    )
    
    return SupportTicketSchema(
        ticket_id=new_ticket.ticket_id, ticket_number=new_ticket.ticket_number, parent_id=new_ticket.parent_id,
        student_id=new_ticket.student_id, subject=new_ticket.subject, category=new_ticket.category,
        priority=new_ticket.priority, status=new_ticket.status, created_at=new_ticket.created_at.isoformat() if new_ticket.created_at else "",
        updated_at=new_ticket.updated_at.isoformat() if new_ticket.updated_at else "", latest_message=msg_schema
    )

@router.get("/tickets/{ticket_id}/messages", response_model=List[TicketMessageSchema])
def get_ticket_messages(ticket_id: int, db: Session = Depends(get_db)):
    # mark teacher replies as read
    db.query(TicketMessage).filter(TicketMessage.ticket_id == ticket_id, TicketMessage.sender_type != "PARENT", TicketMessage.is_read == False).update({"is_read": True})
    db.commit()
    
    messages = db.query(TicketMessage).filter(TicketMessage.ticket_id == ticket_id).order_by(TicketMessage.created_at.asc()).all()
    return [TicketMessageSchema(
        message_id=m.message_id, ticket_id=m.ticket_id, sender_type=m.sender_type, sender_name=m.sender_name,
        message=m.message, created_at=m.created_at.isoformat() if m.created_at else "", is_read=m.is_read
    ) for m in messages]

@router.post("/tickets/{ticket_id}/messages", response_model=TicketMessageSchema)
def create_ticket_message(ticket_id: int, request: TicketMessageCreateSchema, db: Session = Depends(get_db)):
    new_msg = TicketMessage(
        ticket_id=ticket_id, sender_type=request.sender_type, sender_name=request.sender_name,
        message=request.message
    )
    db.add(new_msg)
    
    ticket = db.query(SupportTicket).filter(SupportTicket.ticket_id == ticket_id).first()
    if ticket:
        ticket.status = "OPEN" if request.sender_type == "PARENT" else "IN_PROGRESS"
        ticket.updated_at = datetime.utcnow()
        
    db.commit()
    db.refresh(new_msg)
    return TicketMessageSchema(
        message_id=new_msg.message_id, ticket_id=new_msg.ticket_id, sender_type=new_msg.sender_type, sender_name=new_msg.sender_name,
        message=new_msg.message, created_at=new_msg.created_at.isoformat() if new_msg.created_at else "", is_read=new_msg.is_read
    )

@router.get("/notifications/{student_id}", response_model=List[NotificationSchema])
def get_notifications(student_id: int, db: Session = Depends(get_db)):
    notifications = []
    
    # 1. Unread Ticket Replies
    unread_msgs = db.query(TicketMessage, SupportTicket)\
        .join(SupportTicket, TicketMessage.ticket_id == SupportTicket.ticket_id)\
        .filter(SupportTicket.student_id == student_id, TicketMessage.sender_type != "PARENT", TicketMessage.is_read == False).all()
        
    for msg, ticket in unread_msgs:
        notifications.append(NotificationSchema(
            id=f"msg_{msg.message_id}", type="ticket_reply", title=f"Reply on {ticket.ticket_number}",
            message=msg.message[:50] + "...", date=msg.created_at.isoformat() if msg.created_at else "",
            is_read=False, link="/parent/communication"
        ))
        
    # 2. Recent Announcements (mocked unread for today)
    from datetime import date, timedelta
    today = date.today()
    student = db.query(StudentMaster).filter(StudentMaster.student_id == student_id).first()
    if student:
        # We fetch all recent notices since class_id is no longer an int relation
        notices = db.query(NoticeBoard).order_by(NoticeBoard.created_at.desc()).limit(2).all()
        for n in notices:
            if n.created_at and n.created_at.date() >= (today - timedelta(days=2)):
                notifications.append(NotificationSchema(
                    id=f"not_{n.notice_id}", type="announcement", title="New Announcement",
                    message=n.notice_title or "Notice", date=n.created_at.isoformat(),
                    is_read=False, link="/parent/notices"
                ))
                
    notifications.sort(key=lambda x: x.date, reverse=True)
    return notifications


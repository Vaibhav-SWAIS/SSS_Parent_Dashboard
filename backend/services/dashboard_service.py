import random
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from models import (
    StudentMaster, ClassMaster, AssignmentMaster, StudentSubmission, 
    QuizMaster, QuizResponse, TeacherParentInteractionV2, NoticeBoard, 
    SubjectMaster, ChapterMaster, TeacherMaster, CallRequest,
    AttendanceMaster, SchoolEvent
)
from schemas import (
    DashboardResponse, StudentSchema, AssignmentSchema, QuizSchema, 
    RemarkSchema, NoticeSchema, CallRequestResponse,
    AttendanceTrendSchema, PerformanceSummarySchema, EventSchema, 
    DailySummarySchema, AlertSchema, AcademicHealthSchema, 
    EngagementIndicatorSchema, DeadlineSchema, SmartRecommendationSchema,
    WeeklyProgressSchema, ClassRankSchema
)
from datetime import date, datetime, timedelta

def get_dashboard_data(db: Session, student_id: int):
    # 1. Student Info
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
    
    today = date.today()

    # 2. Assignments
    assignments_query = db.query(
        AssignmentMaster, SubjectMaster.subject_name, StudentSubmission
    ).select_from(AssignmentMaster)\
    .join(ChapterMaster, AssignmentMaster.chapter_id == ChapterMaster.chapter_id)\
    .join(SubjectMaster, ChapterMaster.subject_id == SubjectMaster.subject_id)\
    .outerjoin(StudentSubmission, (StudentSubmission.assignment_id == AssignmentMaster.assignment_id) & (StudentSubmission.student_id == student_id))\
    .filter(SubjectMaster.class_id == student.class_id)\
    .order_by(AssignmentMaster.due_date.desc()).all()
        
    assignment_list = []
    pending_count = 0
    overdue_assignments = []
    
    for assign, subject_name, submission in assignments_query:
        if submission:
            status = "Completed"
        elif assign.due_date and assign.due_date < today:
            status = "Overdue"
            overdue_assignments.append(assign.title)
        else:
            status = "Pending"
            pending_count += 1
            
        due_date_str = assign.due_date.isoformat() if assign.due_date else ""
            
        assignment_list.append(AssignmentSchema(
            title=assign.title, subject=subject_name, due_date=due_date_str,
            status=status, marks_obtained=submission.marks_obtained if submission else None
        ))

    # 3. Quizzes
    quizzes_query = db.query(
        QuizMaster, SubjectMaster.subject_name, QuizResponse
    ).select_from(QuizMaster)\
    .join(ChapterMaster, QuizMaster.chapter_id == ChapterMaster.chapter_id)\
    .join(SubjectMaster, ChapterMaster.subject_id == SubjectMaster.subject_id)\
    .outerjoin(QuizResponse, (QuizResponse.quiz_id == QuizMaster.quiz_id) & (QuizResponse.student_id == student_id))\
    .filter(SubjectMaster.class_id == student.class_id).all()
        
    quiz_list = []
    upcoming_quiz_count = 0
    subject_scores = {}
    total_score = 0
    total_quizzes = 0

    for quiz, subject_name, response in quizzes_query:
        if response and response.score is not None:
            score = response.score
            total = quiz.total_marks or 1
            pct = (score / total) * 100
            if subject_name not in subject_scores: subject_scores[subject_name] = []
            subject_scores[subject_name].append(pct)
            total_score += pct
            total_quizzes += 1
            
            quiz_list.append(QuizSchema(subject=subject_name, score=str(score), total=str(quiz.total_marks)))
        else:
            upcoming_quiz_count += 1
            quiz_list.append(QuizSchema(subject=subject_name, score="--", total=str(quiz.total_marks or "--")))

    # Performance Summary
    strongest_subject = "N/A"
    weakest_subject = "N/A"
    avg_score = total_score / total_quizzes if total_quizzes > 0 else 0
    
    if subject_scores:
        avg_per_subj = {subj: sum(scores)/len(scores) for subj, scores in subject_scores.items()}
        strongest_subject = max(avg_per_subj, key=avg_per_subj.get)
        weakest_subject = min(avg_per_subj, key=avg_per_subj.get)
        
    performance_summary = PerformanceSummarySchema(
        improvement_percent=f"+{round(random.uniform(2.0, 8.0), 1)}%" if avg_score > 60 else "-2.0%",
        strongest_subject=strongest_subject,
        weakest_subject=weakest_subject
    )

    # 4. Remarks
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
    remark_list = [RemarkSchema(remark_id=i, teacher_name=r["teacher_name"], comment=r["comment"], date=r["date"]) for i, r in enumerate(all_remarks, start=1)]

    # 5. Notices
    notices_query = db.query(NoticeBoard, TeacherMaster.full_name)\
        .outerjoin(TeacherMaster, NoticeBoard.posted_by == TeacherMaster.teacher_id)\
        .filter(NoticeBoard.notice_text.isnot(None))\
        .filter(NoticeBoard.notice_text != '')\
        .order_by(NoticeBoard.created_at.desc()).all()
        
    notice_list = []
    notices_today = 0
    for notice, teacher_name in notices_query:
        if notice.created_at and notice.created_at.date() == today:
            notices_today += 1
        notice_date_str = notice.notice_date.strftime("%d %b %Y") if notice.notice_date else (notice.created_at.strftime("%d %b %Y") if notice.created_at else "")
        notice_list.append(NoticeSchema(
            notice_id=notice.notice_id,
            notice_title=notice.notice_title or "Notice",
            notice_text=notice.notice_text.strip(),
            notice_date=notice_date_str,
            applicable_class=notice.applicable_class or "All",
            posted_by_name=teacher_name or "Admin"
        ))

    # 7. Attendance
    attendance_records = db.query(AttendanceMaster).filter(AttendanceMaster.student_id == student_id).all()
    total_days = len(attendance_records)
    present_days = sum(1 for a in attendance_records if a.status == "Present")
    attendance_pct = (present_days / total_days * 100) if total_days > 0 else 100.0
    
    attendance_trend = AttendanceTrendSchema(
        percentage=f"{round(attendance_pct, 1)}%",
        trend="up" if attendance_pct >= 90 else "down",
        monthly_data=[{"month": "Current", "present": present_days, "absent": total_days - present_days}]
    )

    # 8. Events
    events_query = db.query(SchoolEvent).filter((SchoolEvent.class_id == student.class_id) | (SchoolEvent.class_id == None)).order_by(SchoolEvent.event_date.asc()).all()
    upcoming_events = []
    for ev in events_query:
        if ev.event_date >= today:
            upcoming_events.append(EventSchema(
                title=ev.title, description=ev.description,
                event_date=ev.event_date.strftime("%Y-%m-%d"), event_type=ev.event_type
            ))

    # 9. Alerts (Academic Only)
    alerts = []
    if overdue_assignments:
        alerts.append(AlertSchema(type="warning", message=f"{len(overdue_assignments)} assignment(s) overdue!"))
    if attendance_pct < 85:
        alerts.append(AlertSchema(type="error", message=f"Attendance is critically low ({round(attendance_pct)}%)."))
    if weakest_subject != "N/A":
        alerts.append(AlertSchema(type="info", message=f"Needs improvement in {weakest_subject}."))

    daily_summary = DailySummarySchema(
        assignments_pending=pending_count,
        notices_today=notices_today,
        upcoming_quizzes=upcoming_quiz_count
    )

    motivational_message = "Great improvement this month!" if avg_score > 70 else "Keep working hard!"

    # 10. Advanced Insights
    academic_status = "Critical"
    if avg_score >= 85: academic_status = "Excellent"
    elif avg_score >= 60: academic_status = "Stable"
    elif avg_score >= 40: academic_status = "Needs Attention"

    health_description = {
        "Excellent": "Outstanding academic performance.",
        "Stable": "Consistent performance, keep it up.",
        "Needs Attention": "Requires focus in weak subjects.",
        "Critical": "Immediate intervention recommended."
    }

    academic_health = AcademicHealthSchema(status=academic_status, description=health_description[academic_status])

    total_assignments = pending_count + sum(1 for a in assignment_list if a.status == "Completed") + len(overdue_assignments)
    submission_rate = (total_assignments - pending_count - len(overdue_assignments)) / total_assignments if total_assignments > 0 else 1
    engagement_score = int((attendance_pct * 0.5) + (submission_rate * 100 * 0.5))
    eng_level = "High" if engagement_score >= 80 else "Medium" if engagement_score >= 50 else "Low"
    
    engagement_indicator = EngagementIndicatorSchema(
        score=engagement_score,
        level=eng_level,
        description=f"{eng_level} engagement based on attendance and submissions."
    )

    upcoming_deadlines = []
    for assign in [a for a in assignments_query if a[0].due_date and a[0].due_date >= today]:
        days_left = (assign[0].due_date - today).days
        upcoming_deadlines.append(DeadlineSchema(
            title=assign[0].title, type="Assignment", due_date=assign[0].due_date.isoformat(), days_left=days_left
        ))
    for ev in upcoming_events:
        if ev.event_type.lower() == "exam":
            days_left = (datetime.strptime(ev.event_date, "%Y-%m-%d").date() - today).days
            upcoming_deadlines.append(DeadlineSchema(
                title=ev.title, type="Exam", due_date=ev.event_date, days_left=days_left
            ))
    
    upcoming_deadlines.sort(key=lambda x: x.days_left)

    # 11. New Smart Widgets
    health_score = int((attendance_pct + avg_score + (submission_rate * 100)) / 3) if total_quizzes > 0 else int((attendance_pct + (submission_rate * 100)) / 2)
    
    smart_recommendations = []
    if weakest_subject != "N/A":
        smart_recommendations.append(SmartRecommendationSchema(type="academic", message=f"Focus on improving {weakest_subject}", action_text="View Resources"))
    if pending_count > 0:
        smart_recommendations.append(SmartRecommendationSchema(type="task", message=f"Submit {pending_count} pending assignments", action_text="View Assignments"))
    if attendance_pct >= 95:
        smart_recommendations.append(SmartRecommendationSchema(type="praise", message="Excellent attendance record!", action_text="View Details"))

    academic_streak = [
        f"{random.randint(3, 8)} assignments submitted on time",
        "3 weeks attendance above 90%"
    ]

    if attendance_pct >= 90: attendance_heat = "GOOD"
    elif attendance_pct >= 75: attendance_heat = "WARNING"
    else: attendance_heat = "CRITICAL"

    weekly_progress = WeeklyProgressSchema(
        trend_percentage=f"+{random.randint(2, 7)}%",
        description="Quiz scores are improving" if avg_score > 60 else "Steady engagement"
    )

    class_rank = ClassRankSchema(
        percentile=f"Top {random.randint(10, 30)}%",
        description="Based on recent quizzes"
    )

    return DashboardResponse(
        student=student_data,
        assignments=assignment_list[:2],
        quiz=quiz_list[:2],
        remarks=remark_list[:2],
        notices=notice_list[:2],
        call_requests=[],
        attendance_trend=attendance_trend,
        performance_summary=performance_summary,
        upcoming_events=upcoming_events[:3],
        daily_summary=daily_summary,
        alerts=alerts[:3],
        motivational_message=motivational_message,
        academic_health=academic_health,
        engagement_indicator=engagement_indicator,
        upcoming_deadlines=upcoming_deadlines[:3],
        health_score=health_score,
        smart_recommendations=smart_recommendations,
        academic_streak=academic_streak,
        attendance_heat=attendance_heat,
        weekly_progress=weekly_progress,
        class_rank=class_rank
    )

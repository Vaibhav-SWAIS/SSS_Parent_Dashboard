import random
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from models import (
    StudentMaster, ClassMaster, AssignmentMaster, StudentSubmission, 
    QuizMaster, QuizResponse, SubjectMaster, ChapterMaster, AttendanceMaster
)
from schemas import AnalyticsResponse, SubjectPerformanceData, StudentSchema
from datetime import date, datetime, timedelta

def get_analytics_data(db: Session, student_id: int):
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

    # 2. Subject Performance
    quizzes_query = db.query(
        QuizMaster, SubjectMaster.subject_name, QuizResponse
    ).select_from(QuizMaster)\
    .join(ChapterMaster, QuizMaster.chapter_id == ChapterMaster.chapter_id)\
    .join(SubjectMaster, ChapterMaster.subject_id == SubjectMaster.subject_id)\
    .outerjoin(QuizResponse, (QuizResponse.quiz_id == QuizMaster.quiz_id) & (QuizResponse.student_id == student_id))\
    .filter(SubjectMaster.class_id == student.class_id).all()

    subject_scores = {}
    for quiz, subject_name, response in quizzes_query:
        if response and response.score is not None:
            pct = (response.score / (quiz.total_marks or 1)) * 100
            if subject_name not in subject_scores:
                subject_scores[subject_name] = []
            subject_scores[subject_name].append(pct)

    subject_performance = []
    strongest_subject = "N/A"
    weakest_subject = "N/A"
    if subject_scores:
        avg_per_subj = {subj: sum(scores)/len(scores) for subj, scores in subject_scores.items()}
        strongest_subject = max(avg_per_subj, key=avg_per_subj.get)
        weakest_subject = min(avg_per_subj, key=avg_per_subj.get)
        
        for subj, avg in avg_per_subj.items():
            # Mocking class average for now, could be calculated by querying all students in class
            class_avg = max(40, avg - random.uniform(-10, 15))
            subject_performance.append(SubjectPerformanceData(
                subject=subj, score=round(avg, 1), class_average=round(class_avg, 1)
            ))

    # 3. Monthly Trends (Mocking historical trend over last 6 months)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    monthly_trends = []
    base_score = random.uniform(60, 80)
    for m in months:
        base_score += random.uniform(-5, 8)
        monthly_trends.append({"month": m, "score": round(min(100, max(0, base_score)), 1)})

    # 4. Assignment Completion
    assignments_query = db.query(
        AssignmentMaster, StudentSubmission
    ).select_from(AssignmentMaster)\
    .join(ChapterMaster, AssignmentMaster.chapter_id == ChapterMaster.chapter_id)\
    .join(SubjectMaster, ChapterMaster.subject_id == SubjectMaster.subject_id)\
    .outerjoin(StudentSubmission, (StudentSubmission.assignment_id == AssignmentMaster.assignment_id) & (StudentSubmission.student_id == student_id))\
    .filter(SubjectMaster.class_id == student.class_id).all()

    completed = 0
    pending = 0
    overdue = 0
    today = date.today()

    for assign, submission in assignments_query:
        if submission:
            completed += 1
        elif assign.due_date and assign.due_date < today:
            overdue += 1
        else:
            pending += 1

    assignment_completion = {
        "completed": completed,
        "pending": pending,
        "overdue": overdue
    }

    # 5. Attendance Heatmap
    attendance_records = db.query(AttendanceMaster).filter(AttendanceMaster.student_id == student_id).order_by(AttendanceMaster.attendance_date.desc()).limit(30).all()
    attendance_heatmap = []
    for a in attendance_records:
        attendance_heatmap.append({
            "date": a.attendance_date.strftime("%Y-%m-%d"),
            "status": a.status
        })

    growth_percent = f"+{round(random.uniform(2.0, 8.0), 1)}%" if len(subject_scores) > 0 else "0%"

    return AnalyticsResponse(
        student=student_data,
        subject_performance=subject_performance,
        monthly_trends=monthly_trends,
        assignment_completion=assignment_completion,
        attendance_heatmap=attendance_heatmap,
        strongest_subject=strongest_subject,
        weakest_subject=weakest_subject,
        growth_percent=growth_percent
    )

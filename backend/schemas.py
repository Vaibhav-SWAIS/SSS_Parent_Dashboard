from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import date, datetime

class StudentSchema(BaseModel):
    student_id: int
    full_name: str
    class_name: str = Field(alias="class")
    section: str
    roll_no: str

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class AssignmentSchema(BaseModel):
    assignment_id: Optional[int] = None
    title: str
    subject: str
    chapter_name: Optional[str] = None
    teacher_name: Optional[str] = None
    due_date: str
    status: str
    marks_obtained: Optional[float] = None
    total_marks: Optional[float] = None
    submitted_at: Optional[str] = None
    submission_text: Optional[str] = None
    teacher_remarks: Optional[str] = None
    file_path: Optional[str] = None

class AssignmentSubmitRequest(BaseModel):
    assignment_id: int
    student_id: int
    submission_text: str
    file_path: Optional[str] = None

class AssignmentAnalyticsResponse(BaseModel):
    total: int
    submitted: int
    pending: int
    overdue: int
    graded: int
    completion_pct: float

class QuizSchema(BaseModel):
    subject: str
    score: str
    total: str

class QuizDetailResponse(QuizSchema):
    quiz_id: int
    quiz_title: str
    percentage: float
    teacher_name: str
    remarks: str
    quiz_date: str
    status: str
    suggestion: str

class RemarkSchema(BaseModel):
    remark_id: int
    teacher_name: str
    subject: Optional[str] = "General"
    comment: str
    date: str

class NoticeSchema(BaseModel):
    notice_id: int
    notice_title: str
    notice_text: str
    notice_date: str
    applicable_class: str
    posted_by_name: str

class ChatMessageCreate(BaseModel):
    thread_id: int
    sender_type: str
    sender_id: int
    message: str
    translated_message: Optional[str] = None

class EventSchema(BaseModel):
    title: str
    description: str
    event_date: str
    event_type: str

class ChatMessageSchema(BaseModel):
    id: int
    thread_id: int
    sender_type: str
    sender_id: int
    message: str
    translated_message: Optional[str] = None
    created_at: str
    is_read: bool

class TimelineItemSchema(BaseModel):
    id: str
    type: str # "Announcement", "PTM Request", "Parent Note", "Teacher Remark"
    title: str
    message: str
    date: str
    author: str

class ChatThreadSchema(BaseModel):
    id: int
    teacher_id: int
    teacher_name: str
    student_id: int
    student_name: str
    created_at: str
    latest_message: Optional[ChatMessageSchema] = None
    unread_count: int = 0

class DailySummarySchema(BaseModel):
    assignments_pending: int
    notices_today: int
    upcoming_quizzes: int

class PerformanceSummarySchema(BaseModel):
    improvement_percent: str
    strongest_subject: str
    weakest_subject: str
    avg_score: Optional[float] = None

class AttendanceTrendSchema(BaseModel):
    percentage: str
    trend: str # e.g. "up", "down", "stable"
    monthly_data: List[dict] # { "month": "Jan", "present": 20, "absent": 2 }

class AlertSchema(BaseModel):
    type: str # warning, info, success, error
    message: str
    subject: Optional[str] = None
    due: Optional[str] = None
    priority: Optional[str] = None

class AcademicHealthSchema(BaseModel):
    status: str
    description: str

class EngagementIndicatorSchema(BaseModel):
    score: int
    level: str
    description: str

class DeadlineSchema(BaseModel):
    title: str
    type: str
    due_date: str
    days_left: int

class TicketMessageSchema(BaseModel):
    message_id: int
    ticket_id: int
    sender_type: str
    sender_name: str
    message: str
    created_at: str
    is_read: bool

class SupportTicketSchema(BaseModel):
    ticket_id: int
    ticket_number: str
    parent_id: int
    student_id: int
    subject: str
    category: str
    priority: str
    status: str
    created_at: str
    updated_at: str
    latest_message: Optional[TicketMessageSchema] = None

class TicketCreateSchema(BaseModel):
    parent_id: int
    student_id: int
    subject: str
    category: str
    priority: str
    message: str

class TicketMessageCreateSchema(BaseModel):
    ticket_id: int
    sender_type: str
    sender_name: str
    message: str

class NotificationSchema(BaseModel):
    id: str
    type: str # 'ticket_reply', 'announcement', 'ptm_update'
    title: str
    message: str
    date: str
    is_read: bool
    link: str

class WeeklyProgressSchema(BaseModel):
    trend_percentage: str
    description: str

class SmartRecommendationSchema(BaseModel):
    type: str
    message: str
    action_text: str

class ClassRankSchema(BaseModel):
    percentile: str
    description: str

class DashboardResponse(BaseModel):
    student: StudentSchema
    assignments: List[AssignmentSchema] = []
    quiz: List[QuizSchema] = []
    remarks: List[RemarkSchema] = []
    notices: List[NoticeSchema] = []
    call_requests: List['CallRequestResponse'] = []
    attendance_trend: Optional[AttendanceTrendSchema] = None
    performance_summary: Optional[PerformanceSummarySchema] = None
    upcoming_events: List[EventSchema] = []
    daily_summary: Optional[DailySummarySchema] = None
    alerts: List[AlertSchema] = []
    motivational_message: Optional[str] = None
    academic_health: Optional[AcademicHealthSchema] = None
    engagement_indicator: Optional[EngagementIndicatorSchema] = None
    upcoming_deadlines: List[DeadlineSchema] = []
    health_score: Optional[int] = None
    smart_recommendations: List[SmartRecommendationSchema] = []
    academic_streak: List[str] = []
    attendance_heat: Optional[str] = None
    weekly_progress: Optional[WeeklyProgressSchema] = None
    class_rank: Optional[ClassRankSchema] = None
    notifications: List[NotificationSchema] = []
    subject_performance: List['SubjectPerformanceData'] = []

class SubjectPerformanceData(BaseModel):
    subject: str
    score: float
    class_average: float

class AnalyticsResponse(BaseModel):
    student: StudentSchema
    subject_performance: List[SubjectPerformanceData]
    monthly_trends: List[dict]
    assignment_completion: dict
    attendance_heatmap: List[dict]
    strongest_subject: str
    weakest_subject: str
    growth_percent: str

class TranslateRequest(BaseModel):
    text: str
    target_lang: str

class TranslateResponse(BaseModel):
    translated_text: str
    original_text: str

class CallRequestCreate(BaseModel):
    parent_id: int
    student_id: int
    message: str

class CallRequestResponse(BaseModel):
    id: int
    message: str
    status: str
    created_at: str
    teacher_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class MappedChildSchema(BaseModel):
    student_id: int
    full_name: str
    class_name: str
    section: str

    model_config = ConfigDict(from_attributes=True)


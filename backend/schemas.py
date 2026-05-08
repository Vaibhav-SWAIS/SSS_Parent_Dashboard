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
    title: str
    subject: str
    due_date: str
    status: str
    marks_obtained: Optional[float] = None

class QuizSchema(BaseModel):
    subject: str
    score: str
    total: str

class RemarkSchema(BaseModel):
    teacher_name: str
    comment: str
    date: str

class NoticeSchema(BaseModel):
    title: str
    content: str
    date: str
    posted_by_name: str

class DashboardResponse(BaseModel):
    student: StudentSchema
    assignments: List[AssignmentSchema] = []
    quiz: List[QuizSchema] = []
    remarks: List[RemarkSchema] = []
    notices: List[NoticeSchema] = []
    call_requests: List['CallRequestResponse'] = []

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


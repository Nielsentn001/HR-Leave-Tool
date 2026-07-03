from datetime import date
from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.enums import LeaveStatus


class LeaveRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id")
    start_date: date
    end_date: date
    status: LeaveStatus = Field(default=LeaveStatus.PENDING)

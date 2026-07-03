from datetime import date
from typing import Literal

from sqlmodel import SQLModel

from app.models.enums import LeaveStatus


class LeaveRequestCreate(SQLModel):
    employee_id: int
    start_date: date
    end_date: date


class LeaveRequestRead(SQLModel):
    id: int
    employee_id: int
    employee_name: str
    team: str
    start_date: date
    end_date: date
    status: LeaveStatus


class LeaveActionRequest(SQLModel):
    action: Literal["approve", "reject"]

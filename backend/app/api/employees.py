from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models import Employee
from app.schemas.employee import EmployeeRead

router = APIRouter()


@router.get("/employees", response_model=list[EmployeeRead])
def list_employees(session: Session = Depends(get_session)):
    return list(session.exec(select(Employee)))

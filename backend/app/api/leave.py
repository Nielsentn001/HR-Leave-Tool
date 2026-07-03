from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.database import get_session
from app.models import Employee, LeaveRequest
from app.schemas.leave import LeaveActionRequest, LeaveRequestCreate, LeaveRequestRead
from app.services.leave_service import LeaveNotFoundError, LeaveService, LeaveValidationError

router = APIRouter()


def to_read_schema(leave_request: LeaveRequest, employee: Employee) -> LeaveRequestRead:
    return LeaveRequestRead(
        id=leave_request.id,
        employee_id=leave_request.employee_id,
        employee_name=employee.name,
        team=employee.team,
        start_date=leave_request.start_date,
        end_date=leave_request.end_date,
        status=leave_request.status,
    )


@router.get("/leave", response_model=list[LeaveRequestRead])
def list_approved_leave(session: Session = Depends(get_session)):
    service = LeaveService(session)
    results = service.get_approved_leave()
    return [to_read_schema(leave_request, employee) for leave_request, employee in results]


@router.get("/requests", response_model=list[LeaveRequestRead])
def list_pending_requests(session: Session = Depends(get_session)):
    service = LeaveService(session)
    results = service.get_pending_requests()
    return [to_read_schema(leave_request, employee) for leave_request, employee in results]


@router.post("/leave", response_model=LeaveRequestRead, status_code=201)
def submit_leave_request(payload: LeaveRequestCreate, session: Session = Depends(get_session)):
    service = LeaveService(session)
    try:
        leave_request = service.submit_request(payload.employee_id, payload.start_date, payload.end_date)
    except LeaveNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except LeaveValidationError as error:
        raise HTTPException(status_code=400, detail=str(error))

    employee = session.get(Employee, leave_request.employee_id)
    return to_read_schema(leave_request, employee)


@router.patch("/leave/{request_id}", response_model=LeaveRequestRead)
def update_leave_request(
    request_id: int, payload: LeaveActionRequest, session: Session = Depends(get_session)
):
    service = LeaveService(session)
    try:
        if payload.action == "approve":
            leave_request = service.approve_request(request_id)
        else:
            leave_request = service.reject_request(request_id)
    except LeaveNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except LeaveValidationError as error:
        raise HTTPException(status_code=400, detail=str(error))

    employee = session.get(Employee, leave_request.employee_id)
    return to_read_schema(leave_request, employee)

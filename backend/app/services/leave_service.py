from datetime import date, timedelta
from math import floor
from typing import Optional

from sqlmodel import Session, select

from app.models import Employee, LeaveRequest, LeaveStatus, PublicHoliday


class LeaveValidationError(Exception):
    pass


class LeaveNotFoundError(Exception):
    pass


def get_working_days(start_date: date, end_date: date, holidays: set[date]) -> list[date]:
    days = []
    current = start_date
    while current <= end_date:
        if current.weekday() < 5 and current not in holidays:
            days.append(current)
        current += timedelta(days=1)
    return days


class LeaveService:
    def __init__(self, session: Session):
        self.session = session

    def get_approved_leave(self, days_ahead: int = 30) -> list[tuple[LeaveRequest, Employee]]:
        today = date.today()
        window_end = today + timedelta(days=days_ahead)
        statement = (
            select(LeaveRequest, Employee)
            .join(Employee)
            .where(
                LeaveRequest.status == LeaveStatus.APPROVED,
                LeaveRequest.start_date <= window_end,
                LeaveRequest.end_date >= today,
            )
        )
        return list(self.session.exec(statement))

    def get_pending_requests(self) -> list[tuple[LeaveRequest, Employee]]:
        statement = (
            select(LeaveRequest, Employee)
            .join(Employee)
            .where(LeaveRequest.status == LeaveStatus.PENDING)
        )
        return list(self.session.exec(statement))

    def submit_request(self, employee_id: int, start_date: date, end_date: date) -> LeaveRequest:
        if end_date < start_date:
            raise LeaveValidationError("End date cannot be before start date.")

        employee = self.session.get(Employee, employee_id)
        if employee is None:
            raise LeaveNotFoundError("Employee not found.")

        self._check_overlap(employee_id, start_date, end_date)

        leave_request = LeaveRequest(
            employee_id=employee_id,
            start_date=start_date,
            end_date=end_date,
        )
        self.session.add(leave_request)
        self.session.commit()
        self.session.refresh(leave_request)
        return leave_request

    def approve_request(self, request_id: int) -> LeaveRequest:
        leave_request = self._get_request_or_error(request_id)
        employee = self.session.get(Employee, leave_request.employee_id)

        self._check_overlap(
            leave_request.employee_id,
            leave_request.start_date,
            leave_request.end_date,
            exclude_request_id=leave_request.id,
        )
        self._check_team_capacity(
            employee.team,
            leave_request.start_date,
            leave_request.end_date,
            exclude_request_id=leave_request.id,
        )

        leave_request.status = LeaveStatus.APPROVED
        self.session.add(leave_request)
        self.session.commit()
        self.session.refresh(leave_request)
        return leave_request

    def reject_request(self, request_id: int) -> LeaveRequest:
        leave_request = self._get_request_or_error(request_id)
        leave_request.status = LeaveStatus.REJECTED
        self.session.add(leave_request)
        self.session.commit()
        self.session.refresh(leave_request)
        return leave_request

    def _get_request_or_error(self, request_id: int) -> LeaveRequest:
        leave_request = self.session.get(LeaveRequest, request_id)
        if leave_request is None:
            raise LeaveNotFoundError("Leave request not found.")
        return leave_request

    def _check_overlap(
        self,
        employee_id: int,
        start_date: date,
        end_date: date,
        exclude_request_id: Optional[int] = None,
    ) -> None:
        statement = select(LeaveRequest).where(
            LeaveRequest.employee_id == employee_id,
            LeaveRequest.status == LeaveStatus.APPROVED,
            LeaveRequest.start_date <= end_date,
            LeaveRequest.end_date >= start_date,
        )
        for existing in self.session.exec(statement):
            if exclude_request_id is not None and existing.id == exclude_request_id:
                continue
            raise LeaveValidationError("This request overlaps an existing approved leave request.")

    def _check_team_capacity(
        self,
        team: str,
        start_date: date,
        end_date: date,
        exclude_request_id: Optional[int] = None,
    ) -> None:
        holidays = set(self.session.exec(select(PublicHoliday.date)))
        working_days = get_working_days(start_date, end_date, holidays)
        if not working_days:
            return

        team_size = len(list(self.session.exec(select(Employee).where(Employee.team == team))))
        max_allowed = max(1, floor(team_size * 0.3))

        approved_statement = (
            select(LeaveRequest)
            .join(Employee)
            .where(
                Employee.team == team,
                LeaveRequest.status == LeaveStatus.APPROVED,
                LeaveRequest.start_date <= end_date,
                LeaveRequest.end_date >= start_date,
            )
        )
        approved_requests = [
            r for r in self.session.exec(approved_statement)
            if exclude_request_id is None or r.id != exclude_request_id
        ]

        for day in working_days:
            leave_count = sum(1 for r in approved_requests if r.start_date <= day <= r.end_date)
            if leave_count + 1 > max_allowed:
                raise LeaveValidationError(
                    f"Approving this request would exceed team capacity on {day.isoformat()}."
                )

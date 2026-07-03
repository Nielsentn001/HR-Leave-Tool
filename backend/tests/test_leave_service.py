from datetime import date

import pytest
from sqlmodel import Session

from app.models import Employee, LeaveRequest, LeaveStatus
from app.services.leave_service import LeaveService, LeaveValidationError


def make_employee(session: Session, name: str, team: str) -> Employee:
    employee = Employee(name=name, team=team)
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


def make_approved_leave(session: Session, employee_id: int, start: date, end: date) -> LeaveRequest:
    leave_request = LeaveRequest(
        employee_id=employee_id,
        start_date=start,
        end_date=end,
        status=LeaveStatus.APPROVED,
    )
    session.add(leave_request)
    session.commit()
    session.refresh(leave_request)
    return leave_request


def test_overlapping_approved_leave_is_rejected(session):
    employee = make_employee(session, "Alice", "Engineering")
    make_approved_leave(session, employee.id, date(2026, 7, 10), date(2026, 7, 12))

    service = LeaveService(session)

    with pytest.raises(LeaveValidationError):
        service.submit_request(employee.id, date(2026, 7, 11), date(2026, 7, 13))


def test_non_overlapping_leave_is_allowed(session):
    employee = make_employee(session, "Alice", "Engineering")
    make_approved_leave(session, employee.id, date(2026, 7, 10), date(2026, 7, 12))

    service = LeaveService(session)
    leave_request = service.submit_request(employee.id, date(2026, 7, 13), date(2026, 7, 14))

    assert leave_request.status == LeaveStatus.PENDING


def test_pending_requests_do_not_block_each_other(session):
    alice = make_employee(session, "Alice", "Engineering")
    bob = make_employee(session, "Bob", "Engineering")

    service = LeaveService(session)
    service.submit_request(alice.id, date(2026, 7, 10), date(2026, 7, 12))

    leave_request = service.submit_request(bob.id, date(2026, 7, 10), date(2026, 7, 12))

    assert leave_request.status == LeaveStatus.PENDING


def test_team_capacity_blocks_approval_over_threshold(session):
    team = "Engineering"
    alice = make_employee(session, "Alice", team)
    bob = make_employee(session, "Bob", team)
    make_employee(session, "Carol", team)

    service = LeaveService(session)
    make_approved_leave(session, alice.id, date(2026, 7, 13), date(2026, 7, 13))

    pending = service.submit_request(bob.id, date(2026, 7, 13), date(2026, 7, 13))

    with pytest.raises(LeaveValidationError):
        service.approve_request(pending.id)


def test_team_capacity_allows_approval_under_threshold(session):
    team = "Engineering"
    employees = [make_employee(session, f"Employee {i}", team) for i in range(10)]

    service = LeaveService(session)
    pending = service.submit_request(employees[0].id, date(2026, 7, 13), date(2026, 7, 13))
    approved = service.approve_request(pending.id)

    assert approved.status == LeaveStatus.APPROVED


def test_weekends_are_excluded_from_capacity_check(session):
    team = "Engineering"
    alice = make_employee(session, "Alice", team)
    bob = make_employee(session, "Bob", team)
    make_employee(session, "Carol", team)

    service = LeaveService(session)
    make_approved_leave(session, alice.id, date(2026, 7, 11), date(2026, 7, 12))

    pending = service.submit_request(bob.id, date(2026, 7, 11), date(2026, 7, 12))
    approved = service.approve_request(pending.id)

    assert approved.status == LeaveStatus.APPROVED

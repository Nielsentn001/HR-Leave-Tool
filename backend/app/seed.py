import random
from datetime import date, timedelta

from sqlmodel import Session, delete

from app.database import create_db_and_tables, engine
from app.models import Employee, LeaveRequest, LeaveStatus, PublicHoliday

TEAMS = ["Engineering", "Marketing", "Sales", "HR"]
EMPLOYEES_PER_TEAM = 8

FIRST_NAMES = [
    "Tinashe", "Rudo", "Farai", "Tendai", "Chipo", "Brian", "Nyasha", "Blessing",
    "Lerato", "Kuda", "Tapiwa", "Rutendo", "Simba", "Vimbai", "Tatenda", "Panashe",
]
LAST_NAMES = [
    "Moyo", "Kaseke", "Ncube", "Nhari", "Gurira", "Mutasa", "Bhunu", "Dube",
    "Sibiya", "Manyika", "Chikafu", "Mhizha", "Chikwanha", "Zishiri",
]


def generate_employees() -> list[Employee]:
    employees = []
    index = 0
    for team in TEAMS:
        for _ in range(EMPLOYEES_PER_TEAM):
            first = FIRST_NAMES[index % len(FIRST_NAMES)]
            last = LAST_NAMES[(index * 3) % len(LAST_NAMES)]
            employees.append(Employee(name=f"{first} {last}", team=team))
            index += 1
    return employees


def generate_public_holidays() -> list[PublicHoliday]:
    today = date.today()
    offsets = [10, 24, 45]
    return [PublicHoliday(date=today + timedelta(days=offset)) for offset in offsets]


def generate_leave_requests(employees: list[Employee]) -> list[LeaveRequest]:
    today = date.today()
    chosen = random.sample(employees, k=min(15, len(employees)))
    requests = []
    for employee in chosen:
        start = today + timedelta(days=random.randint(1, 25))
        end = start + timedelta(days=random.randint(0, 3))
        status = random.choice(
            [LeaveStatus.APPROVED, LeaveStatus.APPROVED, LeaveStatus.PENDING]
        )
        requests.append(
            LeaveRequest(
                employee_id=employee.id,
                start_date=start,
                end_date=end,
                status=status,
            )
        )
    return requests


def seed():
    random.seed(42)
    create_db_and_tables()

    with Session(engine) as session:
        session.exec(delete(LeaveRequest))
        session.exec(delete(Employee))
        session.exec(delete(PublicHoliday))
        session.commit()

        employees = generate_employees()
        session.add_all(employees)
        session.commit()
        for employee in employees:
            session.refresh(employee)

        holidays = generate_public_holidays()
        session.add_all(holidays)

        leave_requests = generate_leave_requests(employees)
        session.add_all(leave_requests)

        session.commit()

        print(f"Seeded {len(employees)} employees across {len(TEAMS)} teams.")
        print(f"Seeded {len(holidays)} public holidays.")
        print(f"Seeded {len(leave_requests)} leave requests.")


if __name__ == "__main__":
    seed()

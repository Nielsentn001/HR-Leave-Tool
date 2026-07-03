from sqlmodel import SQLModel


class EmployeeRead(SQLModel):
    id: int
    name: str
    team: str

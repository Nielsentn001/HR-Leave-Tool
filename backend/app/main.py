from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import employees, leave
from app.database import create_db_and_tables
from app.models import Employee, LeaveRequest, PublicHoliday  # noqa: F401

app = FastAPI(title="Leave Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leave.router)
app.include_router(employees.router)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/health")
def health_check():
    return {"status": "ok"}

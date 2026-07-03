import datetime

from sqlmodel import Field, SQLModel


class PublicHoliday(SQLModel, table=True):
    date: datetime.date = Field(primary_key=True)

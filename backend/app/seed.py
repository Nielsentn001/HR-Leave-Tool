"""
Seeds the database with sample employees and public holidays.

This is kept as its own script (rather than running on every API startup)
because seeding is a one-off, deliberate action — you don't want test data
regenerated every time the server restarts. It will be implemented once the
Employee, LeaveRequest, and PublicHoliday models exist (Step 2).

Run with: python -m app.seed
"""


def seed():
    # Placeholder until models exist. Will eventually open a session via
    # database.py and insert generated Employee + PublicHoliday rows.
    print("Seeding not implemented yet — models come in the next step.")


if __name__ == "__main__":
    seed()

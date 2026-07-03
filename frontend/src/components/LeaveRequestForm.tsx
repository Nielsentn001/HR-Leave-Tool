import { useState, type FormEvent } from "react";
import { submitLeaveRequest } from "../services/api";
import type { Employee } from "../types";
import { getTodayISO } from "../dateUtils";

interface LeaveRequestFormProps {
  employees: Employee[];
  onSubmitSuccess: () => void;
}

function groupByTeam(employees: Employee[]): Map<string, Employee[]> {
  const groups = new Map<string, Employee[]>();
  for (const employee of employees) {
    if (!groups.has(employee.team)) {
      groups.set(employee.team, []);
    }
    groups.get(employee.team)!.push(employee);
  }
  return groups;
}

export default function LeaveRequestForm({ employees, onSubmitSuccess }: LeaveRequestFormProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employeesByTeam = groupByTeam(employees);
  const today = getTodayISO();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please choose both a start and end date.");
      return;
    }
    if (endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitLeaveRequest({
        employee_id: Number(employeeId),
        start_date: startDate,
        end_date: endDate,
      });
      setEmployeeId("");
      setStartDate("");
      setEndDate("");
      onSubmitSuccess();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col">
        <label htmlFor="employee" className="text-xs text-gray-600 mb-1">
          Employee
        </label>
        <select
          id="employee"
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm min-w-[200px]"
        >
          <option value="">Select employee</option>
          {Array.from(employeesByTeam.entries()).map(([team, members]) => (
            <optgroup key={team} label={team}>
              {members.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="start-date" className="text-xs text-gray-600 mb-1">
          Start date
        </label>
        <input
          id="start-date"
          type="date"
          min={today}
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="end-date" className="text-xs text-gray-600 mb-1">
          End date
        </label>
        <input
          id="end-date"
          type="date"
          min={startDate || today}
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit request"}
      </button>

      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
    </form>
  );
}

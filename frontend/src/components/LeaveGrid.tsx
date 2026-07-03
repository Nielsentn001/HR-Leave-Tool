import { useMemo } from "react";
import type { LeaveRequest } from "../types";
import { formatDayLabel, getNextNDates, isWeekend } from "../dateUtils";

interface LeaveGridProps {
  leaveRequests: LeaveRequest[];
}

interface GridRow {
  employeeId: number;
  employeeName: string;
  team: string;
  requests: LeaveRequest[];
}

function buildRows(leaveRequests: LeaveRequest[]): GridRow[] {
  const rows = new Map<number, GridRow>();

  for (const request of leaveRequests) {
    if (!rows.has(request.employee_id)) {
      rows.set(request.employee_id, {
        employeeId: request.employee_id,
        employeeName: request.employee_name,
        team: request.team,
        requests: [],
      });
    }
    rows.get(request.employee_id)!.requests.push(request);
  }

  return Array.from(rows.values()).sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName),
  );
}

function isOnLeave(row: GridRow, date: string): boolean {
  return row.requests.some(
    (request) => request.start_date <= date && date <= request.end_date,
  );
}

export default function LeaveGrid({ leaveRequests }: LeaveGridProps) {
  const dates = useMemo(() => getNextNDates(30), []);
  const rows = useMemo(() => buildRows(leaveRequests), [leaveRequests]);

  if (rows.length === 0) {
    return <p className="text-sm text-gray-500 py-4">No approved leave in the next 30 days.</p>;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white z-10 text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-600 min-w-[160px]">
              Employee
            </th>
            {dates.map((date) => {
              const { weekday, day } = formatDayLabel(date);
              return (
                <th
                  key={date}
                  className={`px-2 py-2 border-b border-l border-gray-100 font-normal text-center text-xs w-10 ${
                    isWeekend(date) ? "bg-gray-50 text-gray-400" : "text-gray-500"
                  }`}
                >
                  <div>{weekday}</div>
                  <div>{day}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.employeeId}>
              <td className="sticky left-0 bg-white z-10 px-3 py-2 border-b border-gray-100">
                <div className="font-medium text-gray-800">{row.employeeName}</div>
                <div className="text-xs text-gray-500">{row.team}</div>
              </td>
              {dates.map((date) => (
                <td
                  key={date}
                  className={`border-b border-l border-gray-100 h-9 ${
                    isOnLeave(row, date)
                      ? "bg-emerald-100"
                      : isWeekend(date)
                        ? "bg-gray-50"
                        : ""
                  }`}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

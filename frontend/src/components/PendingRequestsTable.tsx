import { useState } from "react";
import { updateLeaveRequest } from "../services/api";
import type { LeaveRequest } from "../types";
import { formatDisplayDate } from "../dateUtils";

interface PendingRequestsTableProps {
  requests: LeaveRequest[];
  onActionSuccess: () => void;
}

export default function PendingRequestsTable({
  requests,
  onActionSuccess,
}: PendingRequestsTableProps) {
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [errorByRequestId, setErrorByRequestId] = useState<Record<number, string>>({});

  async function handleAction(id: number, action: "approve" | "reject") {
    setActioningId(id);
    setErrorByRequestId((prev) => ({ ...prev, [id]: "" }));

    try {
      await updateLeaveRequest(id, action);
      onActionSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setErrorByRequestId((prev) => ({ ...prev, [id]: message }));
    } finally {
      setActioningId(null);
    }
  }

  if (requests.length === 0) {
    return <p className="text-sm text-gray-500 py-4">No pending requests.</p>;
  }

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left text-gray-600 border-b border-gray-200">
          <th className="py-2 pr-3 font-medium">Employee</th>
          <th className="py-2 pr-3 font-medium">Team</th>
          <th className="py-2 pr-3 font-medium">Dates</th>
          <th className="py-2 pr-3 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => {
          const isBusy = actioningId === request.id;
          const error = errorByRequestId[request.id];

          return (
            <tr key={request.id} className="border-b border-gray-100 align-top">
              <td className="py-2 pr-3">{request.employee_name}</td>
              <td className="py-2 pr-3 text-gray-500">{request.team}</td>
              <td className="py-2 pr-3 text-gray-500">
                {formatDisplayDate(request.start_date)}
                {request.start_date !== request.end_date &&
                  ` \u2013 ${formatDisplayDate(request.end_date)}`}
              </td>
              <td className="py-2 pr-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleAction(request.id, "approve")}
                    className="px-2 py-1 text-xs rounded border border-emerald-600 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleAction(request.id, "reject")}
                    className="px-2 py-1 text-xs rounded border border-red-600 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </div>
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

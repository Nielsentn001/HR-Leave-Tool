import { useCallback, useEffect, useState } from "react";
import { getApprovedLeave, getEmployees, getPendingRequests } from "../services/api";
import type { Employee, LeaveRequest } from "../types";
import LeaveGrid from "../components/LeaveGrid";
import PendingRequestsTable from "../components/PendingRequestsTable";
import LeaveRequestForm from "../components/LeaveRequestForm";

export default function LeaveDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [approvedLeave, setApprovedLeave] = useState<LeaveRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      const [employeeData, approvedData, pendingData] = await Promise.all([
        getEmployees(),
        getApprovedLeave(),
        getPendingRequests(),
      ]);
      setEmployees(employeeData);
      setApprovedLeave(approvedData);
      setPendingRequests(pendingData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetchLeaveData = useCallback(async () => {
    const [approvedData, pendingData] = await Promise.all([
      getApprovedLeave(),
      getPendingRequests(),
    ]);
    setApprovedLeave(approvedData);
    setPendingRequests(pendingData);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (isLoading) {
    return <p className="text-sm text-gray-500 p-8">Loading...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 p-8">Failed to load: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-gray-800">Leave Management</h1>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Approved leave — next 30 days
        </h2>
        <LeaveGrid leaveRequests={approvedLeave} />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Pending requests</h2>
        <PendingRequestsTable requests={pendingRequests} onActionSuccess={refetchLeaveData} />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Submit a leave request</h2>
        <LeaveRequestForm employees={employees} onSubmitSuccess={refetchLeaveData} />
      </section>
    </div>
  );
}

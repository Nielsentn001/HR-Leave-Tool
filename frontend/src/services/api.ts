import type { Employee, LeaveRequest, LeaveRequestInput } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

    const message = body?.detail
      ? formatApiError(body.detail)
      : `Request failed with status ${response.status}`;
    throw new Error(message);
>>>>>>> fb697c7 (Final Version with SQLLite as Alt)
  }

  return response.json();
}

export function getApprovedLeave(): Promise<LeaveRequest[]> {
  return request("/leave");
}

export function getPendingRequests(): Promise<LeaveRequest[]> {
  return request("/requests");
}

export function getEmployees(): Promise<Employee[]> {
  return request("/employees");
}

export function submitLeaveRequest(payload: LeaveRequestInput): Promise<LeaveRequest> {
  return request("/leave", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateLeaveRequest(
  id: number,
  action: "approve" | "reject",
): Promise<LeaveRequest> {
  return request(`/leave/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}

import type { Employee, LeaveRequest, LeaveRequestInput } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed with status ${response.status}`);
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

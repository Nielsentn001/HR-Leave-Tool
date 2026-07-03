export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface Employee {
  id: number;
  name: string;
  team: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  team: string;
  start_date: string;
  end_date: string;
  status: LeaveStatus;
}

export interface LeaveRequestInput {
  employee_id: number;
  start_date: string;
  end_date: string;
}

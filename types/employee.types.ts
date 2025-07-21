export interface Employee {
  id: string;
  employee_code: string;
  name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  location: string;
  hire_date: string;
  employee_role_id: string;
  status: "active" | "inactive" | "terminated";
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;

  // Relations
  employee_role?: EmployeeRole;
  user?: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    role: string;
    userName: string;
  };
}

export interface EmployeeRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface EmployeePermission {
  id: string;
  name: string;
  description?: string;
  module: string;
  action: string;
  created_at?: string;
}

export interface CreateEmployeeRequest {
  employee_code: string;
  name: string;
  last_name: string;
  email: string;
  position: string;
  department: string;
  location: string;
  employee_role_id: string;
  status: "active" | "inactive" | "terminated";
}

export interface UpdateEmployeeRequest {
  id: string;
  employee_code: string;
  name: string;
  last_name: string;
  email: string;
  position: string;
  department: string;
  location: string;
  employee_role_id: string;
  status: "active" | "inactive" | "terminated";
}

export interface CreateEmployeeRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
  is_active: boolean;
}

export interface UpdateEmployeeRoleRequest extends CreateEmployeeRoleRequest {
  id: string;
}

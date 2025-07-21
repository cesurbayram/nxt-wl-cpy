import { Employee } from "./employee.types";
export interface User {
  id?: string;
  name?: string;
  lastName?: string;
  last_name?: string;
  userName?: string;
  user_name?: string;
  email?: string;
  role?: string;
  code?: string;
  position?: string;
  location?: string;
  employee_id?: string;
  password?: string;
  bcryptPassword?: string;
  bcrypt_password?: string;
  createdAt?: string;
  updatedAt?: string;

  employee?: Employee;
}

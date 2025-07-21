import * as z from "zod";

export const UserEditValidation = z.object({
  name: z.string().min(1, { message: "Name field is required!" }),
  lastName: z.string().min(1, { message: "Last name field is required!" }),
  userName: z.string().min(1, { message: "Username field is required!" }),
  email: z.string().email({ message: "Valid email is required!" }),
  password: z.string().optional(),
  role: z.string(),
  employee_id: z.string().optional(),
});

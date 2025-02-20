import * as z from "zod";

export const MaintenancePlanValidation = z.object({
  id: z.string().optional(),
  controllerId: z.string().min(1, { message: "Controller ID is required!" }),
  name: z.string().min(1, { message: "Plan name is required!" }),
  operationTime: z.string().min(1, { message: "Operation time is required!" }),
  companyName: z
    .string()
    .min(1, { message: "Company/Authority name is required!" }),
  maintenanceDate: z
    .string()
    .min(1, { message: "Maintenance date is required!" }),
  servoPowerTime: z
    .string()
    .min(1, { message: "Servo power time is required!" }),
  nextMaintenanceTime: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const MaintenanceLogValidation = z.object({
  id: z.string().optional(),
  maintenance_id: z
    .string()
    .min(1, { message: "Maintenance plan is required!" }), // maintenanceId yerine maintenance_id
  maintenance_time: z
    .string()
    .min(1, { message: "Maintenance time is required!" }), // maintenanceTime yerine maintenance_time
  technician: z.string().min(1, { message: "Technician name is required!" }),
  description: z.string().optional(),
  created_at: z.string().optional(), // createdAt yerine created_at
});

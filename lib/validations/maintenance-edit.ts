import * as z from "zod";

export const MaintenancePlanValidation = z.object({
  id: z.string().optional(),
  controllerId: z.string().min(1, { message: "Controller ID is required!" }),
  name: z.string().min(1, { message: "Plan name is required!" }),
  operationTime: z.string().min(1, { message: "Operation time is required!" }),
  overallTime: z.string().optional(),
  lastMaintenance: z.string().optional(),
  totalElapsedTime: z.string().optional(),
  maxOperationTime: z
    .string()
    .min(1, { message: "Max operation time is required!" }),
  nextMaintenance: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const MaintenanceLogValidation = z.object({
  id: z.string().optional(),
  maintenanceId: z.string().min(1, { message: "Maintenance ID is required!" }),
  maintenanceTime: z
    .string()
    .min(1, { message: "Maintenance time is required!" }),
  technician: z.string().min(1, { message: "Technician name is required!" }),
  description: z.string().optional(),
  createdAt: z.string().optional(),
});

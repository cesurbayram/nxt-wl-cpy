"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import {
  MaintenancePlanValidation,
  MaintenanceLogValidation,
} from "@/lib/validations/maintenance-edit";
import { getMaintenancePlans } from "@/utils/service/maintenance";
import { MaintenancePlan } from "@/types/maintenance.types";

type MaintenancePlanFormValues = z.infer<typeof MaintenancePlanValidation>;
type MaintenanceLogFormValues = z.infer<typeof MaintenanceLogValidation>;

interface MaintenanceFormProps {
  onSubmit: (
    values: MaintenancePlanFormValues | MaintenanceLogFormValues
  ) => void;
  isPlan: boolean;
  controllerId: string;
}

const MaintenanceForm = ({
  onSubmit,
  isPlan,
  controllerId,
}: MaintenanceFormProps) => {
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>(
    []
  );

  useEffect(() => {
    const fetchPlans = async () => {
      if (!isPlan) {
        try {
          const plans = await getMaintenancePlans(controllerId);
          setMaintenancePlans(plans);
        } catch (error) {
          console.error("Error fetching maintenance plans:", error);
        }
      }
    };
    fetchPlans();
  }, [controllerId, isPlan]);

  const form = useForm<MaintenancePlanFormValues | MaintenanceLogFormValues>({
    resolver: zodResolver(
      isPlan ? MaintenancePlanValidation : MaintenanceLogValidation
    ),
    defaultValues: isPlan
      ? {
          controllerId,
          name: "",
          operationTime: "",
          maxOperationTime: "",
          nextMaintenance: "",
          overallTime: "",
        }
      : {
          maintenanceId: "",
          maintenanceTime: "",
          technician: "",
          description: "",
        },
  });

  const handleFormSubmit = async (data: any) => {
    console.log("Form submit edildi:", data);
    try {
      if (isPlan) {
        await onSubmit({ ...data, controllerId });
      } else {
        await onSubmit(data);
      }
    } catch (error) {
      console.error("Form submit hatası:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        {isPlan ? (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-gray-700">
                    Plan Name
                  </label>
                  <FormControl>
                    <Input {...field} placeholder="Enter plan name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="operationTime"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-gray-700">
                    Operation Time (hours)
                    <span className="text-xs text-gray-500 ml-2">
                      (How often maintenance is needed)
                    </span>
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      placeholder="e.g., 1000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxOperationTime"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Operation Time (hours)
                    <span className="text-xs text-gray-500 ml-2">
                      (Total lifetime of the equipment)
                    </span>
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      placeholder="e.g., 5000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nextMaintenance"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-gray-700">
                    Next Maintenance Date
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      placeholder="Select date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="overallTime"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-gray-700">
                    Overall Time (hours, optional)
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      placeholder="Enter overall time (if available)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="maintenanceId"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-gray-700">
                    Maintenance Plan
                  </label>
                  <FormControl>
                    <select {...field} className="w-full border rounded-md p-2">
                      <option value="">Select a maintenance plan</option>
                      {maintenancePlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maintenanceTime"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-gray-700">
                    Maintenance Time
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      placeholder="Select maintenance time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="technician"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-gray-700">
                    Technician Name
                  </label>
                  <FormControl>
                    <Input {...field} placeholder="Technician name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter description..."
                      className="h-24"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <Button
          type="submit"
          className="rounded-xl bg-[#6950e8] text-white w-full"
        >
          {isPlan ? "Save Maintenance Plan" : "Save Maintenance Log"}
        </Button>
      </form>
    </Form>
  );
};

export default MaintenanceForm;

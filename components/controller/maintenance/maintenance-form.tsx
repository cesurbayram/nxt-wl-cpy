"use client";

import React, { useEffect, useState } from "react";
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
import { Button } from "../../ui/button";
import { MaintenancePlanValidation } from "@/lib/validations/maintenance-edit";
import { getUtilizationData } from "@/utils/service/utilization";

type MaintenancePlanFormValues = z.infer<typeof MaintenancePlanValidation>;

interface MaintenanceFormProps {
  onSubmit: (values: MaintenancePlanFormValues) => void;
  controllerId: string;
  onCancel?: () => void;
}

const MaintenanceForm = ({
  onSubmit,
  controllerId,
  onCancel,
}: MaintenanceFormProps) => {
  const [servoPowerTime, setServoPowerTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUtilizationData = async () => {
      try {
        const data = await getUtilizationData(controllerId, "7d", "1d");
        if (data && data.length > 0) {
          setServoPowerTime(data[0].servo_power_time);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching utilization data:", error);
        setIsLoading(false);
      }
    };

    fetchUtilizationData();
  }, [controllerId]);

  const form = useForm<MaintenancePlanFormValues>({
    resolver: zodResolver(MaintenancePlanValidation),
    defaultValues: {
      controllerId,
      name: "",
      operationTime: "0",
      companyName: "",
      maintenanceDate: new Date().toISOString().split("T")[0],
      servoPowerTime: servoPowerTime.toString(),
    },
  });

  useEffect(() => {
    form.setValue("servoPowerTime", servoPowerTime.toString());
  }, [servoPowerTime, form]);

  const calculateNextMaintenance = (servoPowerTime: string) => {
    const currentTime = parseInt(servoPowerTime) || 0;
    return (currentTime + 6000).toString();
  };

  const handleFormSubmit = async (data: MaintenancePlanFormValues) => {
    const nextMaintenanceTime = calculateNextMaintenance(data.servoPowerTime);
    await onSubmit({
      ...data,
      nextMaintenanceTime,
    });
  };

  if (isLoading) {
    return <div>Loading utilization data...</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
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
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <label className="block text-sm font-medium text-gray-700">
                Company/Authority Name
              </label>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter company or authority name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maintenanceDate"
          render={({ field }) => (
            <FormItem>
              <label className="block text-sm font-medium text-gray-700">
                Maintenance Date
              </label>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="servoPowerTime"
          render={({ field }) => (
            <FormItem>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Servo Power Time (hours)
              </label>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-70"
                />
              </FormControl>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Current servo power time from utilization data
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-sm text-gray-500 mt-2">
          Next Maintenance at:{" "}
          {calculateNextMaintenance(form.watch("servoPowerTime"))} hours
        </div>

        <div className="flex gap-2 justify-end mt-6">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="rounded-xl bg-[#6950e8] text-white w-full sm:w-auto"
          >
            Save Maintenance Plan
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MaintenanceForm;

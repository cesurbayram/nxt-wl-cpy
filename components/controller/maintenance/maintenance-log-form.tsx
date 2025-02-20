"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MaintenancePlan } from "@/types/maintenance.types";

const maintenanceLogSchema = z.object({
  maintenance_id: z.string({
    required_error: "Please select a maintenance plan",
  }),
  maintenance_time: z.string({
    required_error: "Please select maintenance time",
  }),
  technician: z.string({
    required_error: "Please enter technician name",
  }),
  description: z.string().optional(),
});

type MaintenanceLogFormValues = z.infer<typeof maintenanceLogSchema>;

interface MaintenanceLogFormProps {
  onSubmit: (data: MaintenanceLogFormValues) => void;
  maintenancePlans: MaintenancePlan[];
  onCancel: () => void;
}

export default function MaintenanceLogForm({
  onSubmit,
  maintenancePlans,
  onCancel,
}: MaintenanceLogFormProps) {
  const form = useForm<MaintenanceLogFormValues>({
    resolver: zodResolver(maintenanceLogSchema),
    defaultValues: {
      maintenance_id: "",
      maintenance_time: new Date().toISOString().slice(0, 10),
      technician: "",
      description: "",
    },
  });

  const handleFormSubmit = (values: MaintenanceLogFormValues) => {
    console.log("Form values:", values);
    if (!values.maintenance_id) {
      toast.error("Please select a maintenance plan");
      return;
    }
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="maintenance_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maintenance Plan</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a maintenance plan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {maintenancePlans
                    .filter((plan) => plan.id)
                    .map((plan) => (
                      <SelectItem key={plan.id} value={plan.id!}>
                        {plan.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maintenance_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maintenance Time</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <FormLabel>Technician Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter technician name" />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter maintenance description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-xl bg-[#6950e8] text-white w-full sm:w-auto"
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}

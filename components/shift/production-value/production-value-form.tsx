"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { createProductionValue } from "@/utils/service/shift/poduction-value";
import { getController } from "@/utils/service/controller";
import { getShifts } from "@/utils/service/shift";
import {
  getJobsByControllerAndShift,
  sendJobSelectCommand,
} from "@/utils/service/shift/job-select";
import { ProductionValue } from "@/types/production-value.types";
import SystemCountConfig from "./system-count-config";

const formSchema = z.object({
  controllerId: z.string().min(1, { message: "Controller is required" }),
  shiftId: z.string().min(1, { message: "Shift is required" }),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductionValueFormProps {
  onSuccess?: () => void;
  initialShiftId?: string;
}

interface JobProductCount {
  jobId: string;
  productCount: number;
}

export default function ProductionValueForm({
  onSuccess,
  initialShiftId,
}: ProductionValueFormProps) {
  const [controllers, setControllers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [shifts, setShifts] = useState<Array<{ id: string; name: string }>>([]);
  const [jobs, setJobs] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedJobs, setSelectedJobs] = useState<JobProductCount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jobSelectOpen, setJobSelectOpen] = useState<boolean>(false);
  const [jobsLoading, setJobsLoading] = useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      controllerId: "",
      shiftId: "",
      note: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching controllers, shifts, and jobs...");

        console.log("Fetching controllers...");
        let controllersData: Array<{ id: string; name: string }> = [];
        try {
          const controllersRes = await getController();
          console.log("Controllers response:", controllersRes);

          if (Array.isArray(controllersRes) && controllersRes.length > 0) {
            controllersData = controllersRes
              .map((controller) => ({
                id: controller.id || "",
                name: controller.name || "",
              }))
              .filter((c) => c.id !== "" && c.name !== "");
          }

          console.log("Processed controllers data:", controllersData);
          setControllers(controllersData);
        } catch (controllerError) {
          console.error("Error fetching controllers:", controllerError);
          setControllers([]);
        }

        console.log("Fetching shifts...");
        let shiftsData: Array<{ id: string; name: string }> = [];
        try {
          const shiftsResponse = await getShifts();
          console.log("Shifts response:", shiftsResponse);

          if (Array.isArray(shiftsResponse) && shiftsResponse.length > 0) {
            shiftsData = shiftsResponse;
          }

          setShifts(shiftsData);
        } catch (shiftError) {
          console.error("Error fetching shifts:", shiftError);
          setShifts([]);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast.error("Failed to load form data");

        setControllers([]);
        setShifts([]);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (selectedJobs.length === 0) {
        toast.error("En az bir iş seçmelisiniz");
        setIsLoading(false);
        return;
      }

      const invalidJob = selectedJobs.find((job) => job.productCount <= 0);
      if (invalidJob) {
        const jobName =
          jobs.find((j) => j.id === invalidJob.jobId)?.name || "Seçili iş";
        toast.error(`${jobName} için geçerli bir üretim sayısı girmelisiniz`);
        setIsLoading(false);
        return;
      }

      for (const job of selectedJobs) {
        const productionValue: ProductionValue = {
          controllerId: data.controllerId,
          shiftId: data.shiftId,
          jobId: job.jobId,
          producedProductCount: job.productCount,
          note: data.note,
        };

        await createProductionValue(productionValue);
      }

      toast.success("Production values saved successfully");
      form.reset({
        controllerId: "",
        shiftId: "",
        note: "",
      });

      setSelectedJobs([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving production values:", error);
      toast.error("Poduction values could not be saved. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobToggle = (jobId: string) => {
    setSelectedJobs((prev) => {
      const existingJobIndex = prev.findIndex((item) => item.jobId === jobId);

      if (existingJobIndex >= 0) {
        return prev.filter((item) => item.jobId !== jobId);
      } else {
        return [...prev, { jobId, productCount: 0 }];
      }
    });
  };

  const updateProductCount = (jobId: string, count: number) => {
    setSelectedJobs((prev) =>
      prev.map((item) =>
        item.jobId === jobId ? { ...item, productCount: count } : item
      )
    );
  };

  const fetchJobs = async (controllerId: string, shiftId?: string) => {
    if (!controllerId) {
      setJobs([]);
      return;
    }

    setJobsLoading(true);
    try {
      console.log(
        "Fetching jobs for controller:",
        controllerId,
        "shift:",
        shiftId
      );

      await sendJobSelectCommand(controllerId);

      const jobsResponse = await getJobsByControllerAndShift({
        controllerId,
        shiftId,
      });

      console.log("Jobs response:", jobsResponse);

      if (Array.isArray(jobsResponse) && jobsResponse.length > 0) {
        const jobsData = jobsResponse.map((job) => ({
          id: job.id,
          name: job.name,
        }));
        setJobs(jobsData);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch jobs");
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "controllerId") {
        const controllerId = form.getValues("controllerId");

        if (controllerId) {
          setSelectedJobs([]);
          fetchJobs(controllerId);
        } else {
          setJobs([]);
          setSelectedJobs([]);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="controllerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Controller</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a controller" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {controllers.map((controller) => (
                          <SelectItem key={controller.id} value={controller.id}>
                            {controller.name}
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
                name="shiftId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a shift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shifts.map((shift) => (
                          <SelectItem key={shift.id} value={shift.id}>
                            {shift.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-1">
                <FormItem>
                  <FormLabel>Jobs</FormLabel>
                  <div className="flex flex-col space-y-2">
                    <div
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer justify-between items-center"
                      onClick={() =>
                        !jobsLoading && setJobSelectOpen(!jobSelectOpen)
                      }
                    >
                      <span>
                        {jobsLoading
                          ? "Loading jobs..."
                          : selectedJobs.length === 0
                          ? "Select jobs"
                          : `${selectedJobs.length} jobs selected`}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 opacity-50 ${
                          jobsLoading ? "animate-spin" : ""
                        }`}
                      />
                    </div>

                    {jobSelectOpen && (
                      <div className="border rounded-md p-2 max-h-60 overflow-auto">
                        {jobs.length === 0 && !jobsLoading ? (
                          <div className="text-sm text-gray-500 p-2">
                            {form.getValues("controllerId") &&
                            form.getValues("shiftId")
                              ? "No jobs found for selected controller and shift"
                              : "Please select controller and shift first"}
                          </div>
                        ) : (
                          jobs.map((job) => (
                            <div
                              key={job.id}
                              className="flex items-center space-x-2 py-1"
                            >
                              <Checkbox
                                id={`job-${job.id}`}
                                checked={selectedJobs.some(
                                  (item) => item.jobId === job.id
                                )}
                                onCheckedChange={() => handleJobToggle(job.id)}
                              />
                              <label
                                htmlFor={`job-${job.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {job.name}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {selectedJobs.length === 0 && form.formState.isSubmitted && (
                    <p className="text-sm font-medium text-destructive mt-1">
                      At least one job is required
                    </p>
                  )}
                </FormItem>
              </div>

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Add any additional notes here..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedJobs.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">
                  Selected Jobs and Production Counts:
                </h4>
                <div className="space-y-3">
                  {selectedJobs.map((item) => {
                    const job = jobs.find((j) => j.id === item.jobId);
                    return job ? (
                      <div
                        key={item.jobId}
                        className="flex items-center gap-4 border p-2 rounded-md"
                      >
                        <div className="flex-grow font-medium">{job.name}</div>
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`count-${item.jobId}`}
                            className="text-sm"
                          >
                            Product Count:
                          </label>
                          <Input
                            id={`count-${item.jobId}`}
                            type="text"
                            placeholder="0"
                            onFocus={(e) => {
                              if (e.target.value === "0") {
                                e.target.value = "";
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === "") {
                                e.target.value = "0";
                                updateProductCount(item.jobId, 0);
                              }
                            }}
                            value={item.productCount.toString()}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              updateProductCount(
                                item.jobId,
                                val === "" ? 0 : parseInt(val)
                              );
                            }}
                            className="w-24"
                          />
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* System Count Configuration */}
            {selectedJobs.length > 0 && form.watch("controllerId") && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-4">System Count Configuration:</h4>
                <div className="space-y-4">
                  {selectedJobs.map((item) => {
                    const job = jobs.find((j) => j.id === item.jobId);
                    return job ? (
                      <SystemCountConfig
                        key={item.jobId}
                        jobId={item.jobId}
                        jobName={job.name}
                        controllerId={form.watch("controllerId")}
                        onConfigChange={() => {
                          // Config değiştiğinde herhangi bir refresh gerekirse burada yapılabilir
                        }}
                      />
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <Button
              disabled={isLoading || selectedJobs.length === 0}
              type="submit"
              className="ml-auto bg-[#6950E8] text-white"
            >
              {isLoading ? "Saving..." : "Save Production Volume"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

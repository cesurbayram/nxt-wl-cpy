"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { CardContent, CardFooter } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useForm } from "react-hook-form";
import { ControllerEditValidation } from "@/lib/validations/controller-edit";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller } from "@/types/controller.types";
import {
  createController,
  getControllerById,
  updateController,
} from "@/utils/service/controller";
import LoadingUi from "../shared/loading-ui";
import { getCell } from "@/utils/service/cell";
import { getLine } from "@/utils/service/line";
import { getFactory } from "@/utils/service/factory";
import { Cell } from "@/types/cell.types";
import { Line } from "@/types/line.types";
import { Factory } from "@/types/factory.types";
import { useMemo } from "react";

interface ControllerFormProps {
  controllerId: string;
}

const initialValues = {
  name: "",
  model: "",
  application: "",
  ipAddress: "",
  status: "",
  location: "",
  serialNumber: "",
};

const ControllerForm = ({ controllerId }: ControllerFormProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: controller,
    isLoading: isLoadingFetchController,
    isSuccess,
  } = useQuery<Controller>({
    queryFn: async () => await getControllerById(controllerId),
    queryKey: ["controller", controllerId],
    enabled: controllerId != "0",
  });

  const { data: cells } = useQuery<Cell[]>({
    queryFn: getCell,
    queryKey: ["cell"],
  });

  const { data: lines } = useQuery<Line[]>({
    queryFn: getLine,
    queryKey: ["line"],
  });

  const { data: factories } = useQuery<Factory[]>({
    queryFn: getFactory,
    queryKey: ["factory"],
  });

  const form = useForm<z.infer<typeof ControllerEditValidation>>({
    resolver: zodResolver(ControllerEditValidation),
    defaultValues:
      controllerId === "0"
        ? initialValues
        : {
            name: controller?.name || "",
            status: controller?.status?.toLowerCase() || "",
            model: controller?.model?.toLowerCase() || "",
            location: controller?.location || "",
            ipAddress: controller?.ipAddress || "",
            application: controller?.application?.toLowerCase() || "",
            serialNumber: controller?.serialNumber || "",
          },
  });

  const locationOptions = useMemo(() => {
    if (!cells?.length || !lines?.length || !factories?.length) {
      return [];
    }

    const options: { value: string; label: string }[] = [];

    cells.forEach((cell) => {
      if (!cell.line_id) return;

      const line = lines.find((l) => l.id === cell.line_id);
      if (!line || !line.factory_id) return;

      const factory = factories.find((f) => f.id === line.factory_id);
      if (!factory) return;

      const locationPath = `${factory.name}/${line.name}/${cell.name}`;
      options.push({
        value: locationPath,
        label: locationPath,
      });
    });

    return options;
  }, [cells, lines, factories]);

  const { mutateAsync: updateMutation, isPending: isUpdateLoading } =
    useMutation({
      mutationFn: (values: Controller) => updateController(values),
      onSuccess: async (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["controller"] });
        queryClient.setQueryData(["controller", variables.id], variables);
        router.push("/controller");
      },
    });

  const { mutateAsync: createMutation, isPending: isCreateloading } =
    useMutation({
      mutationFn: (values: Controller) => createController(values),
      onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: ["controller"] });
        router.push("/controller");
      },
    });

  const onSubmit = async (values: z.infer<typeof ControllerEditValidation>) => {
    if (controllerId == "0") {
      await createMutation(values);
    } else {
      const updatedValues = { ...values, id: controllerId };
      await updateMutation(updatedValues);
    }
  };

  return (
    <>
      <LoadingUi
        isLoading={
          isCreateloading || isLoadingFetchController || isUpdateLoading
        }
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-2 gap-6 p-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Controller Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 rounded-lg">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="passive">Passive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 rounded-lg">
                        <SelectValue placeholder="Controller Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yrc1000">YRC1000</SelectItem>
                        <SelectItem value="yrc1000m">YRC1000m</SelectItem>
                        <SelectItem value="dx200">DX200</SelectItem>
                        <SelectItem value="dx100">DX100</SelectItem>
                        <SelectItem value="fs100">FS100</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="application"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 rounded-lg">
                        <SelectValue placeholder="Select Application" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arc">ARC</SelectItem>
                        <SelectItem value="handling">HANDLING</SelectItem>
                        <SelectItem value="spot">SPOT</SelectItem>
                        <SelectItem value="general">GENERAL</SelectItem>
                        <SelectItem value="paint">PAINT</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ipAddress"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="IP Address"
                      className="h-12 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="h-12 rounded-lg">
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Serial Number"
                      className="h-12 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between mt-3">
            <Button
              type="submit"
              className="rounded-xl bg-[#6950e8] text-white"
            >
              {controllerId == "0" ? "Create Controller" : "Update Controller"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="rounded-xl"
            >
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Form>
    </>
  );
};

export default ControllerForm;

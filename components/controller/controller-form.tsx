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
import { useMemo, useState, useEffect } from "react";

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
  const router = useRouter();

  const [controller, setController] = useState<Controller | null>(null);
  const [isLoadingFetchController, setIsLoadingFetchController] =
    useState(false);
  const [cells, setCells] = useState<Cell[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof ControllerEditValidation>>({
    resolver: zodResolver(ControllerEditValidation),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (controller && controllerId !== "0") {
      form.reset({
        name: controller.name || "",
        status: controller.status?.toLowerCase() || "",
        model: controller.model?.toLowerCase() || "",
        location: controller.location || "",
        ipAddress: controller.ipAddress || "",
        application: controller.application?.toLowerCase() || "",
        serialNumber: controller.serialNumber || "",
      });
    }
  }, [controller, controllerId, form]);

  useEffect(() => {
    const fetchData = async () => {
      if (controllerId !== "0") {
        setIsLoadingFetchController(true);
        try {
          const data = await getControllerById(controllerId);
          setController(data);
          setIsSuccess(true);
        } catch (error) {
          console.error("Error fetching controller:", error);
        }
        setIsLoadingFetchController(false);
      }

      try {
        const [cellsData, linesData, factoriesData] = await Promise.all([
          getCell(),
          getLine(),
          getFactory(),
        ]);
        setCells(cellsData);
        setLines(linesData);
        setFactories(factoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [controllerId]);

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

  const updateMutation = async (values: Controller) => {
    setIsUpdateLoading(true);
    try {
      await updateController(values);
      router.push("/controller");
    } catch (error) {
      console.error("Error updating controller:", error);
    }
    setIsUpdateLoading(false);
  };

  const createMutation = async (values: Controller) => {
    setIsCreateLoading(true);
    try {
      await createController(values);
      router.push("/controller");
    } catch (error) {
      console.error("Error creating controller:", error);
    }
    setIsCreateLoading(false);
  };

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
          isCreateLoading || isLoadingFetchController || isUpdateLoading
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

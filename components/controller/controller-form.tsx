"use client"
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
import { createController, getControllerById, updateController } from "@/utils/service/controller";
import { useEffect } from "react";
import LoadingUi from "../shared/loading-ui";

interface ControllerFormProps {
  controllerId: string;
}

const initialValues = {
  name: "",
  model: "",
  ipAddress: "",
  status: "",
  location: "",
  serialNumber: "",
};

const ControllerForm = ({ controllerId }: ControllerFormProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof ControllerEditValidation>>({
    resolver: zodResolver(ControllerEditValidation),
    defaultValues: initialValues,
  });

  const { mutateAsync: updateMutation, isPending: isUpdateLoading } =
    useMutation({
      mutationFn: (values: Controller) => updateController(values),
      onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: ["controller"] });
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

  const {
    data: controller,
    isLoading: isLoadingFetchController,
    isSuccess,
  } = useQuery<Controller>({
    queryFn: async () => await getControllerById(controllerId),
    queryKey: ["controller", controllerId],
    enabled: controllerId != "0",
    gcTime: 0,
  });

  useEffect(() => {
    if (isSuccess && controllerId != "0") {
      form.setValue("name", controller.name as string);
      form.setValue("status", controller.status as string);
      form.setValue("model", controller.model as string);
      form.setValue("location", controller.location as string);
      form.setValue("ipAddress", controller.ipAddress as string);
    }
  }, [isSuccess, controller, controllerId, form]);

  return (
    <>
    <LoadingUi isLoading={isCreateloading || isLoadingFetchController || isUpdateLoading} />
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
                  <Input
                    {...field}
                    placeholder="Model"
                    className="h-12 rounded-lg"
                  />
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
                  <Input
                    {...field}
                    placeholder="Location"
                    className="h-12 rounded-lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-between mt-3">
          <Button type="submit" className="rounded-xl bg-[#6950e8] text-white">
            {controllerId == '0' ? 'Create Controller' : 'Update Controller'}
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

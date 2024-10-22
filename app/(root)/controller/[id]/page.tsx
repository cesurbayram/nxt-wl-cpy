"use client"
import React, { useMemo } from "react";
import LoadingUi from "@/components/shared/loading-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { ControllerEditValidation } from "@/lib/validations/controller-edit";
import { Controller } from "@/types/controller.types";
import { createController, getControllerById, updateController } from "@/utils/service/controller";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import PageWrapper from "@/components/shared/page-wrapper";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { LiaEditSolid } from "react-icons/lia";
import { useEffect } from "react";
import ControllerStatusBar from "@/components/controller/controller-status-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlarmList from "@/components/controller/alarm/alarm-list";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Alarm from "@/components/controller/alarm/alarm";
//import { controllers } from "../page";
import { ControllerStatus } from "@/types/controllerStatus.types";
import InputOutput from "@/components/controller/input-output/input-output";
import Variable from "@/components/controller/variable/variable";
import { GiMechanicalArm } from "react-icons/gi";

const tabItems = [
    {
        label: 'Alarms',
        value: 'alarm'
    },
    {
        label: 'Monitoring',
        value: 'monitoring'
    },
    {
        label: 'I/O',
        value: 'inputOutput'
    },
    {
        label: 'Variables',
        value: 'variable'
    },
    {
        label: 'Data',
        value: 'data'
    },
    {
        label: 'Job',
        value: 'job'
    },
    {
        label: 'Files',
        value: 'file'
    },
    {
        label: 'Utilization',
        value: 'util'
    },
    {
        label: 'Maintenance',
        value: 'maintenance'
    },
    {
        label: 'Camera',
        value: 'camera'
    },
    {
        label: 'Remote Pendant',
        value: 'remotePend'
    }
]

const initialValues = {
  name: "",
  model: "",
  ipAddress: "",
  status: "",
  location: "",
  serialNumber: "",
};



const Page = ({ params }: { params: { id: string } }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof ControllerEditValidation>>({
    resolver: zodResolver(ControllerEditValidation),
    defaultValues: initialValues,
  });

  const { mutateAsync: updateMutation, isPending: isUpdateLoading } = useMutation({
    mutationFn: (values: Controller) => updateController(values),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["controller"] });
      router.push("/controller");
    },
  });

  const { mutateAsync: createMutation, isPending: isCreateloading } = useMutation({
    mutationFn: (values: Controller) => createController(values),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["controller"] });
      router.push("/controller");
    },
  });

  const { data: controller, isLoading: isLoadingFetchController, isSuccess } = useQuery<Controller>({
    queryFn: async () => await getControllerById(params.id),
    queryKey: ["controller", params.id],
    enabled: params.id != "0",
    gcTime: 0,
  });

  useEffect(() => {
    if (isSuccess && params.id != "0") {
      form.setValue("name", controller.name as string);
      form.setValue("status", controller.status as string);
      form.setValue("model", controller.model as string);
      form.setValue("location", controller.location as string);
      form.setValue("ipAddress", controller.ipAddress as string);
    }
  }, [isSuccess, controller, params.id, form]);

  const onSubmit = async (values: z.infer<typeof ControllerEditValidation>) => {
    if (params.id == "0") { 
      await createMutation(values);
    } else {
      const updatedValues = { ...values, id: params.id };
      await updateMutation(updatedValues);
    }
  };

  const modifiedTabs = useMemo(() => {
    if(params.id != '0'){
      return [...tabItems, {label: 'Update Controller', value: 'update'}]
    }
  }, [params.id])

  return (
   <>
      <LoadingUi 
        isLoading={isCreateloading || isLoadingFetchController || isUpdateLoading} 
      />
      <PageWrapper
        shownHeaderButton={false}
        pageTitle={params.id !== "0" ? `Detail ${controller?.name}` : "Create Controller"}
        icon={
          params.id !== "0" ? (
            <LiaEditSolid size={24} color="#6950e8" />
          ) 
          : (
            <GiMechanicalArm size={24} color="#6950e8" />
          )
        }
      >
        {params.id === "0" ? (
        // Yeni Controller Ekleme Formu
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
                      <Input {...field} placeholder="Model" className="h-12 rounded-lg" />
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
                      <Input {...field} placeholder="IP Address" className="h-12 rounded-lg" />
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
                      <Input {...field} placeholder="Location" className="h-12 rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between mt-3">
              <Button type="submit" className="rounded-xl bg-[#6950e8] text-white">
                Create Controller
              </Button>
              <Button variant="outline" onClick={() => router.back()} className="rounded-xl">
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Form>
      ) : (
        // Güncelleme ve Detay Sekmesi
        <Tabs defaultValue="details">
          <Tabs defaultValue="alarm" className="mt-5">
            <TabsList className="w-full flex">
              {modifiedTabs?.map((item) => (
                <TabsTrigger key={item.value} value={item.value} className="flex-1">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="alarm">
              <Alarm />
            </TabsContent>
            <TabsContent value="inputOutput">
              <InputOutput />
            </TabsContent>
            <TabsContent value="variable">
              <Variable />
            </TabsContent>
            <TabsContent value="update">
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
                          <Input {...field} placeholder="Model" className="h-12 rounded-lg" />
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
                          <Input {...field} placeholder="IP Address" className="h-12 rounded-lg" />
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
                          <Input {...field} placeholder="Location" className="h-12 rounded-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between mt-3">
                  <Button type="submit" className="rounded-xl bg-[#6950e8] text-white">
                    Update Controller
                  </Button>
                  <Button variant="outline" onClick={() => router.back()} className="rounded-xl">
                    Cancel
                  </Button>
                </CardFooter>
              </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Tabs>
      )}
      </PageWrapper>
   </>
  );  
};

export default Page;

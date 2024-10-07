"use client";
import React, { useEffect } from "react";
import LoadingUi from "@/components/shared/loading-ui";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FactoryEditValidation } from "@/lib/validations/factory-edit";
import { Factory } from "@/types/factory.types";
import { createFactory, getFactoryById, updateFactory } from "@/utils/service/factory";
import { getLine} from "@/utils/service/line";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import PageWrapper from "@/components/shared/page-wrapper";
import { MdOutlineFactory } from "react-icons/md";
import { LiaEditSolid } from "react-icons/lia";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialValues = {
  name: "",
  status: "",
  line_id: "",
};

const Page = ({ params }: { params: { id: string } }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof FactoryEditValidation>>({
    resolver: zodResolver(FactoryEditValidation),
    defaultValues: initialValues,
  });

  const { mutateAsync: updateMutation, isPending: isUpdateLoading } = useMutation({
    mutationFn: (values: Factory) => updateFactory(values),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["factory"] });
      router.push("/factory");
    },
  });

  const { mutateAsync: createMutation, isPending: isCreateloading } = useMutation({
    mutationFn: (values: Factory) => createFactory(values),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["factory"] });
      router.push("/factory");
    },
  });

  const { data: factory, isLoading: isLoadingFetchFactory, isSuccess } = useQuery<Factory>({
    queryFn: async () => await getFactoryById(params.id),
    queryKey: ["factory", params.id],
    enabled: params.id != "0",
    gcTime: 0,
  });

  const { data: line, isLoading: isLoadingFactorys } = useQuery({
    queryFn: async () => await getLine(),  // Tüm cell'leri getiren fonksiyon
    queryKey: ["line"],
  });
  

  useEffect(() => {
    if (isSuccess && params.id != "0") {
      form.setValue("name", factory.name as string);
      form.setValue("status", factory.status as string);
      form.setValue("line_id", factory.line_id as string);
    }
  }, [isSuccess, factory, params.id, form]);

  const onSubmit = async (values: z.infer<typeof FactoryEditValidation>) => {
    if (params.id == "0") {
      await createMutation(values);
    } else {
      const updatedValues = { ...values, id: params.id };
      await updateMutation(updatedValues);
    }
  };

  return (
    <>
      <LoadingUi
        isLoading={isCreateloading || isLoadingFetchFactory || isUpdateLoading || isLoadingFactorys}
      />
      <PageWrapper
        shownHeaderButton={false}
        pageTitle={params.id != "0" ? "Update Factory" : "Create Factory"}
        icon={
          params.id != "0" ? (
            <LiaEditSolid size={24} color="#6950e8" />
          ) : (
            <MdOutlineFactory size={24} color="#6950e8" />
          )
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid grid-cols-1 gap-6 p-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl className="relative">
                      <Input
                        placeholder="Factory Name"
                        {...field}
                        className={`${
                          form.formState.errors.name
                            ? "border-red-600 focus:border-red-800"
                            : ""
                        } h-12 rounded-lg focus:placeholder:-translate-y-7 focus:placeholder:z-20 focus:placeholder:transition-transform`}
                      />
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
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                      >
                        <SelectTrigger
                          className={`${
                            form.formState.errors.status
                              ? "border-red-600 focus:border-red-800"
                              : ""
                          } h-12 rounded-lg`}
                        >
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
                name="line_id"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                      >
                        <SelectTrigger
                          className={`${
                            form.formState.errors.line_id
                              ? "border-red-600 focus:border-red-800"
                              : ""
                          } h-12 rounded-lg`}
                        >
                          <SelectValue placeholder="Select Line" />
                        </SelectTrigger>
                        <SelectContent>
                        {line?.map((line) => (
                        line.id && (
                          <SelectItem key={line.id} value={line.id}>
                            {line.name}
                          </SelectItem>
                        )))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-between mt-3">
              <Button
                className="rounded-xl bg-[#6950e8] hover:bg-[#592be7] transition-colors"
                size="sm"
                type="submit"
              >
                {params.id != "0" ? "Update Factory" : "Create Factory"}
              </Button>
              <Button
                className="rounded-xl"
                size="sm"
                variant={"outline"}
                type="button"
                onClick={() => {
                  router.back();
                }}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Form>
      </PageWrapper>
    </>
  );
};

export default Page;

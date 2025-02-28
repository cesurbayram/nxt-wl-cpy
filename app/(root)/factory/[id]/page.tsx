"use client";
import React, { useEffect, useMemo, useState } from "react";
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
import {
  createFactory,
  getFactoryById,
  updateFactory,
} from "@/utils/service/factory";
import { getLine } from "@/utils/service/line";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import PageWrapper from "@/components/shared/page-wrapper";
import { MdOutlineFactory } from "react-icons/md";
import { LiaEditSolid } from "react-icons/lia";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/shared/multi-select";

const initialValues = {
  name: "",
  status: "",
  lineIds: [],
};

const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [factory, setFactory] = useState<Factory | null>(null);
  const [line, setLine] = useState<any[]>([]);
  const [isLoadingFetchFactory, setIsLoadingFetchFactory] = useState(false);
  const [isLoadingFactorys, setIsLoadingFactorys] = useState(false);

  const form = useForm<z.infer<typeof FactoryEditValidation>>({
    resolver: zodResolver(FactoryEditValidation),
    defaultValues: initialValues,
  });

  const updateMutation = async (values: Factory) => {
    setIsLoading(true);
    try {
      await updateFactory(values);
      router.push("/factory");
    } catch (error) {
      console.error("Failed to update factory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createMutation = async (values: Factory) => {
    setIsLoading(true);
    try {
      await createFactory(values);
      router.push("/factory");
    } catch (error) {
      console.error("Failed to create factory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchFactory = async () => {
      if (params.id !== "0") {
        setIsLoadingFetchFactory(true);
        try {
          const data = await getFactoryById(params.id);
          setFactory(data);
          form.setValue("name", data.name as string);
          form.setValue("status", data.status as string);
          form.setValue("lineIds", data.lineIds as [string, ...string[]]);
        } catch (error) {
          console.error("Failed to fetch factory:", error);
        } finally {
          setIsLoadingFetchFactory(false);
        }
      }
    };

    fetchFactory();
  }, [params.id, form]);

  useEffect(() => {
    const fetchLines = async () => {
      setIsLoadingFactorys(true);
      try {
        const data = await getLine();
        setLine(data);
      } catch (error) {
        console.error("Failed to fetch lines:", error);
      } finally {
        setIsLoadingFactorys(false);
      }
    };

    fetchLines();
  }, []);

  const formattedLines = useMemo(() => {
    if (line && line?.length > 0) {
      return line.map((item) => {
        return {
          label: item.name as string,
          value: item.id as string,
        };
      });
    }
  }, [line]);

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
        isLoading={isLoading || isLoadingFetchFactory || isLoadingFactorys}
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
            <CardContent className="grid grid-cols-2 gap-6 p-6">
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
                name="lineIds"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="lineIds"
                        defaultValue={field.value}
                        render={({ field: controllerField }) => (
                          <MultiSelect
                            options={formattedLines ? formattedLines : []}
                            onValueChange={(value) => {
                              controllerField.onChange(value);
                            }}
                            defaultValue={controllerField.value}
                            placeholder="Select Lines"
                            variant={"secondary"}
                            animation={2}
                            maxCount={3}
                          />
                        )}
                      />
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

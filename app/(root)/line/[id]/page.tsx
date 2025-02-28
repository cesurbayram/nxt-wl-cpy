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
import { LineEditValidation } from "@/lib/validations/line-edit";
import { Line } from "@/types/line.types";
import { createLine, getLineById, updateLine } from "@/utils/service/line";
import { getCell } from "@/utils/service/cell";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import PageWrapper from "@/components/shared/page-wrapper";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
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
  cellIds: [],
};

const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [line, setLine] = useState<Line | null>(null);
  const [cell, setCell] = useState<any[]>([]);
  const [isLoadingFetchLine, setIsLoadingFetchLine] = useState(false);
  const [isLoadingCells, setIsLoadingCells] = useState(false);

  const form = useForm<z.infer<typeof LineEditValidation>>({
    resolver: zodResolver(LineEditValidation),
    defaultValues: initialValues,
  });

  const updateMutation = async (values: Line) => {
    setIsLoading(true);
    try {
      await updateLine(values);
      router.push("/line");
    } catch (error) {
      console.error("Failed to update line:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createMutation = async (values: Line) => {
    setIsLoading(true);
    try {
      await createLine(values);
      router.push("/line");
    } catch (error) {
      console.error("Failed to create line:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchLine = async () => {
      if (params.id !== "0") {
        setIsLoadingFetchLine(true);
        try {
          const data = await getLineById(params.id);
          setLine(data);
          form.setValue("name", data.name as string);
          form.setValue("status", data.status as string);
          form.setValue("cellIds", data.cellIds as [string, ...string[]]);
        } catch (error) {
          console.error("Failed to fetch line:", error);
        } finally {
          setIsLoadingFetchLine(false);
        }
      }
    };

    fetchLine();
  }, [params.id, form]);

  useEffect(() => {
    const fetchCells = async () => {
      setIsLoadingCells(true);
      try {
        const data = await getCell();
        setCell(data);
      } catch (error) {
        console.error("Failed to fetch cells:", error);
      } finally {
        setIsLoadingCells(false);
      }
    };

    fetchCells();
  }, []);

  const formattedCell = useMemo(() => {
    if (cell && cell?.length > 0) {
      return cell.map((item) => {
        return {
          label: item.name as string,
          value: item.id as string,
        };
      });
    }
  }, [cell]);

  const onSubmit = async (values: z.infer<typeof LineEditValidation>) => {
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
        isLoading={isLoading || isLoadingFetchLine || isLoadingCells}
      />
      <PageWrapper
        shownHeaderButton={false}
        pageTitle={params.id != "0" ? "Update Line" : "Create Line"}
        icon={
          params.id != "0" ? (
            <LiaEditSolid size={24} color="#6950e8" />
          ) : (
            <AiOutlineAppstoreAdd size={24} color="#6950e8" />
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
                        placeholder="Line Name"
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
                name="cellIds"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="cellIds"
                        defaultValue={field.value}
                        render={({ field: controllerField }) => (
                          <MultiSelect
                            options={formattedCell ? formattedCell : []}
                            onValueChange={(value) => {
                              controllerField.onChange(value);
                            }}
                            defaultValue={controllerField.value}
                            placeholder="Select cells"
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
                {params.id != "0" ? "Update Line" : "Create Line"}
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

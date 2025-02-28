"use client";
import React from "react";
import LoadingUi from "@/components/shared/loading-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CellEditValidation } from "@/lib/validations/cell-edit";
import { Cell } from "@/types/cell.types";
import { createCell, getCellById, updateCell } from "@/utils/service/cell";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PageWrapper from "@/components/shared/page-wrapper";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { LiaEditSolid } from "react-icons/lia";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialValues = {
  name: "",
  status: "",
};

const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cell, setCell] = useState<Cell | null>(null);
  const [isLoadingFetchCell, setIsLoadingFetchCell] = useState(false);

  const form = useForm<z.infer<typeof CellEditValidation>>({
    resolver: zodResolver(CellEditValidation),
    defaultValues: initialValues,
  });

  const updateMutation = async (values: Cell) => {
    setIsLoading(true);
    try {
      await updateCell(values);
      router.push("/cell");
    } catch (error) {
      console.error("Failed to update cell:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createMutation = async (values: Cell) => {
    setIsLoading(true);
    try {
      await createCell(values);
      router.push("/cell");
    } catch (error) {
      console.error("Failed to create cell:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCell = async () => {
      if (params.id !== "0") {
        setIsLoadingFetchCell(true);
        try {
          const data = await getCellById(params.id);
          setCell(data);
          form.setValue("name", data.name as string);
          form.setValue("status", data.status as string);
        } catch (error) {
          console.error("Failed to fetch cell:", error);
        } finally {
          setIsLoadingFetchCell(false);
        }
      }
    };

    fetchCell();
  }, [params.id, form]);

  const onSubmit = async (values: z.infer<typeof CellEditValidation>) => {
    if (params.id == "0") {
      await createMutation(values);
    } else {
      const updatedValues = { ...values, id: params.id };
      await updateMutation(updatedValues);
    }
  };

  return (
    <>
      <LoadingUi isLoading={isLoading || isLoadingFetchCell} />
      <PageWrapper
        shownHeaderButton={false}
        pageTitle={params.id != "0" ? "Update Cell" : "Create Cell"}
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
            <CardContent className="grid grid-cols-1 gap-6 p-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl className="relative">
                      <Input
                        placeholder="Cell Name"
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
            </CardContent>

            <CardFooter className="flex justify-between mt-3">
              <Button
                className="rounded-xl bg-[#6950e8] hover:bg-[#592be7] transition-colors"
                size="sm"
                type="submit"
              >
                {params.id != "0" ? "Update Cell" : "Create Cell"}
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

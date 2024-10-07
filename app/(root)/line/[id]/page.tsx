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
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import PageWrapper from "@/components/shared/page-wrapper";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { LiaEditSolid } from "react-icons/lia";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/shared/multi-select";

const initialValues = {
  name: "",
  status: "",
  cell_id: "",
};

const Page = ({ params }: { params: { id: string } }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const form = useForm<z.infer<typeof LineEditValidation>>({
    resolver: zodResolver(LineEditValidation),
    defaultValues: initialValues,
  });

  const { mutateAsync: updateMutation, isPending: isUpdateLoading } = useMutation({
    mutationFn: (values: Line) => updateLine(values),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["line"] });
      router.push("/line");
    },
  });

  const { mutateAsync: createMutation, isPending: isCreateloading } = useMutation({
    mutationFn: (values: Line) => {
      values.cellIds = selectedCells;
      createLine(values)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["line"] });
      router.push("/line");
    },
  });

  const { data: line, isLoading: isLoadingFetchLine, isSuccess } = useQuery<Line>({
    queryFn: async () => await getLineById(params.id),
    queryKey: ["line", params.id],
    enabled: params.id != "0",
    gcTime: 0,
  });

  const { data: cell, isLoading: isLoadingCells } = useQuery({
    queryFn: async () => await getCell(),  // Tüm cell'leri getiren fonksiyon
    queryKey: ["cell"],
  });

  const formattedCell = useMemo(() => {
    if (cell && cell?.length > 0) {
      return cell.map((item) => {
        return {
          label: (item.name) as string,
          value: (item.id) as string,
        }
      })
    }
  }, [cell])

  useEffect(() => {
    if (isSuccess && params.id != "0") {
      form.setValue("name", line.name as string);
      form.setValue("status", line.status as string);
      setSelectedCells(line.cellIds ? line.cellIds : []);
    }
  }, [isSuccess, line, params.id, form]);

  console.log('selectedCells', selectedCells);

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
        isLoading={isCreateloading || isLoadingFetchLine || isUpdateLoading || isLoadingCells}
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
                        className={`${form.formState.errors.name
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
                          className={`${form.formState.errors.status
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
                name="cell_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormControl>
                      <MultiSelect
                        options={formattedCell ? formattedCell : []}
                        onValueChange={setSelectedCells}
                        defaultValue={selectedCells}
                        placeholder="Select cells"
                        variant={"secondary"}
                        animation={2}
                        maxCount={3}
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

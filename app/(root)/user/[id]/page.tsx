"use client";
import React, { useEffect, useState } from "react";
import LoadingUi from "@/components/shared/loading-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserEditValidation } from "@/lib/validations/user-edit";
import { User } from "@/types/user.types";
import { createUser, getUserById, updateUser } from "@/utils/service/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PageWrapper from "@/components/shared/page-wrapper";
import { AiOutlineUserAdd } from "react-icons/ai";
import { LiaUserEditSolid } from "react-icons/lia";
const initialValues = {
  name: "",
  lastName: "",
  userName: "",
  email: "",
  password: "",
  role: "",
  code: "",
  position: "",
  location: "",
};

const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingFetchUser, setIsLoadingFetchUser] = useState(false);

  const form = useForm<z.infer<typeof UserEditValidation>>({
    resolver: zodResolver(UserEditValidation),
    defaultValues: initialValues,
  });

  const createMutation = async (values: User) => {
    setIsLoading(true);
    try {
      await createUser(values);
      router.push("/user");
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMutation = async (values: User) => {
    setIsLoading(true);
    try {
      await updateUser(values);
      router.push("/user");
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (params.id !== "0") {
        setIsLoadingFetchUser(true);
        try {
          const data = await getUserById({ id: params.id });
          setUser(data);
          form.setValue("name", data.name as string);
          form.setValue("lastName", data.lastName as string);
          form.setValue("email", data.email as string);
          form.setValue("role", data.role as string);
          form.setValue("userName", data.userName as string);
          form.setValue("code", data.code as string);
          form.setValue("position", data.position as string);
          form.setValue("location", data.location as string);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        } finally {
          setIsLoadingFetchUser(false);
        }
      }
    };

    fetchUser();
  }, [params.id, form]);

  const onSubmit = async (values: z.infer<typeof UserEditValidation>) => {
    const newValues: User = {
      ...values,
      bcryptPassword: values.password,
    };
    if (params.id == "0") {
      await createMutation(newValues);
    } else {
      newValues.id = params.id;
      await updateMutation(newValues);
    }
  };

  return (
    <>
      <LoadingUi isLoading={isLoading || isLoadingFetchUser} />

      <PageWrapper
        shownHeaderButton={false}
        pageTitle={params.id != "0" ? "Update User" : "Create User"}
        icon={
          params.id != "0" ? (
            <LiaUserEditSolid size={24} color="#6950e8" />
          ) : (
            <AiOutlineUserAdd size={24} color="#6950e8" />
          )
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Card>
              <CardContent className="grid grid-cols-2 gap-6 p-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      {params.id !== "0" && <FormLabel>Name</FormLabel>}
                      <FormControl className="relative">
                        <Input
                          placeholder={params.id === "0" ? "Name" : ""}
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
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      {params.id !== "0" && <FormLabel>Last Name</FormLabel>}
                      <FormControl>
                        <Input
                          placeholder={params.id === "0" ? "Last Name" : ""}
                          {...field}
                          className={`${
                            form.formState.errors.lastName
                              ? "border-red-600 focus:border-red-800"
                              : ""
                          } h-12 rounded-lg`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      {params.id !== "0" && <FormLabel>Username</FormLabel>}
                      <FormControl>
                        <Input
                          placeholder={params.id === "0" ? "Username" : ""}
                          {...field}
                          className={`${
                            form.formState.errors.userName
                              ? "border-red-600 focus:border-red-800"
                              : ""
                          } h-12 rounded-lg`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      {params.id !== "0" && <FormLabel>Role</FormLabel>}
                      <FormControl>
                        <Input
                          placeholder={params.id === "0" ? "Role" : ""}
                          {...field}
                          className="h-12 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      {params.id !== "0" && <FormLabel>Email</FormLabel>}
                      <FormControl>
                        <Input
                          placeholder={params.id === "0" ? "Email" : ""}
                          {...field}
                          className={`${
                            form.formState.errors.email
                              ? "border-red-600 focus:border-red-800"
                              : ""
                          } h-12 rounded-lg`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      {params.id !== "0" && <FormLabel>Code</FormLabel>}
                      <FormControl>
                        <Input
                          placeholder={params.id === "0" ? "Code" : ""}
                          {...field}
                          className="h-12 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      {params.id !== "0" && <FormLabel>Position</FormLabel>}
                      <FormControl>
                        <Input
                          placeholder={params.id === "0" ? "Position" : ""}
                          {...field}
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
                      {params.id !== "0" && <FormLabel>Location</FormLabel>}
                      <FormControl>
                        <Input
                          placeholder={params.id === "0" ? "Location" : ""}
                          {...field}
                          className="h-12 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {params.id == "0" && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            className={`${
                              form.formState.errors.password
                                ? "border-red-600 focus:border-red-800"
                                : ""
                            } h-12 rounded-lg`}
                            placeholder="Password"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  className="rounded-xl bg-[#6950e8] hover:bg-[#592be7] transition-colors"
                  size="sm"
                  type="submit"
                >
                  {params.id != "0" ? "Update User" : "Create User"}
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
            </Card>
          </form>
        </Form>
      </PageWrapper>
    </>
  );
};

export default Page;

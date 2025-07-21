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
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/badge";

const initialValues = {
  name: "",
  lastName: "",
  userName: "",
  email: "",
  password: "",
  role: "",
  employee_id: "",
};

const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingFetchUser, setIsLoadingFetchUser] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const form = useForm<z.infer<typeof UserEditValidation>>({
    resolver: zodResolver(UserEditValidation),
    defaultValues: initialValues,
  });

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees");
      if (response.ok) {
        const data = await response.json();
        // Filter out employees that already have user accounts (excluding current user)
        const availableEmployees = data.filter(
          (emp: Employee) => !emp.user || (user && emp.user.id === user.id)
        );
        setEmployees(availableEmployees);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

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
          form.setValue("employee_id", data.employee_id || "");
        } catch (error) {
          console.error("Failed to fetch user:", error);
        } finally {
          setIsLoadingFetchUser(false);
        }
      } else {
        // Handle URL query parameters for pre-filling form when creating user from employee
        const urlParams = new URLSearchParams(window.location.search);
        const employeeId = urlParams.get("employee_id");
        const name = urlParams.get("name");
        const lastName = urlParams.get("lastName");
        const email = urlParams.get("email");

        if (employeeId) form.setValue("employee_id", employeeId);
        if (name) form.setValue("name", name);
        if (lastName) form.setValue("lastName", lastName);
        if (email) form.setValue("email", email);
      }
    };

    fetchUser();
  }, [params.id, form]);

  useEffect(() => {
    fetchEmployees();
  }, [user]);

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

  const selectedEmployee = employees.find(
    (emp) => emp.id === form.watch("employee_id")
  );

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
                  name="employee_id"
                  render={({ field }) => (
                    <FormItem>
                      {params.id !== "0" && <FormLabel>Employee</FormLabel>}
                      <FormControl>
                        <select
                          {...field}
                          className="h-12 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Employee (Optional)</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.name} {employee.last_name} - #
                              {employee.employee_code} ({employee.department})
                            </option>
                          ))}
                        </select>
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

              {selectedEmployee && (
                <CardContent className="pt-0">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Selected Employee Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Name:</p>
                        <p className="font-medium">
                          {selectedEmployee.name} {selectedEmployee.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Employee Code:</p>
                        <p className="font-medium">
                          #{selectedEmployee.employee_code}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Department:</p>
                        <p className="font-medium">
                          {selectedEmployee.department}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Position:</p>
                        <p className="font-medium">
                          {selectedEmployee.position}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Location:</p>
                        <p className="font-medium">
                          {selectedEmployee.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status:</p>
                        <Badge
                          className={
                            selectedEmployee.status === "active"
                              ? "bg-green-100 text-green-800"
                              : selectedEmployee.status === "inactive"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {selectedEmployee.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}

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

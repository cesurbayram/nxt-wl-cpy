"use client";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const initialValues = {
  name: "",
  lastName: "",
  userName: "",
  email: "",
  password: "",
  role: "",
};

const Page = ({ params }: { params: { id: string } }) => {
  const form = useForm<z.infer<typeof UserEditValidation>>({
    resolver: zodResolver(UserEditValidation),
    defaultValues: initialValues,
  });

  const onSubmit = (values: z.infer<typeof UserEditValidation>) => {
    console.log("values", values);
  };

  return (
    <div className="container mx-auto">
      <Card className="shadow-md rounded-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid grid-cols-2 gap-6 p-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Name"
                        {...field}
                        className={`${
                          form.formState.errors.name
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
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Last Name"
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
                    <FormControl>
                      <Input
                        placeholder="Username"
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
                    <FormControl>
                      <Input
                        placeholder="Role"
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
                    <FormControl>
                      <Input
                        placeholder="Email"
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
                        {...field}
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
                Create User
              </Button>
              <Button className="rounded-xl" size="sm" variant={"outline"}>
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Page;

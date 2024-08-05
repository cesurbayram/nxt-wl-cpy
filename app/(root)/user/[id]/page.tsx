"use client";
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
import { UserEditValidation } from "@/lib/validations/user-edit";
import { User } from "@/types/user.types";
import { createUser, getUserById } from "@/utils/service/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
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
  const queryClient = useQueryClient()
  const router = useRouter()
  const form = useForm<z.infer<typeof UserEditValidation>>({
    resolver: zodResolver(UserEditValidation),
    defaultValues: initialValues,
  });

  const {mutate, isLoading} = useMutation({
    mutationFn: async (values: User) => await createUser(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['users'])
      router.push('/user')
    }
  })

  const {data: user, isLoading: isLoadingFetchUser} = useQuery<User>({
    queryFn: async () => await getUserById({id: params.id}),
    queryKey: ['user'],
    enabled: params.id != '0',
    onSuccess: async (result) => {
      form.setValue('name', result.name as string),
      form.setValue('lastName', result.last_name as string),
      form.setValue('email', result.email as string),
      form.setValue('password', result.bcrypt_password as string),
      form.setValue('role', result.role as string),
      form.setValue('userName', result.user_name as string)
    } 
  })

  
  

  const onSubmit = (values: z.infer<typeof UserEditValidation>) => {
    const newValues: User = {
      ...values,
      bcryptPassword: values.password
    }

    mutate(newValues)
  };

  return (
    <>
      <LoadingUi isLoading={isLoading || isLoadingFetchUser} />
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
                <Button 
                  className="rounded-xl" 
                  size="sm" 
                  variant={"outline"}
                  onClick={() => {
                    router.push('/user')
                  }}
                >
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default Page;

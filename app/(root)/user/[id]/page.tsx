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
import { createUser, getUserById, updateUser } from "@/utils/service/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
};

const Page = ({ params }: { params: { id: string } }) => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const form = useForm<z.infer<typeof UserEditValidation>>({
    resolver: zodResolver(UserEditValidation),
    defaultValues: initialValues,
  });

  const {mutateAsync: createMutation, isPending: isCreateloading} = useMutation({
    mutationFn: (values: User) => createUser(values),
    onSuccess: async () => {
      queryClient.invalidateQueries({queryKey: ["users"]})
      router.push('/user')
    }
  })

  const {mutateAsync: updateMutation, isPending: isUpdateLoading} = useMutation({
    mutationFn: (values: User) => updateUser(values),
    onSuccess: async () => {
      queryClient.invalidateQueries({queryKey: ['users']})
      router.push('/user')
    }
  })

  const {data: user, isLoading: isLoadingFetchUser, isSuccess} = useQuery<User>({
    queryFn: async () => await getUserById({id: params.id}),
    queryKey: ['user'],
    enabled: params.id != '0',
    gcTime: 0
  })

  if(isSuccess && params.id != '0') {
    form.setValue('name', user.name as string),
    form.setValue('lastName', user.lastName as string),
    form.setValue('email', user.email as string),
    form.setValue('password', user.bcrypt_password as string),
    form.setValue('role', user.role as string),
    form.setValue('userName', user.user_name as string)
  }

  
  

  const onSubmit = async (values: z.infer<typeof UserEditValidation>) => {
    const newValues: User = {
      ...values,
      bcryptPassword: values.password
    }
    if(params.id == '0') {
      await createMutation(newValues)
    } else {
      newValues.id = params.id
      await updateMutation(newValues)
    }
  };

  return (
    <>
      <LoadingUi isLoading={isCreateloading || isLoadingFetchUser || isUpdateLoading} />
      
        <PageWrapper
            shownHeaderButton={false}
            pageTitle={params.id != '0' ? 'Update User' : 'Create User'}
            icon={params.id != '0' ? <LiaUserEditSolid size={24} color="#6950e8" /> : <AiOutlineUserAdd size={24} color="#6950e8" />}
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
                          placeholder="Name"
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
                {params.id == '0' && <FormField
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
                />}
              </CardContent>
              <CardFooter className="flex justify-between mt-3">
                <Button
                  className="rounded-xl bg-[#6950e8] hover:bg-[#592be7] transition-colors"
                  size="sm"
                  type="submit"
                >
                  {params.id != '0' ? 'Update User' : 'Create User'}
                </Button>
                <Button 
                  className="rounded-xl" 
                  size="sm" 
                  variant={"outline"}
                  type="button"
                  onClick={() => {
                    router.back()
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

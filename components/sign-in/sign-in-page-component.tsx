"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginValidation } from "@/lib/validations/login";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { Login } from "@/types/login.types";
import { userLogin } from "@/utils/service/auth";
import { useRouter } from "next/navigation";


const initialValues = {
  email: "",
  password: "",
};

const SignInPageComponent = () => {
    const router = useRouter();
  const form = useForm<z.infer<typeof LoginValidation>>({
    defaultValues: initialValues,
    resolver: zodResolver(LoginValidation),
  });

  const { mutateAsync: loginMutation, isPending: isSingInLoading, isSuccess } = useMutation({
    mutationFn: (values: Login) => userLogin(values),
    onSuccess: () => {
        router.push('/')
    }
  })

  const onSubmit = async (values: z.infer<typeof LoginValidation>) => {
    await loginMutation(values);
  };


  return (
    <div className="flex flex-col justify-center h-full px-[25%]">
      <h1 className="font-semibold text-3xl leading-none">Sign In</h1>
      <div className="mt-8">
        <p className="text-lg font-semibold mb-3">Login with your username!</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
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
                      } h-12 rounded-lg mt-4`}
                      placeholder="Password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-6 w-full bg-[#6950e8] hover:bg-[#4e2eeb] transition-all duration-500 text-white hover:text-white" variant={'outline'} >
                Sign In
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignInPageComponent;

"use client"
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { SignInValidation } from '@/lib/validations/sign-in'
import { z } from 'zod'

type Inputs = {
    username: string
    password: string
}

const initialValues = {
    username: '',
    password: ''
}

const SignInPageComponent = () => {    
    const {register, handleSubmit, watch, formState: {errors}} = useForm({
        defaultValues: initialValues,
        resolver: zodResolver(SignInValidation)
    })
    const onSubmit = async(data: z.infer<typeof SignInValidation>) => console.log('data', data);
        
    return (
        <div className='flex flex-col justify-center h-full px-[25%]'>
            <h1 className="font-semibold text-3xl leading-none">Sign In</h1>
            <div className="mt-12">
                <p className="text-lg font-semibold mb-3">Login with your username!</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>                    
                        <input className={`                            
                            w-full                            
                            px-3 
                            py-[12px] 
                            rounded-lg
                            bg-transparent                    
                            border-solid 
                            border-[1px]
                            ${errors.username ? 'border-red-600' : 'border-gray-800'}
                            ${errors.username ? 'border-opacity-100' : 'border-opacity-30'}
                            mb-2 
                            text-[14px]
                            hover:border-opacity-100                                                
                            `} 
                            placeholder="Username"
                            {...register("username")} 
                        />
                        {errors.username && <span className='text-sm text-red-600'>{errors.username.message || ''}</span>}
                    </div>
                    <div className='my-3'>                                     
                        <input className={`
                            w-full 
                            px-3 
                            py-[12px] 
                            rounded-lg
                            bg-transparent                    
                            border-solid 
                            border-[1px]
                            border-gray-800
                            ${errors.password ? 'border-red-600' : 'border-gray-800'}
                            ${errors.password ? 'border-opacity-100' : 'border-opacity-30'}
                            border-opacity-30 
                            mb-2 
                            text-[14px]
                            hover:border-opacity-100                    
                            `} 
                            placeholder="Password" 
                            type="password"
                            {...register("password")} 
                        />
                        {errors.password && <span className='text-sm inline-block text-red-500'>{errors.password.message || ''}</span>}
                    </div>
                    <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" />
                            <label className="font-medium text-[14px] leading-normal">Remember Me</label>
                        </div>                    
                        <p className="text-[13px] font-medium text-red-500">Forget Password</p>                    
                    </div>
                    <button className="mt-8 w-full text-center text-white py-[6px] px-[14px] bg-[#6950e8] leading-7 rounded-xl hover:bg-[#604ad0] hover:transition-colors">Sign In</button>
                </form>
            </div>
        </div>
    )
}

export default SignInPageComponent;
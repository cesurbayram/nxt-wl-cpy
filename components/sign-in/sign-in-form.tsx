

const SignInForm = () => {
    return (
        <>
            <p className="font-semibold text-3xl leading-none">Sign In</p>
            <div className="mt-12">
                <p className="text-lg font-semibold mb-3">Login with your username!</p>
                <input className="w-full px-3 py-[14px] bg-none rounded-lg border-[#111827] border-solid border-1 focus:border-[#007aff] mb-3 text-[14px]" placeholder="Username" />
                <input className="w-full px-3 py-[14px] bg-none rounded-lg border-[#111827] border-solid border-1 focus:border-[#007aff] mb-2 text-[14px]" placeholder="Password" type="password" />
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <label className="font-medium text-[14px] leading-normal">Remember Me</label>
                    </div>                    
                    <p className="text-[13px] font-medium text-red-500">Forget Password</p>                    
                </div>
                <button className="mt-8 w-full text-center text-white py-[6px] px-[14px] bg-[#6950e8] leading-7 rounded-xl hover:bg-[#604ad0] hover:transition-colors">Sign In</button>
            </div>
        </>
    )
}

export default SignInForm;
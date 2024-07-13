import Hero from "@/components/sign-in/hero";

export default function Layout({ children }: {children: React.ReactNode}) {
    return(
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className=" flex-grow w-full flex justify-center items-center bg-[#6950e8]">
                <Hero />
            </div>
            <div className="w-full flex-grow">
                {children}
            </div>
        </div>
    )
}

"use client"
import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CgProfile } from "react-icons/cg";
import { userLogout } from "@/utils/service/auth";
import { useRouter } from "next/navigation";

const UserProfileButton = () => {
    const router = useRouter()
    const { mutateAsync } = useMutation({
        mutationFn: () => userLogout(),
        onSuccess: () => {
            router.push('/sign-in')
        }
    })


  return (
    <Popover>      
      <PopoverTrigger asChild>
        <Button variant={"ghost"} size={"icon"} className="p-2 rounded-full">
          <CgProfile size={24} />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="relative left-20 -top-2 w-52 p-0">
        <div className="grid grid-cols-1 gap-y-4 ">
            <Button onClick={() => mutateAsync()} variant={'ghost'} size={'sm'}>Sign Out</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserProfileButton;

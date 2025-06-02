"use client";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CgProfile } from "react-icons/cg";
import { userLogout, getUserAfterAuth } from "@/utils/service/auth";
import { useRouter } from "next/navigation";
import {
  deleteDataFromStorage,
  getDataFromStorage,
  addStorage,
} from "@/utils/common/storage";
import { useEffect, useState } from "react";
import { User } from "@/types/user.types";

const formatName = (fullName: string) => {
  let result = "";
  const splittedName = fullName.split(" ");
  splittedName.forEach((item) => {
    if (item.length > 0) {
      result += item.substring(0, 1).toUpperCase();
    }
  });

  return result;
};

const UserProfileButton = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      let userData = getDataFromStorage("user");

      if (!userData) {
        try {
          userData = await getUserAfterAuth();
          addStorage("user", userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }

      setUser(userData);
    };

    loadUser();
  }, []);

  const logout = async () => {
    try {
      await userLogout();
      deleteDataFromStorage("user");
      router.push("/sign-in");
    } catch (error) {
      console.error("An error occured while logout: ", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} size={"icon"} className="p-2 rounded-full">
          <CgProfile size={24} />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="relative -top-2 w-60 p-2">
        <div className="grid grid-cols-1 gap-y-4 ">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex justify-center items-center border-2">
              <p className="font-semibold">
                {formatName(`${user?.name || ""} ${user?.lastName || ""}`)}
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm">
                {user?.name || ""} {user?.lastName || ""}
              </p>
              <p className="font-normal text-xs text-[#6b7280]">
                {user?.email || ""}
              </p>
              <p className="font-normal text-xs text-[#6b7280]">
                {user?.role || ""}
              </p>
            </div>
          </div>

          <div className="border border-black border-opacity-20" />

          <Button onClick={logout} variant={"ghost"} size={"sm"}>
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserProfileButton;

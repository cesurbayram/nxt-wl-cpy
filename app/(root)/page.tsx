"use client"
import LoadingUi from "@/components/shared/loading-ui";
import { User } from "@/types/user.types";
import { getUserAfterAuth } from "@/utils/service/auth";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const {data, isLoading} = useQuery<User, string>({
    queryFn: async () => await getUserAfterAuth(),
    queryKey: ["usersAuth"],
    gcTime: Infinity,
    retry: false,
    staleTime: Infinity
  })


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <LoadingUi isLoading={isLoading} />
      YASKAWA APP
    </main>
  );
}

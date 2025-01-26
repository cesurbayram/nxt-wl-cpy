"use client"
import LoadingUi from "@/components/shared/loading-ui";
import { addStorage, getDataFromStorage } from "@/utils/common/storage";
import { getUserAfterAuth } from "@/utils/service/auth";
import { useEffect, useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false)
  
  const getUserInfAfterAuth = async() => {
    try {
      setLoading(true);
      const userRes = await getUserAfterAuth()
      addStorage('user', userRes);
    } catch (error) {
      console.error('get-user-auth: An error occured: ', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const user = getDataFromStorage('user');
    if(!user) {
      getUserInfAfterAuth();
    }
  }, [])


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <LoadingUi isLoading={loading} />
      YASKAWA APP
    </main>
  );
}

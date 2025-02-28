"use client";
import LoadingUi from "@/components/shared/loading-ui";
import PageWrapper from "@/components/shared/page-wrapper";
import UserListNew from "@/components/user/user-list-new";
import { User } from "@/types/user.types";
import { deleteUser, getUser } from "@/utils/service/user";
import { useRouter } from "next/navigation";
import { HiUsers } from "react-icons/hi";
import { Fragment, useState, useEffect } from "react";

const Page = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await getUser();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteMutation = async ({ id }: User) => {
    setIsPending(true);
    try {
      await deleteUser({ id });
      await fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleRouteUserCreate = () => {
    router.push("/user/0");
  };

  return (
    <Fragment>
      <LoadingUi isLoading={isLoading || isPending} />
      <PageWrapper
        buttonText="Add New User"
        pageTitle="Users"
        icon={<HiUsers size={24} color="#6950e8" />}
        buttonAction={handleRouteUserCreate}
      >
        <UserListNew users={users || []} deleteClick={deleteMutation} />
      </PageWrapper>
    </Fragment>
  );
};

export default Page;

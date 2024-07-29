"use client"
import LoadingUi from "@/components/shared/loading-ui";
import PageWrapper from "@/components/shared/page-wrapper"
import UserListNew from "@/components/user/user-list-new";
import { User } from "@/types/user.types";
import { deleteUser, getUser } from "@/utils/service/user";
import { useEffect, useState } from "react";
import { HiUsers } from "react-icons/hi";
import { useMutation, useQuery, useQueryClient } from "react-query";


const Page = () => {
    const queryClient = useQueryClient()
    const {data: users, isLoading} = useQuery<User[], string>({
        queryFn: async () => await getUser(),
        queryKey: ['users']
    })

    const {mutate, isLoading: deleteLoading} = useMutation({
        mutationFn: async ({id}: User) => await deleteUser({id}),
        onSuccess: () => {
            queryClient.invalidateQueries(['users'])
        }
    })
    
    return (
        <>
            <LoadingUi isLoading={isLoading || deleteLoading} />
            <PageWrapper
                buttonText="Add New User"
                pageTitle="Users"
                icon={<HiUsers size={24} color="#6950e8" />}
            >
                <UserListNew users={users || []} deleteClick={mutate} />
            </PageWrapper>
        </>
    )
}

export default Page
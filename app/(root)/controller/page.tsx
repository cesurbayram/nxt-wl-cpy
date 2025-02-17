"use client";
import React, { useEffect, useState } from "react";
import ControllerList from "@/components/controller/controller-list";
import LoadingUi from "@/components/shared/loading-ui";
import PageWrapper from "@/components/shared/page-wrapper";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GiRobotGrab } from "react-icons/gi";
import { deleteController, getController } from "@/utils/service/controller";
import { Controller } from "@/types/controller.types";
import Timer from "@/components/shared/timer";

const Page = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [controller, setController] = useState<Controller[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Başlangıçta true
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false); // Yeni state

  const listController = async () => {
    try {
      const controllerRes = await getController();
      setController(controllerRes);
    } catch (error) {
      console.error("/api/controller: ", error);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  };

  useEffect(() => {
    listController();
  }, []);

  const { mutateAsync: deleteMutation, isPending } = useMutation({
    mutationFn: ({ id }: Controller) => deleteController({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["controller"] });
    },
  });

  const handleRouteControllerCreate = () => {
    router.push("/controller/0");
  };

  return (
    <>
      <LoadingUi isLoading={loading || isPending} />
      <PageWrapper
        buttonText="Add New Controller"
        pageTitle="Controllers"
        icon={<GiRobotGrab size={24} color="#6950e8" />}
        buttonAction={handleRouteControllerCreate}
      >
        {initialLoadDone && controller.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <GiRobotGrab size={48} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">
              No Controllers Added
            </h3>
            <p className="text-gray-500 mt-2">
              Click "Add New Controller" to get started
            </p>
          </div>
        ) : (
          <>
            {controller.length > 0 && (
              <div className="w-1/3 px-6 mb-2">
                <Timer callback={listController} />
              </div>
            )}
            <ControllerList
              controller={controller || []}
              deleteClick={deleteMutation}
            />
          </>
        )}
      </PageWrapper>
    </>
  );
};

export default Page;

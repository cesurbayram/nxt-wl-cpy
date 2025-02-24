"use client";

import LoadingUi from "@/components/shared/loading-ui";
import { addStorage, getDataFromStorage } from "@/utils/common/storage";
import { getUserAfterAuth } from "@/utils/service/auth";
import { getController } from "@/utils/service/controller";
import { useEffect, useState } from "react";
import { Controller } from "@/types/controller.types";
import Image from "next/image";

// Controller tiplerine göre resim mapping'i
const controllerImages: { [key: string]: string } = {
  yrc1000: "/yrc1000.png",
  yrc1000micro: "/yrc1000m.png",
  dx200: "/dx200.png",
  dx100: "/dx100.jpg",
  fs100: "/fs100.jpg",
};

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [selectedController, setSelectedController] =
    useState<Controller | null>(null);

  const getUserInfAfterAuth = async () => {
    try {
      setLoading(true);
      const userRes = await getUserAfterAuth();
      addStorage("user", userRes);
    } catch (error) {
      console.error("get-user-auth: An error occured: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchControllers = async () => {
    try {
      setLoading(true);
      const data = await getController();
      setControllers(data);
    } catch (error) {
      console.error("Error fetching controllers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getControllerImage = (model: string | undefined): string => {
    if (!model) return "/yaskawa-logo.png";
    const modelKey = model.toLowerCase();
    return controllerImages[modelKey] || "/yaskawa-logo.png";
  };

  useEffect(() => {
    const user = getDataFromStorage("user");
    if (!user) {
      getUserInfAfterAuth();
    }
    fetchControllers();
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-6">
      <LoadingUi isLoading={loading} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6950e8] to-[#8b75ff] bg-clip-text text-transparent">
          WatchLog
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mt-2">
          Controller Dashboard
        </p>
      </div>

      {/* Controller Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controller List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Controllers
          </h2>
          <div className="space-y-4">
            {controllers.map((controller) => (
              <div
                key={controller.id}
                onClick={() => setSelectedController(controller)}
                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all
                  ${
                    selectedController?.id === controller.id
                      ? "bg-[#6950e8] text-white"
                      : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
              >
                <div className="w-24 h-24 relative mr-4">
                  <Image
                    src={getControllerImage(controller.model)}
                    alt={controller.model || "Controller"}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {controller.name}
                  </h3>
                  <p
                    className={
                      selectedController?.id === controller.id
                        ? "text-gray-200"
                        : "text-gray-600 dark:text-gray-300"
                    }
                  >
                    {controller.model === "yrc1000"
                      ? "YRC1000"
                      : controller.model === "yrc1000m"
                      ? "YRC1000m"
                      : controller.model === "dx200"
                      ? "DX200"
                      : controller.model === "dx100"
                      ? "DX100"
                      : controller.model === "fs100"
                      ? "FS100"
                      : "Unknown Model"}
                  </p>
                  <p
                    className={
                      selectedController?.id === controller.id
                        ? "text-gray-200"
                        : "text-gray-600 dark:text-gray-300"
                    }
                  >
                    IP: {controller.ipAddress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

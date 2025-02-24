"use client";

import LoadingUi from "@/components/shared/loading-ui";
import { addStorage, getDataFromStorage } from "@/utils/common/storage";
import { getUserAfterAuth } from "@/utils/service/auth";
import { getController } from "@/utils/service/controller";
import { useEffect, useState } from "react";
import { Controller } from "@/types/controller.types";
import { UtilizationData } from "@/types/utilization.types";
import Image from "next/image";
import dynamic from "next/dynamic";
import { getUtilizationData } from "@/utils/service/utilization";

const controllerImages: { [key: string]: string } = {
  yrc1000: "/yrc1000.png",
  yrc1000micro: "/yrc1000m.png",
  dx200: "/dx200.png",
  dx100: "/dx100.jpg",
  fs100: "/fs100.jpg",
};

// Dinamik import ile UtilizationChart'ı client-side'da yükle
const UtilizationChart = dynamic(
  () => import("@/components/controller/utilization/utilization-chart"),
  { ssr: false }
);

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [selectedController, setSelectedController] =
    useState<Controller | null>(null);
  const [utilizationData, setUtilizationData] = useState<UtilizationData[]>([]);
  const [utilizationLoading, setUtilizationLoading] = useState<boolean>(false);

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

  const fetchUtilizationData = async (controllerId: string) => {
    try {
      setUtilizationLoading(true);
      setUtilizationData([]); // Önceki verileri temizle
      const data = await getUtilizationData(controllerId, "7d", "1h");

      if (data && Array.isArray(data) && data.length > 0) {
        const formattedData = data.map((item: any, index: number) => ({
          id: index.toString(),
          controller_id: controllerId,
          control_power_time: item.control_power_time || 0,
          servo_power_time: item.servo_power_time || 0,
          playback_time: item.playback_time || 0,
          moving_time: item.moving_time || 0,
          operating_time: item.operating_time || 0,
          timestamp: item.timestamp || new Date().toISOString(),
          created_at: new Date().toISOString(),
        }));
        setUtilizationData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching utilization data:", error);
      setUtilizationData([]);
    } finally {
      setUtilizationLoading(false);
    }
  };

  const handleControllerSelect = async (controller: Controller) => {
    setSelectedController(controller);
    if (controller.id) {
      await fetchUtilizationData(controller.id);
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
        {/* Controller List - Sol Panel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Controllers
          </h2>
          <div className="space-y-4">
            {controllers.map((controller) => (
              <div
                key={controller.id}
                onClick={() => handleControllerSelect(controller)}
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

        {/* Controller Details - Sağ Panel */}
        {selectedController ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Controller Details
              </h2>
              <div className="flex items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 w-1/2">
                  {selectedController.name}
                </p>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                    Status:
                  </span>
                  <div className="flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        selectedController.controllerStatus?.connection
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        selectedController.controllerStatus?.connection
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {selectedController.controllerStatus?.connection
                        ? "Connected"
                        : "Disconnected"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Temel Bilgiler */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-8">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Model
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedController.model?.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Application
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedController.application?.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Serial Number
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedController.serialNumber || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Location
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedController.location || "-"}
                </p>
              </div>
            </div>

            {/* Utilization Chart */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Utilization Data
              </h3>
              {utilizationLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6950e8]"></div>
                </div>
              ) : utilizationData.length > 0 ? (
                <UtilizationChart data={utilizationData} viewType="bar" />
              ) : (
                <div className="text-center p-4 text-gray-500">
                  No utilization data available
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a controller from the left panel
          </div>
        )}
      </div>
    </main>
  );
}

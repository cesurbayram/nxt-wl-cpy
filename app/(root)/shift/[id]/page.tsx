"use client";

import React, { useEffect, useState } from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import { MdCalendarViewWeek } from "react-icons/md";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import LoadingUi from "@/components/shared/loading-ui";
import { Shift } from "@/types/shift.types";
import { getShifts, deleteShift, createShift } from "@/utils/service/shift";
import { getControllerById } from "@/utils/service/controller";
import { Controller } from "@/types/controller.types";
import ShiftList from "@/components/shift/shift-list";
import Timer from "@/components/shared/timer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ShiftForm from "@/components/shift/shift-form";
import { toast } from "sonner";
import { IoIosArrowBack } from "react-icons/io";
import { FaRegClipboard } from "react-icons/fa";
import {
  MdSettings,
  MdBuildCircle,
  MdProductionQuantityLimits,
} from "react-icons/md";
import { IoMdAnalytics } from "react-icons/io";

const tabItems = [
  {
    label: "Shifts",
    value: "shifts",
  },
  {
    label: "Production Volume",
    value: "production",
  },
  {
    label: "Maintenances",
    value: "maintenances",
  },
  {
    label: "Reports",
    value: "reports",
  },
  {
    label: "Analytics",
    value: "analytics",
  },
  {
    label: "Settings",
    value: "settings",
  },
];

export default function ShiftDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [controller, setController] = useState<Controller | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("shifts");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const fetchData = async () => {
    try {
      const [controllerData, shiftsData] = await Promise.all([
        getControllerById(id),
        getShifts(),
      ]);

      setController(controllerData);
      setShifts(shiftsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleDeleteShift = async (shift: Shift) => {
    try {
      await deleteShift(shift);
      toast.success("Shift deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast.error("Failed to delete shift");
    }
  };

  const handleCreateShift = async (data: Shift) => {
    setIsSubmitting(true);
    try {
      await createShift(data);
      toast.success("Shift created successfully");
      setIsOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error creating shift:", error);
      toast.error("Failed to create shift");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleShiftSelect = (shift: Shift) => {
    setSelectedShift(shift);
  };

  if (loading) {
    return <LoadingUi isLoading={loading} />;
  }

  return (
    <PageWrapper
      pageTitle=""
      icon={<MdCalendarViewWeek size={24} color="#6950e8" />}
      shownHeaderButton={false}
      additionalComponent={
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <h2 className="text-lg font-medium">
              Shift Management - {controller?.name}
            </h2>
          </div>
          <Button
            variant="default"
            className="bg-[#6950E8] text-white flex items-center gap-2 px-4 py-2 rounded-md"
            onClick={() => router.push("/shift")}
          >
            <IoIosArrowBack size={16} /> Back to Controllers
          </Button>
        </div>
      }
    >
      <Tabs
        defaultValue="shifts"
        className="mt-5"
        onValueChange={handleTabChange}
      >
        <div className="overflow-x-auto">
          <TabsList className="w-full min-w-max flex">
            {tabItems.map((item) => (
              <TabsTrigger 
                key={item.value} 
                value={item.value} 
                className="flex-1 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="sm:hidden">
                  {item.value === "shifts" ? "Shifts" :
                   item.value === "production" ? "Prod" :
                   item.value === "maintenances" ? "Maint" :
                   item.value === "reports" ? "Reports" :
                   item.value === "analytics" ? "Analytics" :
                   item.value === "settings" ? "Settings" :
                   item.label}
                </span>
                <span className="hidden sm:inline">
                  {item.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="shifts">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <img
                      src="/yrc1000.png"
                      alt="Robot Controller"
                      className="w-48 h-auto mb-4"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 border-b pb-3">
                      <span className="text-gray-500 font-medium">
                        Controller:
                      </span>
                      <span>{controller?.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b pb-3">
                      <span className="text-gray-500 font-medium">Model:</span>
                      <span>{controller?.model}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b pb-3">
                      <span className="text-gray-500 font-medium">
                        Location:
                      </span>
                      <span>{controller?.location}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b pb-3">
                      <span className="text-gray-500 font-medium">
                        Total Shifts:
                      </span>
                      <span>{shifts?.length || 0}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-500 font-medium">Status:</span>
                      <span
                        className={
                          controller?.status === "active"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {controller?.status === "active" ? "Active" : "Passive"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="mb-6">
                <CardContent className="py-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base text-gray-600 font-medium">
                      Shift List
                    </h3>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          className="bg-[#6950E8] text-white w-36 justify-center"
                        >
                          Add New Shift
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogTitle>Create New Shift</DialogTitle>
                        <ShiftForm
                          onSubmit={handleCreateShift}
                          isLoading={isSubmitting}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  {initialLoadDone && shifts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8">
                      <MdCalendarViewWeek
                        size={48}
                        className="text-gray-400 mb-4"
                      />
                      <h3 className="text-xl font-semibold text-gray-700">
                        No Shifts Found
                      </h3>
                      <p className="text-gray-500 mt-2">
                        Please add shifts for this controller
                      </p>
                    </div>
                  ) : (
                    <ShiftList
                      shifts={shifts}
                      deleteClick={handleDeleteShift}
                      onShiftSelect={handleShiftSelect}
                      selectedShiftId={selectedShift?.id}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="production">
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex flex-col items-center justify-center p-8">
                <MdProductionQuantityLimits
                  size={48}
                  className="text-gray-400 mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-700">
                  Shift Production Volume
                </h3>
                <p className="text-gray-500 mt-2">
                  This feature will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenances">
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex flex-col items-center justify-center p-8">
                <MdBuildCircle size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">
                  Shift Maintenances
                </h3>
                <p className="text-gray-500 mt-2">
                  This feature will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex flex-col items-center justify-center p-8">
                <FaRegClipboard size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">
                  Shift Reports
                </h3>
                <p className="text-gray-500 mt-2">
                  This feature will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex flex-col items-center justify-center p-8">
                <IoMdAnalytics size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">
                  Shift Analytics
                </h3>
                <p className="text-gray-500 mt-2">
                  This feature will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex flex-col items-center justify-center p-8">
                <MdSettings size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">
                  Shift Settings
                </h3>
                <p className="text-gray-500 mt-2">
                  This feature will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

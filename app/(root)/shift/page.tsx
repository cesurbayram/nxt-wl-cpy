"use client";

import React, { useEffect, useState } from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import { MdCalendarViewWeek } from "react-icons/md";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import LoadingUi from "@/components/shared/loading-ui";
import { Shift } from "@/types/shift.types";
import {
  getShifts,
  deleteShift,
  updateShift,
  createShift,
} from "@/utils/service/shift";
import ShiftList from "@/components/shift/shift-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ShiftForm from "@/components/shift/shift-form";
import { toast } from "sonner";
import ProductionValueForm from "@/components/shift/production-value/production-value-form";
import ProductionValueList from "@/components/shift/production-value/production-value-list";
import ShiftMaintenance from "@/components/shift/maintenance/shift-maintenance";

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

export default function ShiftPage() {
  const router = useRouter();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("shifts");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [productionValueRefresh, setProductionValueRefresh] = useState(0);

  const fetchData = async () => {
    try {
      const shiftsData = await getShifts();
      setShifts(shiftsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleEditShift = async (data: Shift) => {
    setIsSubmitting(true);
    try {
      await updateShift(data);
      toast.success("Shift updated successfully");
      setIsEditOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating shift:", error);
      toast.error("Failed to update shift");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductionValueSuccess = () => {
    setProductionValueRefresh((prev) => prev + 1);
  };

  if (loading) {
    return <LoadingUi isLoading={loading} />;
  }

  return (
    <PageWrapper
      pageTitle="Shift Management"
      icon={<MdCalendarViewWeek size={24} color="#6950e8" />}
      shownHeaderButton={false}
    >
      <Tabs
        defaultValue="shifts"
        className="mt-5"
        onValueChange={handleTabChange}
      >
        <TabsList className="w-full flex">
          {tabItems.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="flex-1">
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="shifts">
          <div className="grid grid-cols-1 gap-6">
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
                      Please add shifts using the button above
                    </p>
                  </div>
                ) : (
                  <ShiftList
                    shifts={shifts}
                    deleteClick={handleDeleteShift}
                    onShiftSelect={handleShiftSelect}
                    selectedShiftId={selectedShift?.id}
                    onEditClick={(shift) => {
                      setSelectedShift(shift);
                      setIsEditOpen(true);
                    }}
                  />
                )}
              </CardContent>
            </Card>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-2xl">
                <DialogTitle>Edit Shift</DialogTitle>
                {selectedShift && (
                  <ShiftForm
                    initialData={selectedShift}
                    onSubmit={handleEditShift}
                    isLoading={isSubmitting}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="production">
          <div className="grid grid-cols-1 gap-6">
            <Card className="mb-6">
              <CardContent className="py-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base text-gray-600 font-medium">
                    Add Production Volume
                  </h3>
                </div>
                <ProductionValueForm onSuccess={handleProductionValueSuccess} />
              </CardContent>
            </Card>

            <ProductionValueList
              onDeleteSuccess={handleProductionValueSuccess}
              refresh={productionValueRefresh}
            />
          </div>
        </TabsContent>

        <TabsContent value="maintenances">
          <ShiftMaintenance />
        </TabsContent>

        <TabsContent value="reports">
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex flex-col items-center justify-center p-8">
                <MdCalendarViewWeek size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Reports</h3>
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
                <MdCalendarViewWeek size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">
                  Analytics
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
                <MdCalendarViewWeek size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">
                  Settings
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

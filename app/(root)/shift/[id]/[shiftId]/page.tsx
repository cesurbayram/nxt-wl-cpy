"use client";

import React, { useEffect, useState } from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import { MdCalendarViewWeek } from "react-icons/md";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import LoadingUi from "@/components/shared/loading-ui";
import { Shift } from "@/types/shift.types";
import { getShiftById, updateShift } from "@/utils/service/shift";
import { getControllerById } from "@/utils/service/controller";
import { Controller } from "@/types/controller.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShiftForm from "@/components/shift/shift-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IoIosArrowBack } from "react-icons/io";

export default function ShiftDetailPage({
  params,
}: {
  params: { id: string; shiftId: string };
}) {
  const router = useRouter();
  const { id, shiftId } = params;
  const [shift, setShift] = useState<Shift | null>(null);
  const [controller, setController] = useState<Controller | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [controllerData, shiftData] = await Promise.all([
        getControllerById(id),
        getShiftById(shiftId),
      ]);

      setController(controllerData);
      setShift(shiftData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load shift details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && shiftId) {
      fetchData();
    }
  }, [id, shiftId]);

  const handleUpdateShift = async (data: Shift) => {
    setIsSubmitting(true);
    try {
      const shiftData = {
        ...data,
        id: shiftId,
        controllerId: id,
      };
      await updateShift(shiftData);
      toast.success("Shift updated successfully");
      fetchData();
    } catch (error) {
      console.error("Error updating shift:", error);
      toast.error("Failed to update shift");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoadingUi isLoading={loading} />
      <PageWrapper
        pageTitle={`Shift Details - ${shift?.name || "Loading..."}`}
        icon={<MdCalendarViewWeek size={24} color="#6950e8" />}
        shownHeaderButton={false}
      >
        <div className="mb-4 px-6 pt-6">
          <Button
            variant="default"
            className="bg-[#6950E8] hover:bg-[#5842c6] text-white flex items-center gap-2 px-4 py-2 rounded-md"
            onClick={() => router.push(`/shift/${id}`)}
          >
            <IoIosArrowBack size={16} /> Back to Shifts
          </Button>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Shift Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Shift Details</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                {shift && (
                  <div className="p-4">
                    <ShiftForm
                      initialData={shift}
                      onSubmit={handleUpdateShift}
                      isLoading={isSubmitting}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </PageWrapper>
    </>
  );
}

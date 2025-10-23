"use client";
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import dynamic from "next/dynamic";


const ControllerTabs = dynamic(() => import("./controller-tabs"), {
    loading: () => (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6950e8]"></div>
        </div>
    ),
    ssr: false,
});

interface ControllerDetailDrawerProps {
    open: boolean;
    onClose: () => void;
    controllerId: string | null;
    controllerName?: string;
}

export default function ControllerDetailDrawer({
    open,
    onClose,
    controllerId,
    controllerName,
}: ControllerDetailDrawerProps) {
    if (!controllerId) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="w-full sm:w-[90vw] sm:max-w-[1200px] p-0 flex flex-col"
            >
                <SheetHeader className="sr-only">
                    <SheetTitle>{controllerName || "Controller Details"}</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-hidden px-6 py-4">
                    <ControllerTabs
                        controllerId={controllerId}
                        controllerName={controllerName}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}


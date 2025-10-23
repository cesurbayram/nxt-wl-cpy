"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

interface MaintenanceTabProps {
  controllerId: string;
}

export default function MaintenanceTab({ controllerId }: MaintenanceTabProps) {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[#6950e8]" />
            Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Maintenance schedule and logs will be displayed here</p>
            <p className="text-sm mt-2">Preventive maintenance, service history, and tasks</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


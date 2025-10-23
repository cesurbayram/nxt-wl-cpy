"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

interface BackupTabProps {
  controllerId: string;
}

export default function BackupTab({ controllerId }: BackupTabProps) {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-[#6950e8]" />
            Backup Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Backup history and management tools will be here</p>
            <p className="text-sm mt-2">View, create, and restore backups</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


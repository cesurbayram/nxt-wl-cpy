"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Plans from "./plans";
import PlansList from "./plans-list";
import { useState, useEffect } from "react";
import { getBackupPlans } from "@/utils/service/files";
import LoadingUi from "@/components/shared/loading-ui";
import { BackupPlan } from "@/types/files.types";

interface FilesProps {
  controllerId: string;
}

export function Files({ controllerId }: FilesProps) {
  const [plans, setPlans] = useState<BackupPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const data = await getBackupPlans(controllerId);
        setPlans(data);
      } catch (error) {
        console.error("Error fetching backup plans:", error);
      }
      setIsLoading(false);
    };

    fetchPlans();
  }, [controllerId]);

  return (
    <>
      <LoadingUi isLoading={isLoading} />
      <Tabs
        defaultValue="create"
        className="grid grid-cols-5 gap-3"
        orientation="vertical"
      >
        <TabsList className="flex flex-col h-fit border-2 gap-1">
          <TabsTrigger value="create" className="w-full text-sm font-medium">
            Create Plan
          </TabsTrigger>
          <TabsTrigger value="list" className="w-full text-sm font-medium">
            Plan List
          </TabsTrigger>
        </TabsList>

        <div className="col-span-4">
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Create Backup Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Plans
                  controllerId={controllerId}
                  plans={plans}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <PlansList controllerId={controllerId} />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}

export default Files;

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Plans from "./plans";
import PlansList from "./plans-list";
import { useQuery } from "@tanstack/react-query";
import { getBackupPlans } from "@/utils/service/files";
import LoadingUi from "@/components/shared/loading-ui";

interface FilesProps {
  controllerId: string;
}

export function Files({ controllerId }: FilesProps) {
  // Plans için gerekli veriyi çekelim
  const { data: plans, isLoading } = useQuery({
    queryKey: ["backup-plans", controllerId],
    queryFn: () => getBackupPlans(controllerId),
    staleTime: 1000 * 60, // 1 dakika
  });

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
                  plans={plans || []}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Backup Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlansList controllerId={controllerId} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}

export default Files;

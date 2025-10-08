"use client";
import React, { useEffect, useState } from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import LoadingUi from "@/components/shared/loading-ui";
import { Home as HomeIcon } from "lucide-react";
import Link from "next/link";
import { SystemHealthReportButton } from "@/components/home/system-health-report-button";
import { UtilizationReportButton } from "@/components/home/utilization-report-button";
import { OperatingRateReportButton } from "@/components/home/operating-rate-report-button";
import { AlarmReportButton } from "@/components/home/alarm-report-button";

interface Controller {
  id: string;
  name: string;
  ipAddress: string;
  status: string;
  location?: string;
  application?: string;
}

interface CellWithControllers {
  id: string;
  name: string;
  status: string;
  lineId: string;
  controllers: Controller[];
}

interface LineHierarchy {
  id: string;
  name: string;
  status: string;
  factoryName: string;
  cells: CellWithControllers[];
}

const HomePage = () => {
  const [lines, setLines] = useState<LineHierarchy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHierarchy = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/home/hierarchy");

      if (!response.ok) {
        throw new Error("Failed to fetch hierarchy");
      }

      const data: LineHierarchy[] = await response.json();
      setLines(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching hierarchy:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);


  if (error) {
    return (
      <>
        <LoadingUi isLoading={isLoading} />
        <PageWrapper
          shownHeaderButton={false}
          pageTitle="Home"
          icon={<HomeIcon size={24} color="#6950e8" />}
          headerActions={
            <div className="grid grid-cols-2 lg:flex lg:flex-row gap-1 sm:gap-2 items-center justify-end">
              <SystemHealthReportButton className="flex-shrink-0" />
              <UtilizationReportButton className="flex-shrink-0" />
              <OperatingRateReportButton className="flex-shrink-0" />
              <AlarmReportButton className="flex-shrink-0" />
            </div>
          }
        >
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <LoadingUi isLoading={isLoading} />
      <PageWrapper
        shownHeaderButton={false}
        pageTitle="Home"
        icon={<HomeIcon size={24} color="#6950e8" />}
        headerActions={
          <div className="grid grid-cols-2 lg:flex lg:flex-row gap-1 sm:gap-2 items-center justify-end">
            <SystemHealthReportButton className="flex-shrink-0" />
            <UtilizationReportButton className="flex-shrink-0" />
            <OperatingRateReportButton className="flex-shrink-0" />
            <AlarmReportButton className="flex-shrink-0" />
          </div>
        }
      >
        {lines.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No production lines configured</p>
          </div>
        ) : (
          <div className="space-y-6">
            {lines.map((line) => (
              <div key={line.id}>
                {line.cells.map((cell) => (
                  <div
                    key={cell.id}
                    className="bg-white rounded-lg border shadow-sm overflow-hidden mb-6"
                  >
                    <div className="border-b bg-gray-50 px-4 py-3">
                      <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <span>📍</span>
                        Factory {line.factoryName} / Line {line.name}
                      </h2>
                    </div>

                    {cell.controllers.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">
                          No controllers in this cell
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r">
                                Cell Name
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r">
                                Controller
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r">
                                IP Address
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                Application
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {cell.controllers.map((controller, index) => {
                              return (
                                <tr
                                  key={controller.id}
                                  className="border-b hover:bg-muted/50 transition-colors"
                                >
                                  {index === 0 && (
                                    <td
                                      rowSpan={cell.controllers.length}
                                      className="px-4 py-3 font-medium text-gray-900 border-r bg-gray-50"
                                    >
                                      {cell.name}
                                    </td>
                                  )}
                                  <td className="px-4 py-3 border-r">
                                    <span className="text-sm text-gray-700 font-medium">
                                      {controller.name}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 border-r">
                                    <span className="font-mono text-sm text-gray-600">
                                      {controller.ipAddress}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-sm text-gray-700 font-medium uppercase">
                                      {controller.application || "N/A"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </PageWrapper>
    </>
  );
};

export default HomePage;

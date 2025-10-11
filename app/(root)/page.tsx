"use client";
import React, { useEffect, useState } from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import LoadingUi from "@/components/shared/loading-ui";
import { Home as HomeIcon, MapPin, Server, Network } from "lucide-react";
import Link from "next/link";

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
      >
        {lines.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No production lines configured</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lines.map((line) => (
              <div key={line.id}>
                {line.cells.map((cell) => (
                  <div
                    key={cell.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mb-4"
                  >
                    {/* Header - Light and clean */}
                    <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#6950e8]/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-[#6950e8]" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Factory {line.factoryName} / Line {line.name}
                        </h2>
                      </div>
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
                            <tr className="bg-gray-50">
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-r border-gray-300">
                                Cell Name
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-r border-gray-300">
                                Controller
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-r border-gray-300">
                                IP Address
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                                Application
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-300">
                            {cell.controllers.map((controller, index) => {
                              return (
                                <tr
                                  key={controller.id}
                                  className="hover:bg-gray-50 transition-colors duration-150"
                                >
                                  {index === 0 && (
                                    <td
                                      rowSpan={cell.controllers.length}
                                      className="px-6 py-4 font-bold text-gray-900 bg-gray-50/50 border-r border-gray-300"
                                    >
                                      {cell.name}
                                    </td>
                                  )}
                                  <td className="px-6 py-4 border-r border-gray-300">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {controller.name}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 border-r border-gray-300">
                                    <span className="font-mono text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                                      {controller.ipAddress}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase bg-gray-100 text-gray-700 border border-gray-200">
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

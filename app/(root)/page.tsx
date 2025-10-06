"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "@/components/shared/page-wrapper";
import LoadingUi from "@/components/shared/loading-ui";
import { Home as HomeIcon } from "lucide-react";
import Link from "next/link";
import {
  fetchSystemData,
  getSystemFileContent,
} from "@/utils/service/system-info/system-info";
import {
  parseSystemFile,
  formatRobotModel,
  formatApplication,
  type ParsedSystemInfo,
} from "@/utils/common/parse-system-file";

interface ControllerWithSystemInfo {
  id: string;
  name: string;
  ipAddress: string;
  status: string;
  location?: string;
  cellId?: string;
  controllerStatus?: {
    teach: string;
    servo: boolean;
    operating: boolean;
    connection: boolean;
  };
  systemInfo?: ParsedSystemInfo;
  isLoadingSystemInfo?: boolean;
}

interface CellWithControllers {
  id: string;
  name: string;
  status: string;
  lineId: string;
  controllers: ControllerWithSystemInfo[];
}

interface LineHierarchy {
  id: string;
  name: string;
  status: string;
  cells: CellWithControllers[];
}

const HomePage = () => {
  const router = useRouter();
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

      // Automatically fetch system.sys for all controllers
      for (const line of data) {
        for (const cell of line.cells) {
          for (const controller of cell.controllers) {
            fetchControllerSystemInfo(controller.id, line.id, cell.id);
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching hierarchy:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchControllerSystemInfo = async (
    controllerId: string,
    lineId: string,
    cellId: string
  ) => {
    try {
      // Update loading state
      setLines((prev) =>
        prev.map((line) =>
          line.id === lineId
            ? {
                ...line,
                cells: line.cells.map((cell) =>
                  cell.id === cellId
                    ? {
                        ...cell,
                        controllers: cell.controllers.map((ctrl) =>
                          ctrl.id === controllerId
                            ? { ...ctrl, isLoadingSystemInfo: true }
                            : ctrl
                        ),
                      }
                    : cell
                ),
              }
            : line
        )
      );

      // Request system.sys file from robot
      await fetchSystemData(controllerId, "SYSTEM.SYS");

      // Wait a bit for the file to be saved
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get the file content
      const systemFileResponse = await getSystemFileContent(controllerId);

      if (systemFileResponse.success && systemFileResponse.content) {
        const parsedInfo = parseSystemFile(systemFileResponse.content);

        // Update the controller with parsed system info
        setLines((prev) =>
          prev.map((line) =>
            line.id === lineId
              ? {
                  ...line,
                  cells: line.cells.map((cell) =>
                    cell.id === cellId
                      ? {
                          ...cell,
                          controllers: cell.controllers.map((ctrl) =>
                            ctrl.id === controllerId
                              ? {
                                  ...ctrl,
                                  systemInfo: parsedInfo,
                                  isLoadingSystemInfo: false,
                                }
                              : ctrl
                          ),
                        }
                      : cell
                  ),
                }
              : line
          )
        );
      } else {
        // Mark as failed
        setLines((prev) =>
          prev.map((line) =>
            line.id === lineId
              ? {
                  ...line,
                  cells: line.cells.map((cell) =>
                    cell.id === cellId
                      ? {
                          ...cell,
                          controllers: cell.controllers.map((ctrl) =>
                            ctrl.id === controllerId
                              ? { ...ctrl, isLoadingSystemInfo: false }
                              : ctrl
                          ),
                        }
                      : cell
                  ),
                }
              : line
          )
        );
      }
    } catch (error) {
      console.error(`Error fetching system info for ${controllerId}:`, error);
      setLines((prev) =>
        prev.map((line) =>
          line.id === lineId
            ? {
                ...line,
                cells: line.cells.map((cell) =>
                  cell.id === cellId
                    ? {
                        ...cell,
                        controllers: cell.controllers.map((ctrl) =>
                          ctrl.id === controllerId
                            ? { ...ctrl, isLoadingSystemInfo: false }
                            : ctrl
                        ),
                      }
                    : cell
                ),
              }
            : line
        )
      );
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const getControllerMode = (controller: ControllerWithSystemInfo): string => {
    if (!controller.controllerStatus?.connection) {
      return "Disconnected";
    }

    const teach = controller.controllerStatus?.teach;
    const operating = controller.controllerStatus?.operating;

    if (teach === "TEACH" || teach === "TEACH ON") {
      return "Teach";
    } else if (operating) {
      return "Running";
    } else {
      return "Standby";
    }
  };

  const getModeColor = (mode: string): string => {
    switch (mode.toLowerCase()) {
      case "running":
        return "bg-green-100 text-green-800 border border-green-200";
      case "teach":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "standby":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      case "disconnected":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

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
                        Line {line.name}
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
                                Model
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r">
                                Version
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r">
                                Application
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {cell.controllers.map((controller, index) => {
                              const mode = getControllerMode(controller);
                              const modeColor = getModeColor(mode);

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
                                    <Link
                                      href={`/controller/${controller.id}/details`}
                                      className="text-[#6950e8] hover:underline font-medium inline-flex items-center gap-2 group"
                                    >
                                      <span>{controller.name}</span>
                                      <svg
                                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    </Link>
                                  </td>
                                  <td className="px-4 py-3 border-r">
                                    {controller.isLoadingSystemInfo ? (
                                      <span className="inline-flex items-center gap-2 text-gray-500 text-sm">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                      </span>
                                    ) : controller.systemInfo?.robotModel ? (
                                      <span className="font-mono text-sm text-gray-700">
                                        {formatRobotModel(
                                          controller.systemInfo.robotModel
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-sm">
                                        N/A
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 border-r">
                                    {controller.isLoadingSystemInfo ? (
                                      <span className="inline-flex items-center gap-2 text-gray-500 text-sm">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                      </span>
                                    ) : controller.systemInfo?.version ? (
                                      <span className="font-mono text-sm text-gray-700">
                                        {controller.systemInfo.version}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-sm">
                                        N/A
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 border-r">
                                    {controller.isLoadingSystemInfo ? (
                                      <span className="inline-flex items-center gap-2 text-gray-500 text-sm">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                      </span>
                                    ) : controller.systemInfo?.application ? (
                                      <span className="text-sm text-gray-700">
                                        {formatApplication(
                                          controller.systemInfo.application
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-sm">
                                        N/A
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-block px-3 py-1 rounded text-sm font-medium ${modeColor}`}
                                    >
                                      {mode}
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

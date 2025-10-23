"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { parseSystemFile } from "@/utils/common/parse-system-file";

interface BasicInfoTabProps {
  controllerId: string;
}

interface SystemData {
  robotModel?: string;
  robotName?: string;
  robotNames?: Array<{ axis: string; name: string }>;
  systemNo?: string;
  version?: string;
  paramNo?: string;
  application?: string;
  language?: string;
  controlPowerTime?: string;
  servoPowerTime?: string;
  servoPowerAxes?: Array<{ axis: string; time: string }>;
  playbackTime?: string;
  movingTime?: string;
  operatingTime?: string;
  energyTime?: string;
}

export default function BasicInfoTab({ controllerId }: BasicInfoTabProps) {
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSystemInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/system-info/read-file/${controllerId}`);
      const data = await response.json();

      if (data.content) {
        const parsed = parseSystemFile(data.content);
        const fullData = parseFullSystemData(data.content, parsed);
        setSystemData(fullData);
      }
    } catch (error) {
      console.error("Error loading system info:", error);
    } finally {
      setIsLoading(false);
    }
  }, [controllerId]);

  useEffect(() => {
    loadSystemInfo();
  }, [loadSystemInfo]);

  const parseFullSystemData = (content: string, parsed: any): SystemData => {
    const lines = content.split("\n");
    const data: SystemData = { ...parsed };


    if (data.systemNo) {
      const langMatch = data.systemNo.match(/\(([^)]+)\)/);
      if (langMatch) {
        data.language = langMatch[1];
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Parse Robot Names
      if (line.startsWith("//ROBOT NAME") && i + 1 < lines.length) {
        const robotNames: Array<{ axis: string; name: string }> = [];
        let j = i + 1;
        
        while (j < lines.length) {
          const robotLine = lines[j].trim();
          if (!robotLine || robotLine.startsWith("//")) break;
          
          // Parse robot lines (R1, R2, S1, S2, S3, etc.)
          const robotMatch = robotLine.match(/^(R\d+|S\d+)\s*:\s*(.+?)\s+\d{4}_\d{4}$/);
          if (robotMatch) {
            robotNames.push({
              axis: robotMatch[1].trim(),
              name: robotMatch[2].trim()
            });
          }
          j++;
        }
        
        if (robotNames.length > 0) {
          data.robotNames = robotNames;
        }
      }

      if (line.startsWith("//CONTROL POWER") && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.startsWith("TOTAL")) {
          const match = nextLine.match(/,(.+)$/);
          if (match) data.controlPowerTime = match[1].trim();
        }
      }

      if (line.startsWith("//SERVO POWER") && i + 1 < lines.length) {
        const servoPowerAxes: Array<{ axis: string; time: string }> = [];
        let j = i + 1;
        
        while (j < lines.length) {
          const axisLine = lines[j].trim();
          if (!axisLine || axisLine.startsWith("//")) break;
          
          // Parse TOTAL line for backward compatibility
          if (axisLine.startsWith("TOTAL")) {
            const match = axisLine.match(/,(.+)$/);
            if (match) data.servoPowerTime = match[1].trim();
          } 
          // Parse individual axes (R1, R2, S1, S2, S3, etc.)
          else {
            const axisMatch = axisLine.match(/^(R\d+|S\d+)\s*:\s*[^,]+,(.+)$/);
            if (axisMatch) {
              servoPowerAxes.push({
                axis: axisMatch[1].trim(),
                time: axisMatch[2].trim()
              });
            }
          }
          j++;
        }
        
        if (servoPowerAxes.length > 0) {
          data.servoPowerAxes = servoPowerAxes;
        }
      }

      if (line.startsWith("//PLAYBACK TIME") && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.startsWith("TOTAL")) {
          const match = nextLine.match(/,(.+)$/);
          if (match) data.playbackTime = match[1].trim();
        }
      }

      if (line.startsWith("//MOVING TIME") && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.startsWith("TOTAL")) {
          const match = nextLine.match(/,(.+)$/);
          if (match) data.movingTime = match[1].trim();
        }
      }

      if (line.startsWith("//OPERATING TIME") && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.includes(":")) {
          const match = nextLine.match(/,(.+)$/);
          if (match) data.operatingTime = match[1].trim();
        }
      }

      if (line.startsWith("//ENERGY TIME") && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.startsWith("TOTAL")) {
          const match = nextLine.match(/,(.+)$/);
          if (match) data.energyTime = match[1].trim();
        }
      }
    }

    return data;
  };

  const getRobotImagePath = (robotModel?: string): string => {
    if (!robotModel) return "/yrc1000.png";


    const parenMatch = robotModel.match(/\(([^)]+)\)/);
    const modelName = parenMatch ? parenMatch[1] : robotModel;


    const fileName = modelName.toLowerCase().replace(/\//g, "").trim();

    return `/manipulator-type/${fileName}.png`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!systemData) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>No system information available</p>
      </div>
    );
  }

  const getRobots = () => {
    return systemData.robotNames || [];
  };

  return (
    <div className="p-4 overflow-auto max-h-[calc(100vh-250px)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 h-full flex flex-col p-4">
            <div className="flex items-center justify-center w-full mb-3">
              <img
                src={getRobotImagePath(systemData.robotModel)}
                alt="Robot"
                className="max-w-full h-auto max-h-48 object-cont
                ain drop-shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/yrc1000.png";
                }}
              />
            </div>
            <div className="border-t pt-2 space-y-2">
              {getRobots().length > 0 ? (
                getRobots().map((robot) => {
                  const isRobot = robot.axis.startsWith('R');
                  const label = isRobot ? 'Manipulator Type' : 'Positioner Type';
                  
                  return (
                    <div key={robot.axis} className="bg-gray-50 p-2 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1.5">
                        {robot.axis} - {label}
                      </p>
                      <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                        <p className="text-sm font-medium text-gray-900">
                          {robot.name}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1.5">Manipulator Type</p>
                  <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                    <p className="text-sm font-medium text-gray-900">
                      {systemData.robotModel || "Unknown"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Information Grid */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Controller Information */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#6950e8] to-[#5740d8] px-4 py-2.5">
              <h3 className="text-sm font-semibold text-white">
                Controller Information
              </h3>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1.5">System Software</p>
                  <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                    <p className="text-sm font-medium text-gray-900">{systemData.systemNo || "N/A"}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1.5">Application</p>
                  <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                    <p className="text-sm font-medium text-gray-900">{systemData.application || "N/A"}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1.5">Language</p>
                  <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                    <p className="text-sm font-medium text-gray-900">{systemData.language || "N/A"}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1.5">Parameter Version</p>
                  <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                    <p className="text-sm font-medium text-gray-900">{systemData.paramNo || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alt Satır: System Monitoring Time ve Servo Power Monitoring Time */}
          <div className={`grid gap-4 ${systemData.servoPowerAxes && systemData.servoPowerAxes.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* System Monitoring Time */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#6950e8] to-[#5740d8] px-4 py-2.5">
                <h3 className="text-sm font-semibold text-white">
                  System Monitoring Time
                </h3>
              </div>
              <div className="p-3">
                <div className="space-y-2">
                  <div className="bg-gray-50 px-3 py-2.5 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Control Power Time</span>
                      <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                        <span className="font-mono text-sm font-semibold text-gray-900 tabular-nums">
                          {systemData.controlPowerTime || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-3 py-2.5 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Servo Power Time</span>
                      <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                        <span className="font-mono text-sm font-semibold text-gray-900 tabular-nums">
                          {systemData.servoPowerTime || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-3 py-2.5 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Playback Time</span>
                      <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                        <span className="font-mono text-sm font-semibold text-gray-900 tabular-nums">
                          {systemData.playbackTime || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-3 py-2.5 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Moving Time</span>
                      <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                        <span className="font-mono text-sm font-semibold text-gray-900 tabular-nums">
                          {systemData.movingTime || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-3 py-2.5 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Operating Time</span>
                      <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                        <span className="font-mono text-sm font-semibold text-gray-900 tabular-nums">
                          {systemData.operatingTime || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-3 py-2.5 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Energy Time</span>
                      <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                        <span className="font-mono text-sm font-semibold text-gray-900 tabular-nums">
                          {systemData.energyTime || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Servo Power Monitoring Time - Only if multiple axes exist */}
            {systemData.servoPowerAxes && systemData.servoPowerAxes.length > 1 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#6950e8] to-[#5740d8] px-4 py-2.5">
                  <h3 className="text-sm font-semibold text-white">
                    Servo Power Monitoring Time
                  </h3>
                </div>
                <div className="p-3">
                  <div className="space-y-2">
                    {systemData.servoPowerAxes.map((axis) => (
                      <div key={axis.axis} className="bg-gray-50 px-3 py-2.5 rounded border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 font-medium">{axis.axis}</span>
                          <div className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-md">
                            <span className="font-mono text-sm font-semibold text-gray-900 tabular-nums">
                              {axis.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alarm } from "@/types/alarm.types";
import { LogEntry } from "@/types/log-content.types";

interface AlarmLogTabProps {
  controllerId: string;
  controllerName?: string;
}

type AlarmType = "MAJOR" | "MINOR" | "USER" | "OFFLINE";

export default function AlarmLogTab({ controllerId, controllerName }: AlarmLogTabProps) {
  const [controllerInfo, setControllerInfo] = useState<{ model: string } | null>(null);
  const [latestAlarm, setLatestAlarm] = useState<Alarm | null>(null);
  const [allAlarms, setAllAlarms] = useState<Alarm[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
  const [loadingAlarms, setLoadingAlarms] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Get controller info (robot model)
  useEffect(() => {
    fetch(`/api/system-info/read-file/${controllerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          const lines = data.content.split('\n');
          const robotLine = lines.find((line: string) =>
            line.includes('MANIPULATOR TYPE') || line.includes('R1')
          );
          if (robotLine) {
            const parts = robotLine.split(/\s+/);
            const modelIndex = parts.findIndex((p: string) => p.includes('*'));
            if (modelIndex !== -1) {
              setControllerInfo({ model: parts[modelIndex] });
            }
          }
        }
      })
      .catch(console.error);
  }, [controllerId]);

  // Fetch all alarms (MAJOR, MINOR, USER, OFFLINE)
  useEffect(() => {
    setLoadingAlarms(true);
    const alarmTypes: AlarmType[] = ["MAJOR", "MINOR", "USER", "OFFLINE"];
    
    Promise.all(
      alarmTypes.map(type =>
        fetch(`/api/controller/${controllerId}/alarms/almhist?type=${type}`)
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      )
    )
      .then(results => {
        const combined = results.flat().filter(alarm => alarm && alarm.code);
        combined.sort((a, b) => {
          const dateA = new Date(a.originDate || 0).getTime();
          const dateB = new Date(b.originDate || 0).getTime();
          return dateB - dateA;
        });
        setAllAlarms(combined);
        
        if (combined.length > 0) {
          setLatestAlarm(combined[0]);
        }
      })
      .catch(() => setAllAlarms([]))
      .finally(() => setLoadingAlarms(false));
  }, [controllerId]);

  // Fetch logs
  useEffect(() => {
    setLoadingLogs(true);
    fetch(`/api/system-expectations/cmos-backup/log-file-content/${controllerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setLogs(data.data);
        } else {
          setLogs([]);
        }
      })
      .catch(() => setLogs([]))
      .finally(() => setLoadingLogs(false));
  }, [controllerId]);

  const getImage = (robotModel?: string) => {
    if (!robotModel) return "/yrc1000.png";
    const parenMatch = robotModel.match(/\(([^)]+)\)/);
    const modelName = parenMatch ? parenMatch[1] : robotModel;
    const fileName = modelName.toLowerCase().replace(/\//g, "").trim();
    return `/manipulator-type/${fileName}.png`;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return { date: "-", time: "-" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('tr-TR'),
      time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };

  const getAlarmTypeColor = (type?: string) => {
    switch (type?.toUpperCase()) {
      case "MAJOR": return "text-red-600 font-semibold";
      case "MINOR": return "text-orange-600 font-semibold";
      case "USER": return "text-blue-600 font-semibold";
      case "OFFLINE": return "text-gray-600 font-semibold";
      default: return "text-gray-800";
    }
  };

  return (
    <div className="p-4 h-[calc(100vh-250px)] overflow-hidden">
      <div className="grid grid-cols-12 gap-4 h-full overflow-hidden">
        {/* Left Panel - Controller & Latest Alarm */}
        <div className="col-span-3 space-y-4 overflow-auto">
          {/* Controller Info */}
          <Card>
            <CardHeader className="p-3 bg-indigo-600 text-white">
              <CardTitle className="text-sm">Controller</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="bg-gray-50 rounded p-3 border">
                <div className="h-40 flex items-center justify-center">
                  <img
                    src={getImage(controllerInfo?.model)}
                    alt="Robot"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (img.src !== window.location.origin + "/yrc1000.png") {
                        img.src = "/yrc1000.png";
                      }
                    }}
                  />
                </div>
                <p className="text-center text-xs font-medium mt-2 pt-2 border-t text-gray-700">
                  {controllerInfo?.model || "..."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Latest Alarm */}
          <Card>
            <CardHeader className="p-3 bg-indigo-600 text-white">
              <CardTitle className="text-sm">Latest Alarm</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {latestAlarm ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="font-medium text-gray-600">Code</div>
                  <div className="text-right">: {latestAlarm.code}</div>
                  
                  <div className="font-medium text-gray-600">Date</div>
                  <div className="text-right">: {formatDateTime(latestAlarm.originDate).date}</div>
                  
                  <div className="font-medium text-gray-600">Time</div>
                  <div className="text-right">: {formatDateTime(latestAlarm.originDate).time}</div>
                  
                  <div className="font-medium text-gray-600 col-span-2">Name</div>
                  <div className="col-span-2 text-xs">: {latestAlarm.name || "N/A"}</div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-xs">
                  No alarm detected
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Tabs */}
        <div className="col-span-9 h-full flex flex-col overflow-hidden">
          <Tabs defaultValue="alarm-history" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="alarm-history" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alarm History
              </TabsTrigger>
              <TabsTrigger value="logging-history" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Logging History
              </TabsTrigger>
            </TabsList>

            {/* Alarm History Tab */}
            <TabsContent value="alarm-history" className="flex-1 mt-2 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
              <div className="flex-1 border rounded-lg bg-white overflow-auto min-h-0">
                {loadingAlarms ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  </div>
                ) : allAlarms.length > 0 ? (
                  <div className="min-h-full">
                    <table className="w-full text-xs">
                      <thead className="bg-indigo-600 text-white sticky top-0 z-10">
                        <tr>
                          <th className="p-3 text-left font-semibold border-r border-white/20">TYPE</th>
                          <th className="p-3 text-left font-semibold border-r border-white/20">CODE</th>
                          <th className="p-3 text-left font-semibold border-r border-white/20">NAME</th>
                          <th className="p-3 text-left font-semibold border-r border-white/20">DATE</th>
                          <th className="p-3 text-left font-semibold border-r border-white/20">TIME</th>
                          <th className="p-3 text-left font-semibold">MODE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allAlarms.map((alarm, idx) => {
                          const dt = formatDateTime(alarm.originDate);
                          return (
                            <tr
                              key={idx}
                              className={`border-b hover:bg-indigo-50 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                            >
                              <td className={`p-3 border-r ${getAlarmTypeColor(alarm.type)}`}>
                                {alarm.type || "-"}
                              </td>
                              <td className="p-3 border-r font-medium">{alarm.code}</td>
                              <td className="p-3 border-r">{alarm.name || "-"}</td>
                              <td className="p-3 border-r">{dt.date}</td>
                              <td className="p-3 border-r">{dt.time}</td>
                              <td className="p-3">{alarm.mode || "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No alarms found</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Logging History Tab */}
            <TabsContent value="logging-history" className="flex-1 mt-2 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
              <div className="flex-1 flex flex-col gap-3 min-h-0 h-full overflow-hidden">
                {/* Tablo Alanı - 70% */}
                <div className="flex-[7] border rounded-lg bg-white overflow-auto min-h-0">
                  {loadingLogs ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : logs.length > 0 ? (
                    <table className="w-full text-xs">
                      <thead className="bg-indigo-600 text-white sticky top-0 z-10">
                        <tr>
                          <th className="p-3 text-left font-semibold border-r border-white/20">INDEX</th>
                          <th className="p-3 text-left font-semibold border-r border-white/20">EVENT</th>
                          <th className="p-3 text-left font-semibold border-r border-white/20">DATE</th>
                          <th className="p-3 text-left font-semibold">TIME</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log, idx) => {
                          const dt = log.date?.split(' ') || ['-', '-'];
                          return (
                            <tr
                              key={idx}
                              className={`border-b cursor-pointer hover:bg-indigo-50 transition-colors ${
                                selectedLogIndex === idx ? 'bg-indigo-100 border-indigo-300' : idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                              }`}
                              onClick={() => {
                                setSelectedLog(log);
                                setSelectedLogIndex(idx);
                              }}
                            >
                              <td className="p-3 border-r font-medium">{log.index}</td>
                              <td className="p-3 border-r">{log.event || "-"}</td>
                              <td className="p-3 border-r">{dt[0]}</td>
                              <td className="p-3">{dt[1] || "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No logging history found</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details Panel - 30% (Tablonun Altında) */}
                {selectedLog && selectedLogIndex !== null ? (
                  <div className="flex-[3] border rounded-lg bg-white overflow-hidden flex-shrink-0 min-h-0">
                    <div className="bg-indigo-600 text-white px-4 py-2">
                      <h3 className="text-sm font-semibold">Details</h3>
                    </div>
                    <div className="p-4 bg-gray-50 overflow-auto">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="flex gap-2">
                          <span className="font-medium text-gray-700 w-28">INDEX</span>
                          <span className="text-gray-900">: {selectedLog.index}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium text-gray-700 w-28">DATE</span>
                          <span className="text-gray-900">: {selectedLog.date || "-"}</span>
                        </div>
                        <div className="flex gap-2 col-span-2">
                          <span className="font-medium text-gray-700 w-28">EVENT</span>
                          <span className="text-gray-900">: {selectedLog.event || "-"}</span>
                        </div>
                        <div className="flex gap-2 col-span-2">
                          <span className="font-medium text-gray-700 w-28">LOGIN NAME</span>
                          <span className="text-gray-900">: {selectedLog.loginName || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-[3] border rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 min-h-0">
                    <p className="text-gray-400 text-xs">Click on a log entry to view details</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

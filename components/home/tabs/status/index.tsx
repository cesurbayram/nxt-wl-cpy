"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Zap, Play, Loader, AlertTriangle, AlertCircle, StopCircle, DoorOpen, Database, RefreshCw } from "lucide-react";
import { GrConnect } from "react-icons/gr";
import { FaRegHandLizard } from "react-icons/fa6";
import { BsTropicalStorm } from "react-icons/bs";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

interface StatusTabProps {
  controllerId: string;
}

interface ControllerStatus {
  teach: string;
  servo: boolean;
  operating: boolean;
  cycle: string;
  hold: boolean;
  alarm: boolean;
  error: boolean;
  stop: boolean;
  door_opened: boolean;
  connection: boolean;
  c_backup: boolean;
}

interface ControllerInfo {
  model: string;
  name: string;
}

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface StatusHistory {
  statusDurations: { running: number; energy_saving: number; alarm: number; idle: number; disconnect: number; servo_off: number; };
  operatingRate: string;
  hourlyData: Array<{ hour: string; running: number; energy_saving: number; alarm: number; idle: number; disconnect: number; servo_off: number; }>;
  dailyData: Array<{ date: string; running: number; energy_saving: number; alarm: number; idle: number; disconnect: number; servo_off: number; }>;
}

export default function StatusTab({ controllerId }: StatusTabProps) {
  const [currentStatus, setCurrentStatus] = useState<ControllerStatus | null>(null);
  const [controllerInfo, setControllerInfo] = useState<ControllerInfo | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [days, setDays] = useState<string>("1");
  const [historyData, setHistoryData] = useState<StatusHistory | null>(null);
  const [loading, setLoading] = useState(false);

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
              const model = parts[modelIndex];
              setControllerInfo({ model, name: '' });
            }
          }
        }
      })
      .catch(console.error);
  }, [controllerId]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/controller/status?controllerId=${controllerId}`);
      if (res.ok) setCurrentStatus((await res.json()).data);
    } catch (e) { }
  };

  useEffect(() => {
    fetchStatus();
  }, [controllerId]);

  useEffect(() => {
    fetch("/api/shift").then(res => res.json()).then(data => {
      // API direkt array döndürüyor, .shifts yok
      const shiftsArray = Array.isArray(data) ? data : [];
      // shift_start ve shift_end -> start_time ve end_time'a çevir
      const formattedShifts = shiftsArray.map((s: any) => ({
        id: s.id,
        name: s.name,
        start_time: s.shiftStart || s.shift_start,
        end_time: s.shiftEnd || s.shift_end
      }));
      setShifts(formattedShifts);
      
      // Otomatik olarak ilk vardiyayı seç
      if (formattedShifts.length > 0 && !selectedShift) {
        setSelectedShift(formattedShifts[0].id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedShift) return;
    setLoading(true);
    fetch(`/api/controller/status-history?controllerId=${controllerId}&shiftId=${selectedShift}&date=${new Date().toISOString().split("T")[0]}&days=${days}`)
      .then(res => res.json()).then(result => setHistoryData(result.data)).catch(console.error).finally(() => setLoading(false));
  }, [controllerId, selectedShift, days]);

  const getImage = (robotModel?: string) => {
    if (!robotModel) return "/yrc1000.png";

    // Parantez içindeki model adını al (örn: "1-06VX8-A0*(GP8)" -> "GP8")
    const parenMatch = robotModel.match(/\(([^)]+)\)/);
    const modelName = parenMatch ? parenMatch[1] : robotModel;

    // Lowercase yap ve "/" karakterlerini kaldır
    const fileName = modelName.toLowerCase().replace(/\//g, "").trim();

    return `/manipulator-type/${fileName}.png`;
  };

  const colors = { running: "#4F46E5", energy_saving: "#10B981", alarm: "#EF4444", idle: "#F59E0B", disconnect: "#6B7280", servo_off: "#EC4899" };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
              const hours = Math.floor(entry.value / 60);
              const minutes = Math.floor(entry.value % 60);

              return (
                <div key={index} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                    <span className="capitalize">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{hours}h {minutes}m</div>
                    <div className="text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 pt-2 border-t text-xs">
            <div className="flex justify-between font-semibold">
              <span>Toplam:</span>
              <span>{Math.floor(total / 60)}h {Math.floor(total % 60)}m</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 space-y-4 overflow-auto max-h-[calc(100vh-250px)]">
      {/* Top: Shift + Refresh */}
      <div className="grid grid-cols-12 gap-3 items-end">
        <div className="col-span-5">
          <label className="text-xs font-medium text-gray-700 mb-1.5 block">Shift</label>
          <Select value={selectedShift} onValueChange={setSelectedShift}>
            <SelectTrigger className="h-10 border-gray-300">
              <SelectValue placeholder={shifts.length === 0 ? "Loading shifts..." : "Select shift"} />
            </SelectTrigger>
            <SelectContent>
              {shifts.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.start_time}-{s.end_time})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-3">
          <label className="text-xs font-medium text-gray-700 mb-1.5 block">Period</label>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="h-10 border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Day</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-4 flex justify-end">
          <Button
            onClick={fetchStatus}
            variant="outline"
            className="h-10 px-6 border-gray-300 hover:bg-gray-50 font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Robot + Status */}
        <div className="col-span-3">
          <Card>
            <CardHeader className="p-3 border-b">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-900"><Activity className="h-4 w-4" />Current Status</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
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
                <p className="text-center text-xs font-medium mt-2 pt-2 border-t text-gray-700">{controllerInfo?.model || "..."}</p>
              </div>

              {/* Status Icons - Single Column */}
              <div className="space-y-1 pt-2 border-t">
                <div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded">
                  <GrConnect className={`h-3.5 w-3.5 flex-shrink-0 ${currentStatus?.connection ? "text-green-600" : "text-red-600"}`} />
                  <span className="text-[10px] font-medium">Connection</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded">
                  {currentStatus?.teach === "TEACH" ? (
                    <FaRegHandLizard className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  ) : currentStatus?.teach === "PLAY" ? (
                    <BsTropicalStorm className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  ) : currentStatus?.teach === "REMOTE" ? (
                    <FaExternalLinkAlt className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  ) : (
                    <FaRegHandLizard className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-[10px] font-medium">TEACH</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded">
                  <Zap className={`h-3.5 w-3.5 flex-shrink-0 ${currentStatus?.servo ? "text-green-600" : "text-gray-400"}`} />
                  <span className="text-[10px] font-medium">Servo</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded">
                  <Loader className={`h-3.5 w-3.5 flex-shrink-0 ${currentStatus?.operating ? "text-green-600" : "text-gray-400"}`} />
                  <span className="text-[10px] font-medium">Operating</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded">
                  <Play className={`h-3.5 w-3.5 flex-shrink-0 ${currentStatus?.cycle === "CYCLE" ? "text-green-600" : "text-gray-400"}`} />
                  <span className="text-[10px] font-medium">CYCLE</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded">
                  <StopCircle className={`h-3.5 w-3.5 flex-shrink-0 ${currentStatus?.hold ? "text-green-600" : "text-gray-400"}`} />
                  <span className="text-[10px] font-medium">Hold</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded">
                  <AlertTriangle className={`h-3.5 w-3.5 flex-shrink-0 ${currentStatus?.alarm ? "text-green-600" : "text-gray-400"}`} />
                  <span className="text-[10px] font-medium">Alarm</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded">
                  <AlertCircle className={`h-3.5 w-3.5 flex-shrink-0 ${currentStatus?.error ? "text-green-600" : "text-gray-400"}`} />
                  <span className="text-[10px] font-medium">Error</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded">
                  <StopCircle className={`h-3.5 w-3.5 flex-shrink-0 ${currentStatus?.stop ? "text-green-600" : "text-gray-400"}`} />
                  <span className="text-[10px] font-medium">Stop</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded">
                  <DoorOpen className={`h-3.5 w-3.5 flex-shrink-0 ${currentStatus?.door_opened ? "text-green-600" : "text-gray-400"}`} />
                  <span className="text-[10px] font-medium">Door</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded">
                  <Database className={`h-3.5 w-3.5 flex-shrink-0 ${currentStatus?.c_backup ? "text-green-600" : "text-gray-400"}`} />
                  <span className="text-[10px] font-medium">Backup</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Charts */}
        <div className="col-span-9 space-y-4">
          {selectedShift && historyData && !loading ? (
            <>
              <Card>
                <CardHeader className="p-3 border-b">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-900"><TrendingUp className="h-4 w-4" />Operating Rate</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="text-center mb-4">
                    <span className="inline-block bg-yellow-400 text-black px-4 py-1 rounded text-xl font-bold">{historyData.operatingRate}%</span>
                    {/* Performance Level Indicator */}
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => {
                          const rate = parseFloat(historyData.operatingRate);
                          const filled = rate >= level * 20;
                          return (
                            <div
                              key={level}
                              className={`w-8 h-2 rounded ${filled ? 'bg-green-500' : 'bg-gray-200'}`}
                            />
                          );
                        })}
                      </div>
                      <span className="text-xs text-gray-600">
                        {parseFloat(historyData.operatingRate) >= 80 ? 'Excellent' :
                          parseFloat(historyData.operatingRate) >= 60 ? 'Good' :
                            parseFloat(historyData.operatingRate) >= 30 ? 'Middle' : 'Low'}
                      </span>
                    </div>
                  </div>

                  {/* Status Duration Cards */}
                  <div className="grid grid-cols-6 gap-2 mb-3">
                    {Object.entries(historyData.statusDurations).map(([status, duration]) => {
                      const totalMinutes = Object.values(historyData.statusDurations).reduce((a: number, b: number) => a + b, 0) as number;
                      const percentage = totalMinutes > 0 ? ((duration as number / totalMinutes) * 100).toFixed(1) : '0';
                      const hours = Math.floor((duration as number) / 60);
                      const minutes = Math.floor((duration as number) % 60);

                      const statusColors: Record<string, string> = {
                        running: 'bg-blue-50 border-blue-200 text-blue-700',
                        energy_saving: 'bg-green-50 border-green-200 text-green-700',
                        alarm: 'bg-red-50 border-red-200 text-red-700',
                        idle: 'bg-orange-50 border-orange-200 text-orange-700',
                        disconnect: 'bg-gray-50 border-gray-200 text-gray-700',
                        servo_off: 'bg-pink-50 border-pink-200 text-pink-700'
                      };

                      const statusIcons: Record<string, string> = {
                        running: '🟢',
                        energy_saving: '🟡',
                        alarm: '🔴',
                        idle: '🟠',
                        disconnect: '⚫',
                        servo_off: '🟣'
                      };

                      return (
                        <div key={status} className={`p-2 rounded border ${statusColors[status]}`}>
                          <div className="text-[10px] font-medium mb-1 flex items-center gap-1">
                            <span>{statusIcons[status]}</span>
                            <span className="truncate">{status.replace('_', ' ')}</span>
                          </div>
                          <div className="text-sm font-bold">{hours}h {minutes}m</div>
                          <div className="text-[10px] opacity-75">{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>

                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={[{ name: "Rate", value: parseFloat(historyData.operatingRate) }]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" width={40} style={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6950e8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Shift Summary Card */}
              <Card>
                <CardHeader className="p-3 border-b">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-900">Shift Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600 mb-1">Total Time</div>
                      <div className="font-bold text-blue-700">
                        {(() => {
                          const total = Object.values(historyData.statusDurations).reduce((a: number, b: number) => a + b, 0) as number;
                          return `${Math.floor(total / 60)}h ${Math.floor(total % 60)}m`;
                        })()}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-xs text-gray-600 mb-1">Running Time</div>
                      <div className="font-bold text-green-700">
                        {Math.floor(historyData.statusDurations.running / 60)}h {Math.floor(historyData.statusDurations.running % 60)}m
                      </div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-xs text-gray-600 mb-1">Alarm Time</div>
                      <div className="font-bold text-red-700">
                        {Math.floor(historyData.statusDurations.alarm / 60)}h {Math.floor(historyData.statusDurations.alarm % 60)}m
                      </div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="text-xs text-gray-600 mb-1">Idle Time</div>
                      <div className="font-bold text-orange-700">
                        {Math.floor(historyData.statusDurations.idle / 60)}h {Math.floor(historyData.statusDurations.idle % 60)}m
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3"><CardTitle className="text-sm">Hourly Breakdown</CardTitle></CardHeader>
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={historyData.hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" style={{ fontSize: 10 }} />
                      <YAxis style={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      {Object.entries(colors).map(([key, color]) => <Bar key={key} dataKey={key} stackId="a" fill={color} name={key.replace('_', ' ')} />)}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {days === "7" && (
                <Card>
                  <CardHeader className="p-3"><CardTitle className="text-sm">Daily Breakdown</CardTitle></CardHeader>
                  <CardContent className="p-3">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={historyData.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" style={{ fontSize: 10 }} />
                        <YAxis style={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {Object.entries(colors).map(([key, color]) => <Bar key={key} dataKey={key} stackId="a" fill={color} name={key.replace('_', ' ')} />)}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          ) : loading ? (
            <Card><CardContent className="py-16 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6950e8] mx-auto" /></CardContent></Card>
          ) : (
            <Card><CardContent className="py-16 text-center text-gray-500"><Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Select a shift to view history</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}

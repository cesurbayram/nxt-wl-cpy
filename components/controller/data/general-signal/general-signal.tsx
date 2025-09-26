"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Timer from "@/components/shared/timer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getGeneralSignalData,
  createGeneralSignalRecord,
  deleteGeneralSignalRecord,
  sendGeneralSignalCommand,
  sendGeneralSignalExitCommand,
} from "@/utils/service/data/general-data";
import { GeneralSignal } from "@/types/general-data.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface GeneralSignalProps {
  controllerId: string;
  onMonitoringChange?: (isMonitoring: boolean, generalNo?: string) => void;
}

const GeneralSignalComponent = ({ controllerId, onMonitoringChange }: GeneralSignalProps) => {
  const [generalSignalData, setGeneralSignalData] = useState<GeneralSignal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [generalNo, setGeneralNo] = useState("");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const isFirstRender = useRef(true);
  const currentGeneralNoRef = useRef<string | null>(null);

  const sendGeneralSignalRequest = async (controllerId: string, generalNo: string) => {
    try {
      await sendGeneralSignalCommand(controllerId, generalNo);
      currentGeneralNoRef.current = generalNo;
      setIsMonitoring(true);
      onMonitoringChange?.(true, generalNo);
      console.log(`Started monitoring General Signal ${generalNo}`);
    } catch (error) {
      console.error("Error sending general signal command:", error);
      setError("Failed to start monitoring");
    }
  };

  const stopGeneralSignalMonitoring = async () => {
    if (currentGeneralNoRef.current) {
      try {
        await sendGeneralSignalExitCommand(controllerId, currentGeneralNoRef.current);
        setIsMonitoring(false);
        onMonitoringChange?.(false);
        currentGeneralNoRef.current = null;
        setGeneralSignalData([]);
        console.log("Stopped monitoring General Signal");
      } catch (error) {
        console.error("Error stopping general signal monitoring:", error);
      }
    }
  };

  const fetchGeneralSignalData = async (isInitialLoad: boolean = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
        setError(null);
      }

      const data = await getGeneralSignalData(controllerId);

      if (data && data.length > 0) {
        setGeneralSignalData(data);
      } else {
        setGeneralSignalData([]);
      }
    } catch (error) {
      console.error("Error fetching general signal data:", error);
      setError("Failed to fetch general signal data");
      setGeneralSignalData([]);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  const handleStartMonitoring = async () => {
    if (generalNo.trim()) {
      try {
        // 1. First create the record in database
        await createGeneralSignalRecord(controllerId, generalNo.trim());

        // 2. Then start monitoring via ytr-moto-server
        await sendGeneralSignalCommand(controllerId, generalNo.trim());
        
        // 3. Update monitoring state and notify parent
        currentGeneralNoRef.current = generalNo.trim();
        setIsMonitoring(true);
        onMonitoringChange?.(true, generalNo.trim());
        console.log(`Started monitoring General Signal ${generalNo.trim()}`);
        
        // 4. Refresh the data to show the new record
        await fetchGeneralSignalData(false);
      } catch (error) {
        console.error("Error starting general signal monitoring:", error);
      }
    }
  };

  const handleDeleteSignal = async (generalNo: string) => {
    try {
      await deleteGeneralSignalRecord(controllerId, generalNo);
      await fetchGeneralSignalData(false);
      console.log(`Deleted general signal ${generalNo}`);
    } catch (error) {
      console.error("Error deleting general signal:", error);
    }
  };

  useEffect(() => {
    if (controllerId && isFirstRender.current) {
      isFirstRender.current = false;
      fetchGeneralSignalData(true);
    }
  }, [controllerId]);

  // Component unmount olduğunda monitoring'i durdur
  useEffect(() => {
    return () => {
      if (currentGeneralNoRef.current) {
        sendGeneralSignalExitCommand(controllerId, currentGeneralNoRef.current);
        onMonitoringChange?.(false);
      }
    };
  }, [controllerId, onMonitoringChange]);

  // Search filtreleme fonksiyonu
  const filteredGeneralSignalData = generalSignalData?.filter((signal) => {
    const generalNo = signal.general_no;
    const signalValue = signal.value?.toString() || "";

    return (
      generalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signalValue.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>General Signal Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Loading general signal data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>General Signal Data</CardTitle>
        {isMonitoring && <Timer callback={() => fetchGeneralSignalData(false)} />}
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter General No (e.g. 10010)"
              value={generalNo}
              onChange={(e) => setGeneralNo(e.target.value)}
              className="flex-1"
              disabled={isMonitoring}
            />
            {!isMonitoring ? (
              <Button 
                onClick={handleStartMonitoring}
                disabled={!generalNo.trim()}
                className="whitespace-nowrap"
              >
                Start Monitoring
              </Button>
            ) : (
              <Button 
                onClick={stopGeneralSignalMonitoring}
                variant="destructive"
                className="whitespace-nowrap"
              >
                Stop Monitoring
              </Button>
            )}
          </div>
          
          {isMonitoring && (
            <div className="text-sm text-green-600">
              Monitoring General Signal {currentGeneralNoRef.current}
            </div>
          )}

          <Input
            type="text"
            placeholder="Search general signals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        {error ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-red-500">{error}</div>
          </div>
        ) : generalSignalData && generalSignalData.length > 0 ? (
          <div className="rounded-md border">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="text-center">General No</TableHead>
                    <TableHead className="text-center">Value</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGeneralSignalData && filteredGeneralSignalData.length > 0 ? (
                    filteredGeneralSignalData.map((signal) => (
                      <TableRow key={`${signal.controller_id}-${signal.general_no}`}>
                        <TableCell className="text-center font-mono">
                          {signal.general_no}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          <span className={`px-2 py-1 rounded text-white text-xs ${
                            signal.value ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {signal.value ? 'TRUE' : 'FALSE'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSignal(signal.general_no)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-gray-500 p-8"
                      >
                        No general signals found matching "{searchTerm}"
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">
              {isMonitoring 
                ? "Waiting for general signal data..." 
                : "Start monitoring to see general signal data"
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneralSignalComponent;

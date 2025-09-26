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
  getGeneralRegisterData,
  createGeneralRegisterRecord,
  deleteGeneralRegisterRecord,
  sendGeneralRegisterCommand,
  sendGeneralRegisterExitCommand,
} from "@/utils/service/data/general-data";
import { GeneralRegister } from "@/types/general-data.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface GeneralRegisterProps {
  controllerId: string;
  onMonitoringChange?: (isMonitoring: boolean, generalNo?: string) => void;
}

const GeneralRegisterComponent = ({ controllerId, onMonitoringChange }: GeneralRegisterProps) => {
  const [generalRegisterData, setGeneralRegisterData] = useState<GeneralRegister[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [generalNo, setGeneralNo] = useState("");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const isFirstRender = useRef(true);
  const currentGeneralNoRef = useRef<string | null>(null);

  const sendGeneralRegisterRequest = async (controllerId: string, generalNo: string) => {
    try {
      await sendGeneralRegisterCommand(controllerId, generalNo);
      currentGeneralNoRef.current = generalNo;
      setIsMonitoring(true);
      onMonitoringChange?.(true, generalNo);
      console.log(`Started monitoring General Register ${generalNo}`);
    } catch (error) {
      console.error("Error sending general register command:", error);
      setError("Failed to start monitoring");
    }
  };

  const stopGeneralRegisterMonitoring = async () => {
    if (currentGeneralNoRef.current) {
      try {
        await sendGeneralRegisterExitCommand(controllerId, currentGeneralNoRef.current);
        setIsMonitoring(false);
        onMonitoringChange?.(false);
        currentGeneralNoRef.current = null;
        setGeneralRegisterData([]);
        console.log("Stopped monitoring General Register");
      } catch (error) {
        console.error("Error stopping general register monitoring:", error);
      }
    }
  };

  const fetchGeneralRegisterData = async (isInitialLoad: boolean = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
        setError(null);
      }

      const data = await getGeneralRegisterData(controllerId);

      if (data && data.length > 0) {
        setGeneralRegisterData(data);
      } else {
        setGeneralRegisterData([]);
      }
    } catch (error) {
      console.error("Error fetching general register data:", error);
      setError("Failed to fetch general register data");
      setGeneralRegisterData([]);
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
        await createGeneralRegisterRecord(controllerId, generalNo.trim());

        // 2. Then start monitoring via ytr-moto-server
        await sendGeneralRegisterCommand(controllerId, generalNo.trim());
        
        // 3. Update monitoring state and notify parent
        currentGeneralNoRef.current = generalNo.trim();
        setIsMonitoring(true);
        onMonitoringChange?.(true, generalNo.trim());
        console.log(`Started monitoring General Register ${generalNo.trim()}`);
        
        // 4. Refresh the data to show the new record
        await fetchGeneralRegisterData(false);
      } catch (error) {
        console.error("Error starting general register monitoring:", error);
      }
    }
  };

  const handleDeleteRegister = async (generalNo: string) => {
    try {
      await deleteGeneralRegisterRecord(controllerId, generalNo);
      await fetchGeneralRegisterData(false);
      console.log(`Deleted general register ${generalNo}`);
    } catch (error) {
      console.error("Error deleting general register:", error);
    }
  };

  useEffect(() => {
    if (controllerId && isFirstRender.current) {
      isFirstRender.current = false;
      fetchGeneralRegisterData(true);
    }
  }, [controllerId]);


  useEffect(() => {
    return () => {
      if (currentGeneralNoRef.current) {
        sendGeneralRegisterExitCommand(controllerId, currentGeneralNoRef.current);
        onMonitoringChange?.(false);
      }
    };
  }, [controllerId, onMonitoringChange]);


  const filteredGeneralRegisterData = generalRegisterData?.filter((register) => {
    const generalNo = register.general_no;
    const registerValue = register.value?.toString() || "";

    return (
      generalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registerValue.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>General Register Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Loading general register data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>General Register Data</CardTitle>
        {isMonitoring && <Timer callback={() => fetchGeneralRegisterData(false)} />}
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter General No (e.g. 70)"
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
                onClick={stopGeneralRegisterMonitoring}
                variant="destructive"
                className="whitespace-nowrap"
              >
                Stop Monitoring
              </Button>
            )}
          </div>

          {isMonitoring && (
            <div className="text-sm text-green-600">
              Monitoring General Register {currentGeneralNoRef.current}
            </div>
          )}

          <Input
            type="text"
            placeholder="Search general registers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {error ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-red-500">{error}</div>
          </div>
        ) : generalRegisterData && generalRegisterData.length > 0 ? (
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
                  {filteredGeneralRegisterData && filteredGeneralRegisterData.length > 0 ? (
                    filteredGeneralRegisterData.map((register) => (
                      <TableRow key={`${register.controller_id}-${register.general_no}`}>
                        <TableCell className="text-center font-mono">
                          {register.general_no}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {register.value}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRegister(register.general_no)}
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
                        No general registers found matching "{searchTerm}"
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
                ? "Waiting for general register data..."
                : "Start monitoring to see general register data"
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneralRegisterComponent;

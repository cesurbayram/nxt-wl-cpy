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
  getGeneralVariableData,
  createGeneralVariableRecord,
  deleteGeneralVariableRecord,
  sendGeneralVariableCommand,
  sendGeneralVariableExitCommand,
} from "@/utils/service/general-data/general-variable";
import { GeneralVariable, GeneralVariableType } from "@/types/general-data.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GeneralVariableProps {
  controllerId: string;
  onMonitoringChange?: (isMonitoring: boolean, generalNo?: string, variableType?: GeneralVariableType) => void;
}

const GeneralVariableComponent = ({ controllerId, onMonitoringChange }: GeneralVariableProps) => {
  const [generalVariableData, setGeneralVariableData] = useState<GeneralVariable[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [generalNo, setGeneralNo] = useState("");
  const [variableType, setVariableType] = useState<GeneralVariableType>("byte");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const isFirstRender = useRef(true);
  const currentGeneralNoRef = useRef<string | null>(null);
  const currentVariableTypeRef = useRef<GeneralVariableType>("byte");

  const sendGeneralVariableRequest = async (controllerId: string, generalNo: string, varType: GeneralVariableType) => {
    try {
      await sendGeneralVariableCommand(controllerId, generalNo, varType);
      currentGeneralNoRef.current = generalNo;
      currentVariableTypeRef.current = varType;
      setIsMonitoring(true);
      console.log(`Started monitoring General ${varType.toUpperCase()} ${generalNo}`);
    } catch (error) {
      console.error("Error sending general variable command:", error);
      setError("Failed to start monitoring");
    }
  };

  const stopGeneralVariableMonitoring = async () => {
    if (currentGeneralNoRef.current && currentVariableTypeRef.current) {
      try {
        await sendGeneralVariableExitCommand(controllerId, currentGeneralNoRef.current, currentVariableTypeRef.current);
        setIsMonitoring(false);
        onMonitoringChange?.(false);
        currentGeneralNoRef.current = null;
        currentVariableTypeRef.current = "byte";
        setGeneralVariableData([]);
        console.log("Stopped monitoring General Variable");
      } catch (error) {
        console.error("Error stopping general variable monitoring:", error);
      }
    }
  };

  const fetchGeneralVariableData = async (isInitialLoad: boolean = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
        setError(null);
      }

      // Tüm tipleri çek ve birleştir
      const allTypes: GeneralVariableType[] = ['byte', 'int', 'double', 'real', 'string'];
      const allData: GeneralVariable[] = [];

      for (const type of allTypes) {
        try {
          const data = await getGeneralVariableData(controllerId, type);
          if (data && data.length > 0) {
            allData.push(...data);
          }
        } catch (error) {
          console.error(`Error fetching ${type} data:`, error);
        }
      }

      if (allData.length > 0) {
        setGeneralVariableData(allData);
      } else {
        setGeneralVariableData([]);
      }
    } catch (error) {
      console.error("Error fetching general variable data:", error);
      setError("Failed to fetch general variable data");
      setGeneralVariableData([]);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  const handleStartMonitoring = async () => {
    if (generalNo.trim() && variableType) {
      try {
        // 1. First create the record in database
        await createGeneralVariableRecord(controllerId, generalNo.trim(), variableType);

        // 2. Then start monitoring via ytr-moto-server
        await sendGeneralVariableCommand(controllerId, generalNo.trim(), variableType);
        
        // 3. Update monitoring state
        currentGeneralNoRef.current = generalNo.trim();
        currentVariableTypeRef.current = variableType;
        setIsMonitoring(true);
        onMonitoringChange?.(true, generalNo.trim(), variableType);
        console.log(`Started monitoring General ${variableType.toUpperCase()} ${generalNo.trim()}`);

        // 4. Refresh the data to show the new record
        await fetchGeneralVariableData(false);
      } catch (error) {
        console.error("Error starting general variable monitoring:", error);
      }
    }
  };

  const handleDeleteVariable = async (generalNo: string, variableType: GeneralVariableType) => {
    try {
      await deleteGeneralVariableRecord(controllerId, generalNo, variableType);
      await fetchGeneralVariableData(false);
      console.log(`Deleted general ${variableType} variable ${generalNo}`);
    } catch (error) {
      console.error("Error deleting general variable:", error);
    }
  };

  // Sayfa açıldığında kayıtları yükle ve otomatik monitoring başlat
  useEffect(() => {
    const initializeComponent = async () => {
      if (controllerId && isFirstRender.current) {
        isFirstRender.current = false;
        await fetchGeneralVariableData(true);
        
        // Eğer kayıtlı veri varsa, ilk kaydı otomatik monitoring yap
        try {
          // Tüm tiplerden ilk kaydı bul
          const allTypes: GeneralVariableType[] = ['byte', 'int', 'double', 'real', 'string'];
          let firstVariable = null;
          
          for (const type of allTypes) {
            const data = await getGeneralVariableData(controllerId, type);
            if (data && data.length > 0) {
              firstVariable = data[0];
              break;
            }
          }
          
          if (firstVariable) {
            await sendGeneralVariableCommand(controllerId, firstVariable.general_no, firstVariable.variable_type);
            currentGeneralNoRef.current = firstVariable.general_no;
            currentVariableTypeRef.current = firstVariable.variable_type;
            setIsMonitoring(true);
            setGeneralNo(firstVariable.general_no);
            setVariableType(firstVariable.variable_type);
            console.log(`Auto-started monitoring General ${firstVariable.variable_type.toUpperCase()} ${firstVariable.general_no}`);
          }
        } catch (error) {
          console.error("Error auto-starting monitoring:", error);
        }
      }
    };
    
    initializeComponent();
  }, [controllerId]);

  // Sayfa kapandığında monitoring'i durdur
  useEffect(() => {
    return () => {
      if (currentGeneralNoRef.current && currentVariableTypeRef.current) {
        sendGeneralVariableExitCommand(controllerId, currentGeneralNoRef.current, currentVariableTypeRef.current);
      }
    };
  }, [controllerId]);


  const filteredGeneralVariableData = generalVariableData?.filter((variable) => {
    const generalNo = variable.general_no;
    const variableValue = variable.value?.toString() || "";

    return (
      generalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variableValue.includes(searchTerm)
    );
  });

  const variableTypeLabels = {
    byte: "Byte",
    int: "Integer",
    double: "Double",
    real: "Real",
    string: "String"
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>General Variable Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Loading general variable data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>General Variable Data</CardTitle>
        {isMonitoring && <Timer callback={() => fetchGeneralVariableData(false)} />}
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3">
              <Select
                value={variableType}
                onValueChange={(value: GeneralVariableType) => setVariableType(value)}
                disabled={isMonitoring}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Variable Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="byte">Byte</SelectItem>
                  <SelectItem value="int">Integer</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="real">Real</SelectItem>
                  <SelectItem value="string">String</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-6">
              <Input
                type="text"
                placeholder="Enter General No (e.g. 70)"
                value={generalNo}
                onChange={(e) => setGeneralNo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isMonitoring && generalNo.trim()) {
                    handleStartMonitoring();
                  }
                }}
                disabled={isMonitoring}
              />
            </div>
            <div className="col-span-3">
              {!isMonitoring ? (
                <Button
                  onClick={handleStartMonitoring}
                  disabled={!generalNo.trim()}
                  className="w-full"
                >
                  Start Monitoring
                </Button>
              ) : (
                <Button
                  onClick={stopGeneralVariableMonitoring}
                  variant="destructive"
                  className="w-full"
                >
                  Stop Monitoring
                </Button>
              )}
            </div>
          </div>

          {isMonitoring && (
            <div className="text-sm text-green-600">
              Monitoring General {variableTypeLabels[currentVariableTypeRef.current]} {currentGeneralNoRef.current}
            </div>
          )}

          <Input
            type="text"
            placeholder="Search general variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {error ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-red-500">{error}</div>
          </div>
        ) : generalVariableData && generalVariableData.length > 0 ? (
          <div className="rounded-md border">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="text-center">General No</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Value</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGeneralVariableData && filteredGeneralVariableData.length > 0 ? (
                    filteredGeneralVariableData.map((variable) => (
                      <TableRow key={`${variable.controller_id}-${variable.general_no}`}>
                        <TableCell className="text-center font-mono">
                          {variable.general_no}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {variableTypeLabels[variable.variable_type]}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {variable.value}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteVariable(variable.general_no, variable.variable_type)}
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
                        colSpan={4}
                        className="text-center text-gray-500 p-8"
                      >
                        No general variables found matching "{searchTerm}"
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
                ? "Waiting for general variable data..."
                : "Start monitoring to see general variable data"
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneralVariableComponent;

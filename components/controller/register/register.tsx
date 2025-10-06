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
  getRegisterData,
  sendRegisterCommand,
} from "@/utils/service/register/register";

import { Register } from "@/types/register.types";

interface RegisterProps {
  controllerId: string;
}

const RegisterComponent = ({ controllerId }: RegisterProps) => {
  const [registerData, setRegisterData] = useState<Register[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const isFirstRender = useRef(true);

  const sendRegisterRequest = async (controllerId: string) => {
    try {
      await sendRegisterCommand(controllerId);
    } catch (error) {
      console.error("Error sending register command:", error);
    }
  };

  const fetchRegisterData = async (isInitialLoad: boolean = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
        setError(null);
      }

      const data = await getRegisterData(controllerId);

      if (data && data.length > 0) {
        const sortedData = data.sort((a, b) => a.register_no - b.register_no);
        setRegisterData(sortedData);
      } else {
        setRegisterData([]);
      }
    } catch (error) {
      console.error("Error fetching register data:", error);
      setError("Failed to fetch register data");
      setRegisterData([]);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (controllerId && isFirstRender.current) {
      isFirstRender.current = false;
      sendRegisterRequest(controllerId);
      fetchRegisterData(true);
    }
  }, [controllerId]);

  // Search filtreleme fonksiyonu
  const filteredRegisterData = registerData?.filter((register) => {
    const registerNo = `M${register.register_no.toString().padStart(3, "0")}`;
    const registerValue = register.register_value?.toString() || "0";

    return (
      registerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registerValue.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Register Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Loading register data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Register Data</CardTitle>
        <Timer callback={() => fetchRegisterData(false)} />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search registers... (e.g. M001, 5)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-red-500">{error}</div>
          </div>
        ) : registerData && registerData.length > 0 ? (
          <div className="rounded-md border">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="text-center">Register No</TableHead>
                    <TableHead className="text-center">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegisterData && filteredRegisterData.length > 0 ? (
                    filteredRegisterData.map((register) => (
                      <TableRow
                        key={`${register.controller_id}-${register.register_no}`}
                      >
                        <TableCell className="text-center font-mono">
                          M{register.register_no.toString().padStart(3, "0")}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {register.register_value ?? 0}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-gray-500 p-8"
                      >
                        No registers found matching "{searchTerm}"
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">No register data available</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegisterComponent;

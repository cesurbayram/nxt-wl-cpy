"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Timer from "@/components/shared/timer";
import {
  getAbsoData,
  sendAbsoDataCommand,
} from "@/utils/service/data/absodata";
import { AbsoData } from "@/types/absodata.types";

interface AbsoDataProps {
  controllerId: string;
}

const AbsoDataComponent = ({ controllerId }: AbsoDataProps) => {
  const [absoData, setAbsoData] = useState<AbsoData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);

  const sendAbsoDataRequest = async (controllerId: string) => {
    try {
      await sendAbsoDataCommand(controllerId);
    } catch (error) {
      console.error(
        "Failed to send absolute data command to controller: ",
        error
      );
    }
  };

  const fetchAbsoData = async (isInitialLoad: boolean = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    try {
      const data = await getAbsoData(controllerId);

      const processedData = data.map((item: any) => ({
        ...item,
        S: typeof item.S === "string" ? parseFloat(item.S) : item.S || 0,
        L: typeof item.L === "string" ? parseFloat(item.L) : item.L || 0,
        U: typeof item.U === "string" ? parseFloat(item.U) : item.U || 0,
        R: typeof item.R === "string" ? parseFloat(item.R) : item.R || 0,
        B: typeof item.B === "string" ? parseFloat(item.B) : item.B || 0,
        T: typeof item.T === "string" ? parseFloat(item.T) : item.T || 0,
      }));

      setAbsoData(processedData);
    } catch (error) {
      console.error("Error fetching absolute position data:", error);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (controllerId && isFirstRender.current) {
      isFirstRender.current = false;
      sendAbsoDataRequest(controllerId);
      fetchAbsoData(true);
    }
  }, [controllerId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center">
            <div className="text-xl font-medium">Absolute Position Data</div>
            <div className="flex items-center gap-2">
              <div className="font-normal text-xl">
                <Timer callback={() => fetchAbsoData(false)} />
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {absoData && absoData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Axis</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { axis: "S", value: absoData[0].S },
                { axis: "L", value: absoData[0].L },
                { axis: "U", value: absoData[0].U },
                { axis: "R", value: absoData[0].R },
                { axis: "B", value: absoData[0].B },
                { axis: "T", value: absoData[0].T },
              ].map((row) => (
                <TableRow key={row.axis}>
                  <TableCell className="font-medium">{row.axis}</TableCell>
                  <TableCell>{Math.round(row.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div>No absolute position data available</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AbsoDataComponent;

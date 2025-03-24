"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import TorkChart from "@/components/controller/monitoring/tork/tork-chart";
import Timer from "@/components/shared/timer";
import {
  getTorkData,
  sendTorkCommand,
  clearTorkData,
} from "@/utils/service/monitoring/tork";
import { TorkData } from "@/types/tork.types";

interface TorkProps {
  controllerId: string;
}

const Tork = ({ controllerId }: TorkProps) => {
  const [torkData, setTorkData] = useState<TorkData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);

  const sendTorkRequest = async (controllerId: string) => {
    try {
      await sendTorkCommand(controllerId);
    } catch (error) {
      console.error("Failed to send tork command to controller: ", error);
    }
  };

  const fetchTorkData = async (isInitialLoad: boolean = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    try {
      const data = await getTorkData(controllerId);

      const processedData = data.map((item: any) => ({
        ...item,

        S: typeof item.S === "string" ? parseFloat(item.S) : item.S || 0,
        L: typeof item.L === "string" ? parseFloat(item.L) : item.L || 0,
        U: typeof item.U === "string" ? parseFloat(item.U) : item.U || 0,
        R: typeof item.R === "string" ? parseFloat(item.R) : item.R || 0,
        B: typeof item.B === "string" ? parseFloat(item.B) : item.B || 0,
        T: typeof item.T === "string" ? parseFloat(item.T) : item.T || 0,
      }));

      setTorkData(processedData);
    } catch (error) {
      console.error("Error fetching tork data:", error);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (controllerId && isFirstRender.current) {
      isFirstRender.current = false;
      sendTorkRequest(controllerId);
      fetchTorkData(true);
    }

    return () => {
      const cleanup = async () => {
        try {
          await clearTorkData(controllerId);
          console.log("Tork data cleared on component unmount");
        } catch (error) {
          console.error("Failed to clear tork data on unmount:", error);
        }
      };
      cleanup();
    };
  }, [controllerId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Axis Torque Values</div>
            <div className="flex items-center gap-2">
              <Timer callback={() => fetchTorkData(false)} />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {torkData ? (
          <TorkChart
            data={torkData}
            isLive={true}
            controllerId={controllerId}
            onRefresh={() => fetchTorkData(false)}
          />
        ) : (
          <div>No torque data available</div>
        )}
      </CardContent>
    </Card>
  );
};

export default Tork;

"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PowerGasFlowMonitoring = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center">
            <div className="text-xl font-medium">
              Power & Gas Flow Monitoring
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This section provides insights into power consumption and gas flow
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerGasFlowMonitoring;

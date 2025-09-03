"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const TcpChangeLogs = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center">
            <div className="text-xl font-medium">TCP Change Logs</div>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default TcpChangeLogs;

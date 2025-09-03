"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AutoToolChangeLogs = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center">
            <div className="text-xl font-medium">
              Automatic Tool Change Logs
            </div>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default AutoToolChangeLogs;

"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ReportType } from "@/types/report.types";
import { getReportTypes } from "@/utils/service/reports";

interface ReportTypeSelectorProps {
  selectedCategory: string;
  selectedType: string;
  onTypeChange: (typeId: string) => void;
}

export function ReportTypeSelector({
  selectedCategory,
  selectedType,
  onTypeChange,
}: ReportTypeSelectorProps) {
  const [types, setTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      const fetchTypes = async () => {
        setLoading(true);
        try {
          const data = await getReportTypes(selectedCategory);
          setTypes(data);
        } catch (error) {
          console.error("Error fetching types:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchTypes();
    } else {
      setTypes([]);
    }
  }, [selectedCategory]);

  return (
    <div className="space-y-3">
      <Label className="text-sm">Report Type</Label>

      <Select
        value={selectedType}
        onValueChange={onTypeChange}
        disabled={!selectedCategory}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              selectedCategory
                ? "Select report type"
                : "Firstly select category"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : (
            types.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

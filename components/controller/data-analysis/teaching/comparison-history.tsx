// components/controller/data-analysis/teaching/comparison-history.tsx
import { useState, useEffect, useRef } from "react";
import {
  getComparisonHistory,
  deleteComparison,
} from "@/utils/service/teaching";
import { ComparisonHistoryItem } from "@/types/teaching.types";
import { DataTable } from "@/components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface HistoryProps {
  controllerId: string;
  onSelect: (id: string) => void;
}

export const ComparisonHistory = ({ controllerId, onSelect }: HistoryProps) => {
  const [history, setHistory] = useState<ComparisonHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const fetchHistory = async () => {
      try {
        const data = await getComparisonHistory(controllerId);
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Error loading comparison history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [controllerId]);

  const handleDelete = async (id: string) => {
    const currentHistory = [...history];

    try {
      setHistory((prev) => prev.filter((item) => item.id !== id));
      await deleteComparison(controllerId, id);
      toast.success("Comparison deleted successfully");
    } catch (error) {
      setHistory(currentHistory);
      console.error("Error deleting comparison:", error);
      toast.error("Error deleting comparison");
    }
  };

  const columns: ColumnDef<ComparisonHistoryItem>[] = [
    {
      accessorKey: "comparisonDate",
      header: "Date",
      cell: ({ row }) => new Date(row.original.comparisonDate).toLocaleString(),
    },
    {
      accessorKey: "file1Name",
      header: "First File",
    },
    {
      accessorKey: "file2Name",
      header: "Second File",
    },
    {
      accessorKey: "statistics",
      header: "Similarity",
      cell: ({ row }) => `${row.original.statistics.similarityPercentage}%`,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <DataTable columns={columns} data={history} />
    </div>
  );
};

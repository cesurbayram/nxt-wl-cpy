"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { TrashIcon, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getProductionValues,
  getProductionValuesByShift,
  deleteProductionValue,
  compareProductionValues,
} from "@/utils/service/shift/poduction-value";
import { ProductionValue } from "@/types/production-value.types";
import { ProductionComparison } from "@/types/job-status.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductionValueListProps {
  shiftId?: string;
  onDeleteSuccess?: () => void;
  refresh?: number;
}

export default function ProductionValueList({
  shiftId,
  onDeleteSuccess,
  refresh = 0,
}: ProductionValueListProps) {
  const [productionValues, setProductionValues] = useState<ProductionValue[]>(
    []
  );
  const [comparisons, setComparisons] = useState<{
    [key: string]: ProductionComparison;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProductionValue, setSelectedProductionValue] = useState<
    string | null
  >(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getProductionValues();
      setProductionValues(data);

      const newComparisons: { [key: string]: ProductionComparison } = {};

      const groups = data.reduce((acc, value) => {
        const key = `${value.controllerId}-${value.shiftId}`;
        if (!acc[key]) {
          acc[key] = {
            controllerId: value.controllerId,
            shiftId: value.shiftId,
            values: [],
          };
        }
        acc[key].values.push(value);
        return acc;
      }, {} as { [key: string]: { controllerId: string; shiftId: string; values: ProductionValue[] } });

      for (const [groupKey, group] of Object.entries(groups)) {
        try {
          const comparisonData = await compareProductionValues(
            group.controllerId,
            group.shiftId
          );

          comparisonData.forEach((comparison) => {
            const valueKey = `${group.controllerId}-${group.shiftId}-${comparison.jobId}`;
            newComparisons[valueKey] = comparison;
          });
        } catch (error) {
          console.error(`Error fetching comparison for ${groupKey}:`, error);
        }
      }

      setComparisons(newComparisons);
    } catch (error) {
      console.error("Error fetching production values:", error);
      toast.error("Failed to fetch production values");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const handleDeleteClick = (id: string) => {
    setSelectedProductionValue(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProductionValue) return;

    setIsDeleting(true);
    try {
      await deleteProductionValue(selectedProductionValue);
      toast.success("Production value deleted successfully");
      fetchData();

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Error deleting production value:", error);
      toast.error("Failed to delete production value");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getStatusBadge = (status: string, difference: number) => {
    switch (status) {
      case "equal":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Equal
          </Badge>
        );
      case "manual_higher":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            -{difference}
          </Badge>
        );
      case "system_higher":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            +{difference}
          </Badge>
        );
      default:
        return <Badge variant="secondary">No Data</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Production Values</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">Loading...</div>
          ) : productionValues.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No production values found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Controller</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Manual Count</TableHead>
                  <TableHead className="text-center border-l-2 border-gray-200 bg-gray-50">
                    System Count
                  </TableHead>
                  <TableHead className="text-center bg-gray-50">
                    Status
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionValues.map((value) => {
                  const comparisonKey = `${value.controllerId}-${value.shiftId}-${value.jobId}`;
                  const comparison = comparisons[comparisonKey];

                  return (
                    <TableRow key={value.id}>
                      <TableCell>{value.controllerName}</TableCell>
                      <TableCell>{value.shiftName}</TableCell>
                      <TableCell>{value.jobName}</TableCell>
                      <TableCell>
                        {value.createdAt
                          ? format(new Date(value.createdAt), "PPP")
                          : "-"}
                      </TableCell>
                      <TableCell>{value.note || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {value.producedProductCount}
                      </TableCell>
                      <TableCell className="text-center font-medium border-l-2 border-gray-200 bg-gray-50">
                        {comparison ? comparison.systemCount : "-"}
                      </TableCell>
                      <TableCell className="text-center bg-gray-50">
                        {comparison ? (
                          getStatusBadge(
                            comparison.status,
                            comparison.difference
                          )
                        ) : (
                          <Badge variant="secondary">No Data</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(value.id!)}
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              production value record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { TrashIcon } from "lucide-react";

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
import {
  getProductionValues,
  getProductionValuesByShift,
  deleteProductionValue,
} from "@/utils/service/shift/poduction-value";
import { ProductionValue } from "@/types/production-value.types";
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
                  <TableHead className="text-right">Product Count</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionValues.map((value) => (
                  <TableRow key={value.id}>
                    <TableCell>{value.controllerName}</TableCell>
                    <TableCell>{value.shiftName}</TableCell>
                    <TableCell>{value.jobName}</TableCell>
                    <TableCell className="text-right font-medium">
                      {value.producedProductCount}
                    </TableCell>
                    <TableCell>{value.note || "-"}</TableCell>
                    <TableCell>
                      {value.createdAt
                        ? format(new Date(value.createdAt), "PPP")
                        : "-"}
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
                ))}
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

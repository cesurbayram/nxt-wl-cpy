import { ProductionValue } from "@/types/production-value.types";
import { ProductionComparison } from "@/types/job-status.types";

const getProductionValues = async (): Promise<ProductionValue[]> => {
  const apiRes = await fetch("/api/shift/production-value", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when fetching production values");

  const result = await apiRes.json();
  return result;
};

const getProductionValuesByShift = async (
  shiftId: string
): Promise<ProductionValue[]> => {
  const apiRes = await fetch(`/api/shift/production-value?shiftId=${shiftId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error(
      "An error occurred when fetching production values for shift"
    );

  const result = await apiRes.json();
  return result;
};

const getProductionValuesByController = async (
  controllerId: string
): Promise<ProductionValue[]> => {
  const apiRes = await fetch(
    `/api/shift/production-value?controllerId=${controllerId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (apiRes.ok !== true)
    throw new Error(
      "An error occurred when fetching production values for controller"
    );

  const result = await apiRes.json();
  return result;
};

const getProductionValueById = async (
  id: string
): Promise<ProductionValue | null> => {
  const apiRes = await fetch(`/api/shift/production-value/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when fetching production value by id");

  const result = await apiRes.json();
  return result;
};

const deleteProductionValue = async (id: string): Promise<boolean> => {
  const apiRes = await fetch(`/api/shift/production-value/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when deleting production value");

  return true;
};

const createProductionValue = async (
  values: ProductionValue
): Promise<string> => {
  const apiRes = await fetch("/api/shift/production-value", {
    method: "POST",
    body: JSON.stringify(values),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when creating production value");

  const { id } = await apiRes.json();
  return id;
};

const updateProductionValue = async (
  values: ProductionValue
): Promise<boolean> => {
  const apiRes = await fetch("/api/shift/production-value", {
    method: "PUT",
    body: JSON.stringify(values),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when updating production value");

  return true;
};

const compareProductionValues = async (
  controllerId: string,
  shiftId: string
): Promise<ProductionComparison[]> => {
  const apiRes = await fetch(
    `/api/shift/production-value/compare?controllerId=${controllerId}&shiftId=${shiftId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (apiRes.ok !== true)
    throw new Error("An error occurred when comparing production values");

  const result = await apiRes.json();
  return result;
};

export {
  getProductionValues,
  getProductionValueById,
  getProductionValuesByShift,
  getProductionValuesByController,
  deleteProductionValue,
  createProductionValue,
  updateProductionValue,
  compareProductionValues,
};

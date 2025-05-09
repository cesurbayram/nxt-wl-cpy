import { Shift } from "@/types/shift.types";

const getShifts = async (): Promise<Shift[]> => {
  const apiRes = await fetch("/api/shift", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when fetching shifts");

  const result = await apiRes.json();
  return result;
};

const getShiftById = async (id: string): Promise<Shift | null> => {
  const apiRes = await fetch(`/api/shift/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when fetching shift by id");

  const result = await apiRes.json();
  return result;
};

const deleteShift = async (shift: Shift): Promise<boolean> => {
  const apiRes = await fetch(`/api/shift/${shift.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when deleting shift");

  return true;
};

const createShift = async (values: Shift): Promise<string> => {
  const apiRes = await fetch("/api/shift", {
    method: "POST",
    body: JSON.stringify(values),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when creating shift");

  const { id } = await apiRes.json();
  return id;
};

const updateShift = async (values: Shift): Promise<boolean> => {
  const apiRes = await fetch("/api/shift", {
    method: "PUT",
    body: JSON.stringify(values),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when updating shift.");

  return true;
};

export { getShifts, deleteShift, createShift, getShiftById, updateShift };

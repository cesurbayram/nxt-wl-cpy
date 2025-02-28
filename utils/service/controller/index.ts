import { Controller } from "@/types/controller.types";

const getController = async (): Promise<Controller[]> => {
  const apiRes = await fetch("/api/controller", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occured when fetching controllers");

  const result = await apiRes.json();
  return result;
};

const getControllerById = async (id: string): Promise<Controller> => {
  console.log("id in method", id);

  const apiRes = await fetch(`/api/controller/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occured when fetch controller by id");

  const result = await apiRes.json();
  return result;
};

const deleteController = async ({ id }: Controller): Promise<boolean> => {
  const body = { id };
  const apiRes = await fetch("/api/controller", {
    method: "DELETE",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when deleting controller");

  return true;
};

const createController = async (values: Controller): Promise<boolean> => {
  const apiRes = await fetch("/api/controller", {
    method: "POST",
    body: JSON.stringify(values),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!apiRes.ok) {
    const errorData = await apiRes.json();
    throw new Error(
      `An error occurred when creating controller: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

const updateController = async (values: Controller): Promise<boolean> => {
  const apiRes = await fetch("/api/controller", {
    method: "PUT",
    body: JSON.stringify(values),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.ok !== true)
    throw new Error("An error occurred when updating controller.");

  return true;
};

export {
  getController,
  deleteController,
  createController,
  getControllerById,
  updateController,
};

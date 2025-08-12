import { Controller } from "@/types/controller.types";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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

export const useCreateControllerOptimized = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (controllerData: Controller) => {
      const response = await fetch("/api/controller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(controllerData),
      });

      if (!response.ok) {
        throw new Error("Controller creation failed");
      }

      return response.json();
    },
    onMutate: async (newController) => {
      await queryClient.cancelQueries({ queryKey: ["controllers"] });

      const previousControllers = queryClient.getQueryData(["controllers"]);
      queryClient.setQueryData(["controllers"], (old: any) => [
        ...old,
        { ...newController, id: "temp-" + Date.now(), status: "Creating..." },
      ]);

      toast.success("Controller creation started...");

      return { previousControllers };
    },
    onError: (err, newController, context) => {
      queryClient.setQueryData(["controllers"], context?.previousControllers);
      toast.error("Controller creation failed");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["controllers"] });
      toast.success("Controller created successfully!");
    },
  });
};

export const useDeleteControllerOptimized = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch("/api/controller", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Controller deletion failed");
      }

      return response.json();
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["controllers"] });

      const previousControllers = queryClient.getQueryData(["controllers"]);
      queryClient.setQueryData(["controllers"], (old: any) => {
        if (!old) return [];
        return old.filter(
          (controller: Controller) => controller.id !== deletedId
        );
      });

      toast.success("Controller deletion started...");

      return { previousControllers };
    },
    onError: (err, deletedId, context) => {
      queryClient.setQueryData(["controllers"], context?.previousControllers);
      toast.error("Controller deletion failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["controllers"] });
      toast.success("Controller deleted successfully!");
    },
  });
};

export const useControllerStatus = (id: string) => {
  return useQuery({
    queryKey: ["controller-status", id],
    queryFn: async () => {
      const response = await fetch(`/api/controller/${id}/status`);
      return response.json();
    },
    refetchInterval: 2000,
    enabled: !!id,
  });
};

export {
  getController,
  deleteController,
  createController,
  getControllerById,
  updateController,
};

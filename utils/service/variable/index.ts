import { Variable } from "@/types/variable.types"

const getVariablesByType = async (
  controllerId: string,
  variableType: string
): Promise<Variable[]> => {

  console.log('variableType', variableType);
  
  const apiRes = await fetch(`/api/controller/${controllerId}/variables/${variableType}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!apiRes.ok) {
    throw new Error(`Failed to fetch variables for type: ${variableType}`);
  }

  const result = await apiRes.json();
  return result;
};

export { getVariablesByType }
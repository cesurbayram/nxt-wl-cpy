const sendTabExitCommand = async ({
  exitedTab,
  controllerId,
}: {
  exitedTab: string;
  controllerId: string;
}): Promise<boolean> => {
  const apiRes = await fetch(
    "https://savola-senddata.fabricademo.com/api/tab-exit",
    {
      method: "POST",
      body: JSON.stringify({ exitedTab, controllerId }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    const errorData = await apiRes.json();
    throw new Error(
      `An error occurred when sending tab exit: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

export { sendTabExitCommand };

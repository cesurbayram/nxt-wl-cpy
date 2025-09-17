const sendTabExitCommand = async ({
  exitedTab,
  controllerId,
}: {
  exitedTab: string;
  controllerId: string;
}): Promise<boolean> => {
  try {
    const apiRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tab-exit`,
      {
        method: "POST",
        body: JSON.stringify({ exitedTab, controllerId }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!apiRes.ok) {
      console.error(`Tab exit API error: ${apiRes.status} ${apiRes.statusText}`);
      return false; 
    }

    return true;
  } catch (error) {
    console.error('Network error during tab exit:', error);
    return false; 
  }
};

export { sendTabExitCommand };
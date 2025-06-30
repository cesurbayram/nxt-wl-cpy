import { loadActiveJobs } from "./index";
import { testMailConnection } from "../mail";

let isInitialized = false;

export const initializeScheduler = async (): Promise<boolean> => {
  if (isInitialized) {
    return true;
  }

  try {
    const mailConnected = await testMailConnection();
    if (!mailConnected) {
      console.warn(
        "Mail server connection failed, but scheduler will continue"
      );
    }

    await loadActiveJobs();

    isInitialized = true;

    return true;
  } catch (error) {
    console.error("Failed to initialize scheduler:", error);
    return false;
  }
};

export const isSchedulerInitialized = (): boolean => {
  return isInitialized;
};

export const resetSchedulerInitialization = (): void => {
  isInitialized = false;
};

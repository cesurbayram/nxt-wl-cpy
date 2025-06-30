import { NextRequest, NextResponse } from "next/server";
import {
  initializeScheduler,
  isSchedulerInitialized,
} from "@/utils/service/scheduler/startup";
import { getActiveJobsCount } from "@/utils/service/scheduler";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const success = await initializeScheduler();

    if (success) {
      const activeJobsCount = getActiveJobsCount();

      return NextResponse.json({
        success: true,
        message: "Scheduler initialized successfully",
        activeJobs: activeJobsCount,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to initialize scheduler",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error initializing scheduler:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const isInitialized = isSchedulerInitialized();
    const activeJobsCount = getActiveJobsCount();

    return NextResponse.json({
      isInitialized,
      activeJobs: activeJobsCount,
      status: isInitialized ? "running" : "stopped",
    });
  } catch (error) {
    console.error("Error getting scheduler status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

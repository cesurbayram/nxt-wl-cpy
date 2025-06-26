"use client";

import { ReportDashboard } from "@/components/shift/reports/report-dashboard";
import PageWrapper from "@/components/shared/page-wrapper";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <PageWrapper
      pageTitle="Report Management"
      icon={<FileText size={24} color="#6950e8" />}
      shownHeaderButton={false}
    >
      <div className="mt-5">
        <ReportDashboard />
      </div>
    </PageWrapper>
  );
}

"use client";
import React from "react";
import PageWrapper from "@/components/shared/page-wrapper";
import { FileText, Activity, FileBarChart, AlertTriangle, TrendingUp } from "lucide-react";
import { SystemHealthReportButton } from "@/components/system-reports/system-health-report-button";
import { UtilizationReportButton } from "@/components/system-reports/utilization-report-button";
import { OperatingRateReportButton } from "@/components/system-reports/operating-rate-report-button";
import { AlarmReportButton } from "@/components/system-reports/alarm-report-button";

const ReportsPage = () => {
  return (
    <PageWrapper
      shownHeaderButton={false}
      pageTitle="System Reports"
      icon={<FileText size={24} color="#6950e8" />}
    >
      <div className="space-y-6">
       
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         
          <div className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#6950e8] hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6950e8]/10 to-[#6950e8]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-10 h-10 text-[#6950e8]" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">
                System Health
              </h3>
              <SystemHealthReportButton className="w-full" />
            </div>
          </div>

          
          <div className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#6950e8] hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6950e8]/10 to-[#6950e8]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileBarChart className="w-10 h-10 text-[#6950e8]" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">
                Utilization
              </h3>
              <UtilizationReportButton className="w-full" />
            </div>
          </div>

          
          <div className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#6950e8] hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6950e8]/10 to-[#6950e8]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-10 h-10 text-[#6950e8]" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">
                Operating Rate
              </h3>
              <OperatingRateReportButton className="w-full" />
            </div>
          </div>

          
          <div className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#6950e8] hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6950e8]/10 to-[#6950e8]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-10 h-10 text-[#6950e8]" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">
                Alarm Report
              </h3>
              <AlarmReportButton className="w-full" />
            </div>
          </div>
        </div>

       
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Reports are generated in real-time as PDF files
          </p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ReportsPage;


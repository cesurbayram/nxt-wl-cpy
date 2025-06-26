import {
  ReportCategory,
  ReportType,
  GeneratedReport,
  ReportPreviewData,
  ReportGenerationRequest,
  ReportParameters,
  ReportConfig,
} from "@/types/report.types";

export const getReportCategories = async (): Promise<ReportCategory[]> => {
  try {
    const response = await fetch("/api/shift/reports/categories");
    if (!response.ok) {
      throw new Error("Failed to fetch report categories");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching report categories:", error);
    throw error;
  }
};

export const getReportTypes = async (
  categoryId?: string
): Promise<ReportType[]> => {
  try {
    const url = categoryId
      ? `/api/shift/reports/types?category_id=${categoryId}`
      : "/api/shift/reports/types";

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch report types");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching report types:", error);
    throw error;
  }
};

export const getReportPreview = async (
  reportTypeId: string,
  parameters: ReportParameters
): Promise<ReportPreviewData> => {
  try {
    const response = await fetch("/api/shift/reports/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        report_type_id: reportTypeId,
        parameters,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch report preview");
    }

    const data = await response.json();
    return data.preview_data;
  } catch (error) {
    console.error("Error fetching report preview:", error);
    throw error;
  }
};

export const previewReport = async (config: ReportConfig): Promise<any> => {
  try {
    const cleanFilters = config.filters ? { ...config.filters } : {};

    delete cleanFilters.startDate;
    delete cleanFilters.endDate;

    const controllerIds = cleanFilters.controller_ids;
    delete cleanFilters.controller_ids;

    const parameters: ReportParameters = {
      date_range:
        config.filters?.startDate && config.filters?.endDate
          ? {
              start_date: config.filters.startDate,
              end_date: config.filters.endDate,
            }
          : undefined,
      controller_ids: controllerIds || [],
      custom_filters: cleanFilters,
    };

    const response = await fetch("/api/shift/reports/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        report_type_id: config.typeId,
        parameters,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Preview request failed:", errorData);
      throw new Error(`Failed to fetch report preview: ${response.status}`);
    }

    const data = await response.json();
    return data.preview_data || data;
  } catch (error) {
    console.error("Error fetching report preview:", error);
    throw error;
  }
};

export const generateReport = async (
  config: ReportConfig
): Promise<{ report_id: string; status: string }> => {
  try {
    if (!config.typeId) {
      throw new Error("Report type ID is required");
    }
    if (!config.name) {
      throw new Error("Report name is required");
    }
    if (!config.exportFormat) {
      throw new Error("Export format is required");
    }

    const cleanFilters = config.filters ? { ...config.filters } : {};
    delete cleanFilters.startDate;
    delete cleanFilters.endDate;

    const controllerIds = cleanFilters.controller_ids;
    delete cleanFilters.controller_ids;

    const request: ReportGenerationRequest = {
      report_type_id: config.typeId,
      report_name: config.name,
      description: config.description,
      parameters: {
        date_range:
          config.filters?.startDate && config.filters?.endDate
            ? {
                start_date: config.filters.startDate,
                end_date: config.filters.endDate,
              }
            : undefined,
        controller_ids: controllerIds || [],
        custom_filters: cleanFilters,
      },
      format: config.exportFormat.toUpperCase() as "PDF" | "Excel" | "CSV",
    };

    const response = await fetch("/api/shift/reports/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Failed to generate report");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};

export const getReportStatus = async (reportId: string): Promise<any> => {
  try {
    const response = await fetch(`/api/shift/reports/status/${reportId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch report status");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching report status:", error);
    throw error;
  }
};

export const downloadReport = async (reportId: string): Promise<Blob> => {
  try {
    const response = await fetch(`/api/shift/reports/download/${reportId}`);
    if (!response.ok) {
      throw new Error("Failed to download report");
    }

    return await response.blob();
  } catch (error) {
    console.error("Error downloading report:", error);
    throw error;
  }
};

export const getReportHistory = async (options?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "pending" | "completed" | "failed";
  format?: "pdf" | "excel" | "csv";
}): Promise<{ reports: GeneratedReport[]; total: number; pagination: any }> => {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.pageSize)
      params.append("pageSize", options.pageSize.toString());
    if (options?.search) params.append("search", options.search);
    if (options?.status) params.append("status", options.status);
    if (options?.format) params.append("format", options.format);

    const response = await fetch(
      `/api/shift/reports/history?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch report history");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching report history:", error);
    throw error;
  }
};

export const deleteReport = async (reportId: string): Promise<void> => {
  try {
    const response = await fetch("/api/shift/reports/history", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ report_id: reportId }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete report");
    }
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
};

import {
  QuickAssistDocument,
  DocumentCategory,
  CreateDocumentForm,
  CreateCategoryForm,
} from "@/types/quick-assist.types";

const API_BASE = "/api/quick-assist";

export const quickAssistService = {
  getDocuments: async (category?: string): Promise<QuickAssistDocument[]> => {
    const url =
      category && category !== "all"
        ? `${API_BASE}?category=${encodeURIComponent(category)}`
        : API_BASE;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch documents");
    }
    return response.json();
  },

  getCategories: async (): Promise<DocumentCategory[]> => {
    const response = await fetch(`${API_BASE}?type=categories`);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return response.json();
  },

  getDocument: async (id: string): Promise<QuickAssistDocument> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch document");
    }
    return response.json();
  },

  createDocument: async (
    data: CreateDocumentForm
  ): Promise<QuickAssistDocument> => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);

    if (data.content) {
      formData.append("content", data.content);
    }

    if (data.file) {
      formData.append("file", data.file);
    }

    const response = await fetch(API_BASE, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create document");
    }
    return response.json();
  },

  updateDocument: async (
    id: string,
    data: CreateDocumentForm
  ): Promise<QuickAssistDocument> => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);

    if (data.content) {
      formData.append("content", data.content);
    }

    if (data.file) {
      formData.append("file", data.file);
    }

    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update document");
    }
    return response.json();
  },

  deleteDocument: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete document");
    }
  },

  createCategory: async (
    data: CreateCategoryForm
  ): Promise<DocumentCategory> => {
    const formData = new FormData();
    formData.append("type", "category");
    formData.append("name", data.name);

    if (data.description) {
      formData.append("description", data.description);
    }

    const response = await fetch(API_BASE, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create category");
    }
    return response.json();
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE}?type=category&categoryId=${categoryId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete category");
    }
  },

  downloadFile: async (doc: QuickAssistDocument): Promise<void> => {
    if (!doc.file_path) {
      throw new Error("No file attached to this document");
    }

    const filename = doc.file_path.split("/").pop();
    if (!filename) {
      throw new Error("Invalid file path");
    }

    try {
      const response = await fetch(`${API_BASE}/download/${filename}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download file");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const element = document.createElement("a");
      element.href = url;
      element.download = doc.file_name || filename;

      document.body.appendChild(element);
      element.click();

      document.body.removeChild(element);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(
        `Download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileTypeIcon = (fileType: string): string => {
  if (fileType.includes("pdf")) return "📄";
  if (fileType.includes("word")) return "📝";
  if (fileType.includes("excel")) return "📊";
  if (fileType.includes("powerpoint")) return "📈";
  if (fileType.includes("image")) return "🖼️";
  return "📁";
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

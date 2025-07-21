export interface QuickAssistDocument {
  id: string;
  title: string;
  description: string;
  content?: string;
  category: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface CreateDocumentForm {
  title: string;
  description: string;
  content?: string;
  category: string;
  file?: File;
}

export interface CreateCategoryForm {
  name: string;
  description?: string;
}

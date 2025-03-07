import { FilePreview as FilePreviewType } from "@/types/teaching.types";

interface FilePreviewProps {
  preview: FilePreviewType;
}

export const FilePreview = ({ preview }: FilePreviewProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">{preview.name}</h3>
        <span className="text-xs text-gray-500">
          {preview.format.toUpperCase()}
        </span>
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <div>Size: {(preview.size / 1024).toFixed(2)} KB</div>
        <div>Last Modified: {preview.lastModified}</div>
      </div>
      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono overflow-auto max-h-[100px]">
        {preview.preview}
        {preview.preview.length === 500 && "..."}
      </div>
    </div>
  );
};

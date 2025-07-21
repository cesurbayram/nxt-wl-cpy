"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  QuickAssistDocument,
  DocumentCategory,
  CreateDocumentForm,
} from "@/types/quick-assist.types";
import {
  quickAssistService,
  formatFileSize,
  getFileTypeIcon,
  formatDate,
} from "@/utils/service/quick-assist";
import {
  ArrowLeft,
  Download,
  Edit,
  Save,
  X,
  FileText,
  Calendar,
  Folder,
} from "lucide-react";

export default function QuickAssistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [document, setDocument] = useState<QuickAssistDocument | null>(null);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin] = useState(true); // In real app, get from auth context

  const [editForm, setEditForm] = useState<CreateDocumentForm>({
    title: "",
    description: "",
    content: "",
    category: "",
    file: undefined,
  });

  const loadDocument = async () => {
    setIsLoading(true);
    try {
      const [doc, cats] = await Promise.all([
        quickAssistService.getDocument(params.id as string),
        quickAssistService.getCategories(),
      ]);
      setDocument(doc);
      setCategories(cats);
      setEditForm({
        title: doc.title,
        description: doc.description,
        content: doc.content || "",
        category: doc.category,
        file: undefined,
      });
    } catch (error) {
      console.error("Error loading document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, [params.id]);

  const handleSave = async () => {
    if (!document) return;

    try {
      await quickAssistService.updateDocument(document.id, editForm);
      setIsEditing(false);
      loadDocument();
    } catch (error) {
      console.error("Error updating document:", error);
      alert(
        error instanceof Error ? error.message : "Failed to update document"
      );
    }
  };

  const handleFileDownload = async () => {
    if (document?.file_path) {
      try {
        await quickAssistService.downloadFile(document);
      } catch (error) {
        console.error("Error downloading file:", error);
        alert(
          error instanceof Error ? error.message : "Failed to download file"
        );
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (document) {
      setEditForm({
        title: document.title,
        description: document.description,
        content: document.content || "",
        category: document.category,
        file: undefined,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Document not found
          </h3>
          <p className="text-gray-600 mb-4">
            The document you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => router.push("/quick-assist")}
            className="bg-[#6950e8] hover:bg-[#8b5cf6] text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quick Assist
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/quick-assist")}
          className="flex items-center gap-2 text-[#6950e8] hover:bg-[#6950e8]/10 hover:text-[#6950e8]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quick Assist
        </Button>

        {isAdmin && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-[#6950e8] hover:bg-[#8b5cf6] text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#6950e8] hover:bg-[#8b5cf6] text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      placeholder="Enter document title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter document description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={editForm.category}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div>
                  <CardTitle className="text-2xl">{document.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {document.description}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="secondary">{document.category}</Badge>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Content</h3>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-content">Text Content</Label>
                        <Textarea
                          id="edit-content"
                          value={editForm.content}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              content: e.target.value,
                            })
                          }
                          placeholder="Enter document content"
                          rows={10}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-file">Attach File</Label>
                        <Input
                          id="edit-file"
                          type="file"
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              file: e.target.files?.[0],
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {document.content && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm font-mono">
                            {document.content}
                          </pre>
                        </div>
                      )}

                      {document.file_path && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Attached File</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">
                                {getFileTypeIcon(document.file_type || "")}
                              </span>
                              <div>
                                <p className="font-medium">
                                  {document.file_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {formatFileSize(document.file_size || 0)}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={handleFileDownload}
                              variant="outline"
                              size="sm"
                              className="border-[#6950e8] text-[#6950e8] hover:bg-[#6950e8] hover:text-white"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )}

                      {!document.content && !document.file_path && (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-8 w-8 mx-auto mb-2" />
                          <p>No content available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(document.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Updated</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(document.updated_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-gray-600">{document.category}</p>
                </div>
              </div>

              {document.file_path && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">File Type</p>
                    <p className="text-sm text-gray-600">
                      {document.file_type}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Actions</h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#6950e8] text-[#6950e8] hover:bg-[#6950e8] hover:text-white"
                  onClick={() => router.push("/quick-assist")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to List
                </Button>

                {document.file_path && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#6950e8] text-[#6950e8] hover:bg-[#6950e8] hover:text-white"
                    onClick={handleFileDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

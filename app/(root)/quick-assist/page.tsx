"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  QuickAssistDocument,
  DocumentCategory,
  CreateDocumentForm,
  CreateCategoryForm,
} from "@/types/quick-assist.types";
import {
  quickAssistService,
  formatFileSize,
  getFileTypeIcon,
  formatDate,
} from "@/utils/service/quick-assist";
import {
  Download,
  FileText,
  Plus,
  Search,
  Trash2,
  Edit,
  Settings,
  BarChart3,
  Folder,
  Clock,
  Upload,
  BookOpen,
  TrendingUp,
} from "lucide-react";

export default function QuickAssistPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<QuickAssistDocument[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin] = useState(true); // In real app, get from auth context
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showManageCategoriesDialog, setShowManageCategoriesDialog] =
    useState(false);

  const [documentForm, setDocumentForm] = useState<CreateDocumentForm>({
    title: "",
    description: "",
    content: "",
    category: "",
    file: undefined,
  });

  const [categoryForm, setCategoryForm] = useState<CreateCategoryForm>({
    name: "",
    description: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docs, cats] = await Promise.all([
        quickAssistService.getDocuments(selectedCategory),
        quickAssistService.getCategories(),
      ]);
      setDocuments(docs);
      setCategories(cats);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleCreateDocument = async () => {
    try {
      await quickAssistService.createDocument(documentForm);
      setShowCreateDialog(false);
      setDocumentForm({
        title: "",
        description: "",
        content: "",
        category: "",
        file: undefined,
      });
      loadData();
    } catch (error) {
      console.error("Error creating document:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create document"
      );
    }
  };

  const handleCreateCategory = async () => {
    try {
      await quickAssistService.createCategory(categoryForm);
      setShowCategoryDialog(false);
      setCategoryForm({ name: "", description: "" });
      loadData();
    } catch (error) {
      console.error("Error creating category:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create category"
      );
    }
  };

  const handleDeleteCategory = async (
    categoryId: string,
    categoryName: string
  ) => {
    if (
      confirm(
        `Are you sure you want to delete the category "${categoryName}"?\n\nThis action cannot be undone.`
      )
    ) {
      try {
        await quickAssistService.deleteCategory(categoryId);
        loadData();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(
          error instanceof Error ? error.message : "Failed to delete category"
        );
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await quickAssistService.deleteDocument(id);
        loadData();
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }
  };

  const handleFileDownload = async (doc: QuickAssistDocument) => {
    if (doc.file_path) {
      try {
        await quickAssistService.downloadFile(doc);
      } catch (error) {
        console.error("Error downloading file:", error);
        alert(
          error instanceof Error ? error.message : "Failed to download file"
        );
      }
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDocuments = documents.length;
  const documentsWithFiles = documents.filter((doc) => doc.file_path).length;
  const totalCategories = categories.length;

  const categoryStats = categories.map((category) => {
    const categoryDocs = documents.filter(
      (doc) => doc.category === category.name
    );
    return {
      ...category,
      documentCount: categoryDocs.length,
      hasFiles: categoryDocs.filter((doc) => doc.file_path).length,
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-600">Quick Assist</h1>
          <p className="text-gray-600 mt-2">Documentation and resources</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Dialog
              open={showManageCategoriesDialog}
              onOpenChange={setShowManageCategoriesDialog}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-[#6950e8] text-[#6950e8] hover:bg-[#6950e8] hover:text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Categories
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage Categories</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="max-h-64 overflow-y-auto">
                    {categories.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No categories found
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium">{category.name}</h4>
                              {category.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {category.description}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteCategory(category.id, category.name)
                              }
                              className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={showCategoryDialog}
              onOpenChange={setShowCategoryDialog}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-[#6950e8] text-[#6950e8] hover:bg-[#6950e8] hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter category name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-description">Description</Label>
                    <Textarea
                      id="category-description"
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter category description"
                    />
                  </div>
                  <Button
                    onClick={handleCreateCategory}
                    className="w-full bg-[#6950e8] hover:bg-[#8b5cf6] text-white"
                  >
                    Create Category
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#6950e8] hover:bg-[#8b5cf6] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="doc-title">Title</Label>
                    <Input
                      id="doc-title"
                      value={documentForm.title}
                      onChange={(e) =>
                        setDocumentForm({
                          ...documentForm,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter document title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc-description">Description</Label>
                    <Textarea
                      id="doc-description"
                      value={documentForm.description}
                      onChange={(e) =>
                        setDocumentForm({
                          ...documentForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter document description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc-category">Category</Label>
                    <Select
                      onValueChange={(value) =>
                        setDocumentForm({ ...documentForm, category: value })
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
                  <div>
                    <Label htmlFor="doc-content">Content (Optional)</Label>
                    <Textarea
                      id="doc-content"
                      value={documentForm.content}
                      onChange={(e) =>
                        setDocumentForm({
                          ...documentForm,
                          content: e.target.value,
                        })
                      }
                      placeholder="Enter document content"
                      rows={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc-file">File (Optional)</Label>
                    <Input
                      id="doc-file"
                      type="file"
                      onChange={(e) =>
                        setDocumentForm({
                          ...documentForm,
                          file: e.target.files?.[0],
                        })
                      }
                    />
                  </div>
                  <Button
                    onClick={handleCreateDocument}
                    className="w-full bg-[#6950e8] hover:bg-[#8b5cf6] text-white"
                  >
                    Create Document
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-[#6950e8]" />
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold">{totalDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Folder className="h-8 w-8 text-[#6950e8]" />
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{totalCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Upload className="h-8 w-8 text-[#6950e8]" />
              <div>
                <p className="text-sm font-medium text-gray-600">Files</p>
                <p className="text-2xl font-bold">{documentsWithFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-[#6950e8]" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {documents.filter((d) => d.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Category Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryStats.map((category) => (
                <div
                  key={category.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{category.name}</h4>
                    <Badge variant="secondary">{category.documentCount}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>📄 {category.documentCount} docs</span>
                    <span>📎 {category.hasFiles} files</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="md:w-64">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {doc.description}
                  </CardDescription>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/quick-assist/${doc.id}`)}
                      className="text-[#6950e8] hover:bg-[#6950e8]/10 hover:text-[#6950e8]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge variant="secondary">{doc.category}</Badge>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{formatDate(doc.created_at)}</span>
                  {doc.file_path && (
                    <span className="flex items-center gap-1">
                      {getFileTypeIcon(doc.file_type || "")}
                      {formatFileSize(doc.file_size || 0)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/quick-assist/${doc.id}`)}
                    className="flex-1 border-[#6950e8] text-[#6950e8] hover:bg-[#6950e8] hover:text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  {doc.file_path && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileDownload(doc)}
                      className="border-[#6950e8] text-[#6950e8] hover:bg-[#6950e8] hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          {totalDocuments === 0 ? (
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Quick Assist
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by creating your first category and document to organize
                  your knowledge base.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => setShowCategoryDialog(true)}
                  className="w-full bg-[#6950e8] hover:bg-[#8b5cf6] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Category
                </Button>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  variant="outline"
                  className="w-full border-[#6950e8] text-[#6950e8] hover:bg-[#6950e8] hover:text-white"
                  disabled={categories.length === 0}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Add Your First Document
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or category filter.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

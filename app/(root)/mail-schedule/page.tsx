"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";

interface MailJob {
  id: string;
  report_type_id?: string;
  report_name: string;
  email_recipient: string;
  schedule_date: string;
  schedule_time: string;
  report_format: string;
  status: "scheduled" | "completed" | "failed";
  is_recurring: boolean;
  recurrence_pattern?: string;
  created_at: string;
}

interface FormData {
  report_type_id: string;
  report_name: string;
  report_format: string;
  email_recipient: string;
  schedule_date: string;
  schedule_time: string;
  is_recurring: boolean;
  recurrence_pattern: string;
}

export default function MailSchedulePage() {
  const [showForm, setShowForm] = useState(false);
  const [jobs, setJobs] = useState<MailJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingJob, setEditingJob] = useState<MailJob | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [reportTypes, setReportTypes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reportNames, setReportNames] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState<FormData>({
    report_type_id: "",
    report_name: "",
    report_format: "pdf",
    email_recipient: "",
    schedule_date: "",
    schedule_time: "",
    is_recurring: false,
    recurrence_pattern: "none",
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/scheduled-mail");
      if (response.ok) {
        const data = await response.json();

        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingJob
        ? `/api/scheduled-mail/${editingJob.id}`
        : "/api/scheduled-mail";
      const method = editingJob ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          editingJob
            ? "Mail task updated successfully!"
            : "Mail task created and scheduled successfully!"
        );
        setShowForm(false);
        setEditingJob(null);
        setSelectedCategory("");
        setSelectedReportType("");
        setFormData({
          report_type_id: "",
          report_name: "",
          report_format: "pdf",
          email_recipient: "",
          schedule_date: "",
          schedule_time: "",
          is_recurring: false,
          recurrence_pattern: "none",
        });
        fetchJobs();

        await initializeScheduler();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Connection error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const initializeScheduler = async () => {
    try {
      const response = await fetch("/api/scheduler/init", {
        method: "POST",
      });
      const data = await response.json();
      console.log("Scheduler status:", data);
    } catch (error) {
      console.error("Failed to initialize scheduler:", error);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/shift/reports/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([
          { id: "system-report", name: "System Report" },
          { id: "maintenance-report", name: "Maintenance Report" },
          { id: "production-report", name: "Production Report" },
        ]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          setUsers(data || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchReportTypes = async () => {
      if (!selectedCategory) {
        setReportTypes([]);
        return;
      }
      try {
        const response = await fetch(
          `/api/shift/reports/types?category_id=${selectedCategory}`
        );
        if (response.ok) {
          const data = await response.json();
          setReportTypes(data || []);
        }
      } catch (error) {
        console.error("Error fetching report types:", error);
        setReportTypes([
          { id: `${selectedCategory}-1`, name: "General Report" },
          { id: `${selectedCategory}-2`, name: "Detail Report" },
        ]);
      }
    };
    fetchReportTypes();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchReportNames = async () => {
      if (!selectedReportType) {
        setReportNames([]);
        return;
      }
      try {
        const response = await fetch(
          `/api/shift/reports/names?report_type_id=${selectedReportType}`
        );
        if (response.ok) {
          const data = await response.json();
          setReportNames(data || []);
        }
      } catch (error) {
        console.error("Error fetching report names:", error);

        setReportNames([
          { name: "Daily Report", usage_count: 5 },
          { name: "Weekly Report", usage_count: 3 },
          { name: "Monthly Report", usage_count: 2 },
        ]);
      }
    };
    fetchReportNames();
  }, [selectedReportType]);

  const handleEditJob = (job: MailJob) => {
    setEditingJob(job);

    if (job.report_type_id) {
      setSelectedReportType(job.report_type_id);

      categories.forEach(async (category) => {
        try {
          const response = await fetch(
            `/api/shift/reports/types?category=${category.id}`
          );
          if (response.ok) {
            const types = await response.json();
            if (types.some((type: any) => type.id === job.report_type_id)) {
              setSelectedCategory(category.id);
            }
          }
        } catch (error) {
          console.error("Error finding category for report type:", error);
        }
      });
    }

    setFormData({
      report_type_id: job.report_type_id || "",
      report_name: job.report_name,
      report_format: job.report_format,
      email_recipient: job.email_recipient,
      schedule_date: job.schedule_date,
      schedule_time: job.schedule_time,
      is_recurring: job.is_recurring,
      recurrence_pattern:
        job.recurrence_pattern || (job.is_recurring ? "daily" : "none"),
    });

    setShowForm(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this mail task?")) {
      return;
    }

    setDeletingJobId(jobId);
    try {
      const response = await fetch(`/api/scheduled-mail/${jobId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Mail task deleted successfully!");
        fetchJobs();
        await initializeScheduler();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Error occurred while deleting"}`);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Connection error");
    } finally {
      setDeletingJobId(null);
    }
  };

  useEffect(() => {
    fetchJobs();
    initializeScheduler();
  }, []);

  const stats = {
    total: jobs?.length || 0,
    scheduled: jobs?.filter((job) => job.status === "scheduled").length || 0,
    completed: jobs?.filter((job) => job.status === "completed").length || 0,
    failed: jobs?.filter((job) => job.status === "failed").length || 0,
  };

  const totalPages = Math.ceil((jobs?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = jobs?.slice(startIndex, endIndex) || [];

  if (showForm) {
    return (
      <div className="p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] bg-clip-text text-transparent">
                Mail Scheduling
              </h1>
              <p className="text-gray-500">
                {editingJob ? "Edit mail task" : "Create new mail task"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingJob(null);
                setSelectedCategory("");
                setSelectedReportType("");
                setFormData({
                  report_type_id: "",
                  report_name: "",
                  report_format: "pdf",
                  email_recipient: "",
                  schedule_date: "",
                  schedule_time: "",
                  is_recurring: false,
                  recurrence_pattern: "none",
                });
              }}
            >
              Back
            </Button>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] bg-clip-text text-transparent">
                <Mail className="h-6 w-6 text-[#8b7ee8]" />
                {editingJob ? "Edit Mail Task" : "New Mail Task"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Report Information
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Report Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedReportType("");
                          setFormData((prev) => ({
                            ...prev,
                            report_type_id: "",
                            report_name: "",
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Report Type
                      </label>
                      <select
                        value={selectedReportType}
                        onChange={(e) => {
                          setSelectedReportType(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            report_type_id: e.target.value,
                            report_name: "",
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                        disabled={!selectedCategory}
                        required
                      >
                        <option value="" disabled hidden>
                          {selectedCategory
                            ? "Select Report Type"
                            : "Select Category First"}
                        </option>
                        {reportTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Report Name
                      </label>
                      <input
                        type="text"
                        name="report_name"
                        value={formData.report_name}
                        onChange={handleInputChange}
                        placeholder="Enter custom report name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                        disabled={!selectedReportType}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Report Format
                      </label>
                      <select
                        name="report_format"
                        value={formData.report_format}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Mail Information
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Recipient User
                      </label>
                      <select
                        onChange={(e) => {
                          const selectedUser = users.find(
                            (user) => user.id === e.target.value
                          );
                          setFormData((prev) => ({
                            ...prev,
                            email_recipient: selectedUser
                              ? selectedUser.email
                              : "",
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select User</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} {user.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Recipient Email
                      </label>
                      <input
                        type="email"
                        name="email_recipient"
                        value={formData.email_recipient}
                        onChange={handleInputChange}
                        placeholder="Auto-filled when user is selected"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
                        readOnly
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Clock className="h-5 w-5 text-green-600" />
                    Scheduling Information
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <input
                        type="date"
                        name="schedule_date"
                        value={formData.schedule_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Time
                      </label>
                      <input
                        type="time"
                        name="schedule_time"
                        value={formData.schedule_time}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Recurring Schedule
                    </label>
                    <select
                      name="recurrence_pattern"
                      value={formData.recurrence_pattern}
                      onChange={(e) => {
                        const pattern = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          recurrence_pattern: pattern,
                          is_recurring: pattern !== "none",
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="none">One-time only</option>
                      <option value="daily">
                        Daily - Every day at same time
                      </option>
                      <option value="weekly">
                        Weekly - Every week at same time
                      </option>
                      <option value="monthly">
                        Monthly - Every month at same time
                      </option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingJob(null);
                      setSelectedCategory("");
                      setSelectedReportType("");
                      setFormData({
                        report_type_id: "",
                        report_name: "",
                        report_format: "pdf",
                        email_recipient: "",
                        schedule_date: "",
                        schedule_time: "",
                        is_recurring: false,
                        recurrence_pattern: "none",
                      });
                    }}
                    disabled={submitting}
                    className="px-6 py-2 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] hover:from-[#7c70e6] hover:to-[#9d8df1] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ring-1 ring-purple-200 hover:ring-purple-300"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingJob ? "Updating..." : "Creating..."}
                      </>
                    ) : editingJob ? (
                      "Update"
                    ) : (
                      "Create"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] bg-clip-text text-transparent">
            <Mail className="h-6 w-6 text-[#8b7ee8]" />
            Mail Scheduling
          </h1>
          <p className="text-gray-600">
            Schedule reports to be sent by email automatically
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowForm(true)}
            className="group flex items-center gap-2 bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] hover:from-[#7c70e6] hover:to-[#9d8df1] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ring-2 ring-purple-200 hover:ring-purple-300"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
            New Mail Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Task</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.scheduled}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.failed}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] bg-clip-text text-transparent">
            Mail Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No mail tasks found
              </h3>
              <p className="text-gray-600">
                Click "New Mail Task" button to create your first mail task.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentJobs?.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {job.report_name}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Recipient: {job.email_recipient}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Scheduled for:{" "}
                        {new Date(job.schedule_date).toLocaleDateString(
                          "en-GB"
                        )}{" "}
                        at {job.schedule_time}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Format: {job.report_format.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {job.is_recurring && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {job.recurrence_pattern === "daily"
                            ? "Daily"
                            : job.recurrence_pattern === "weekly"
                            ? "Weekly"
                            : job.recurrence_pattern === "monthly"
                            ? "Monthly"
                            : "Recurring"}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          job.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : job.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {job.status === "scheduled"
                          ? "Scheduled"
                          : job.status === "completed"
                          ? "Completed"
                          : "Failed"}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditJob(job)}
                          className="flex items-center gap-1 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingJobId === job.id}
                          className="flex items-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        >
                          {deletingJobId === job.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {jobs.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, jobs.length)} of{" "}
                {jobs.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === page
                            ? "bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] text-white shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200"
                            : "hover:bg-purple-50 hover:border-purple-200 transition-all duration-200"
                        }`}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  History,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  Calendar,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  getBackupHistory,
  getBackupSessionDetails,
  deleteBackupSession,
} from "@/utils/service/system-expectations/cmos-backup";
import {
  BackupSessionWithController,
  BackupFileDetail,
  BackupHistoryProps,
} from "@/types/backup.types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const BackupHistory = ({
  controllerId,
  isVisible,
  refreshTrigger,
}: BackupHistoryProps) => {
  const [sessions, setSessions] = useState<BackupSessionWithController[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<{
    [key: string]: BackupFileDetail[];
  }>({});
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [deletingSession, setDeletingSession] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && controllerId) {
      fetchBackupHistory();
    }
  }, [controllerId, isVisible, refreshTrigger]);

  const fetchBackupHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getBackupHistory(controllerId);
      setSessions(data);
    } catch (error) {
      console.error("Error fetching backup history:", error);
      toast.error("Failed to fetch backup history");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSessionDetails = async (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      return;
    }

    setExpandedSession(sessionId);

    // Eğer detaylar daha önce yüklenmediyse, API'den getir
    if (!sessionDetails[sessionId]) {
      setLoadingDetails(sessionId);
      try {
        const details = await getBackupSessionDetails(sessionId);
        setSessionDetails((prev) => ({ ...prev, [sessionId]: details }));
      } catch (error) {
        console.error("Error fetching session details:", error);
        toast.error("Failed to fetch session details");
      } finally {
        setLoadingDetails(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("tr-TR");
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "In Progress";
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  const handleDeleteSession = async (
    sessionId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    if (!confirm("Are you sure you want to delete this backup session?")) {
      return;
    }

    setDeletingSession(sessionId);
    try {
      const result = await deleteBackupSession(sessionId);

      if (result.success) {
        toast.success("Backup session deleted successfully");

        setSessions((prev) =>
          prev.filter((session) => session.id !== sessionId)
        );

        if (expandedSession === sessionId) {
          setExpandedSession(null);
        }
      } else {
        toast.error(result.error || "Failed to delete session!");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session");
    } finally {
      setDeletingSession(null);
    }
  };

  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="w-5 h-5" />
          CMOS Backup History
          {isLoading && <RefreshCw className="w-4 h-4 animate-spin ml-2" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading backup history...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No backup history found</p>
            <p className="text-sm mt-1">
              Backup sessions will appear here after running backups
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => toggleSessionDetails(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedSession === session.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">
                            {formatDate(session.session_start_time)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : session.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(
                              session.session_start_time,
                              session.session_end_time || null
                            )}
                          </span>
                          <span>{session.controller_ip}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-medium">
                            {session.successful_files}
                          </span>
                          {session.failed_files > 0 && (
                            <>
                              <XCircle className="w-4 h-4 text-red-500 ml-2" />
                              <span className="text-red-600 font-medium">
                                {session.failed_files}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.total_files} total files
                        </div>
                      </div>
                      <Button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        disabled={deletingSession === session.id}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        {deletingSession === session.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {expandedSession === session.id && (
                  <div className="border-t bg-white">
                    {loadingDetails === session.id ? (
                      <div className="p-4 text-center">
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                        <span className="text-sm text-gray-500">
                          Loading file details...
                        </span>
                      </div>
                    ) : sessionDetails[session.id] ? (
                      <div className="p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Backup Files ({sessionDetails[session.id].length})
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {sessionDetails[session.id].map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                {file.backup_status ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="font-mono text-sm">
                                  {file.file_name}
                                </span>
                                <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                  {file.file_type}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(file.backup_time)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Failed to load file details
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackupHistory;

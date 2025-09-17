"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Archive,
  Download,
} from "lucide-react";
import {
  getBackupHistory,
  getBackupSessionDetails,
  deleteBackupSession,
  createBackupZip,
  checkBackupZip,
  downloadBackupZip,
} from "@/utils/service/system-expectations/cmos-backup";
import {
  BackupSessionWithController,
  BackupFileDetail,
} from "@/types/backup.types";
import { toast } from "sonner";

interface FilesBackupHistoryProps {
  controllerId: string;
}

const FilesBackupHistory = ({ controllerId }: FilesBackupHistoryProps) => {
  const [sessions, setSessions] = useState<BackupSessionWithController[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<{
    [key: string]: BackupFileDetail[];
  }>({});
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  const [creatingZip, setCreatingZip] = useState<string | null>(null);
  const [zipStatus, setZipStatus] = useState<{
    [key: string]: { exists: boolean; fileName?: string; size?: number };
  }>({});

  useEffect(() => {
    if (controllerId) {
      fetchBackupHistory();
    }
  }, [controllerId]);

  const fetchBackupHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getBackupHistory(controllerId);
      setSessions(data);

      for (const session of data) {
        checkZipStatus(session.id);
      }
    } catch (error) {
      console.error("Error fetching backup history:", error);
      toast.error("Failed to fetch backup history");
    } finally {
      setIsLoading(false);
    }
  };

  const checkZipStatus = async (sessionId: string) => {
    try {
      const zipInfo = await checkBackupZip(sessionId);
      setZipStatus((prev) => ({
        ...prev,
        [sessionId]: {
          exists: zipInfo.exists,
          fileName: zipInfo.zipFileName,
          size: zipInfo.zipSizeBytes,
        },
      }));
    } catch (error) {
      console.error(`Error checking ZIP for session ${sessionId}:`, error);
      setZipStatus((prev) => ({
        ...prev,
        [sessionId]: {
          exists: false,
        },
      }));
    }
  };

  const toggleSessionDetails = async (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      return;
    }

    setExpandedSession(sessionId);
    setLoadingDetails(sessionId);

    try {
      const details = await getBackupSessionDetails(sessionId);
      setSessionDetails((prev) => ({
        ...prev,
        [sessionId]: details,
      }));
    } catch (error) {
      console.error("Error fetching session details:", error);
      toast.error("Failed to load session details");
    } finally {
      setLoadingDetails(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("tr-TR");
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = end.getTime() - start.getTime();
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
        // Clear details if expanded
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

  const handleCreateZip = async (
    sessionId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    setCreatingZip(sessionId);
    try {
      const result = await createBackupZip(sessionId);

      if (result.success) {
        toast.success(
          `ZIP created successfully! ${result.fileCount} files archived.`
        );
        // ZIP durumunu güncelle
        await checkZipStatus(sessionId);
      } else {
        toast.error(result.error || "Failed to create ZIP!");
      }
    } catch (error) {
      console.error("Error creating ZIP:", error);
      toast.error("Failed to create ZIP file");
    } finally {
      setCreatingZip(null);
    }
  };

  const handleDownloadZip = async (
    sessionId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    try {
      downloadBackupZip(sessionId);
      toast.success("Download started!");
    } catch (error) {
      console.error("Error downloading ZIP:", error);
      toast.error("Failed to download ZIP file");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Backup History</h3>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          </div>

          {/* ZIP Management Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
            <Archive className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              ZIP Archives
            </span>
            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              {
                Object.values(zipStatus).filter((status) => status.exists)
                  .length
              }{" "}
              Ready
            </div>
          </div>
        </div>

        <Button
          onClick={fetchBackupHistory}
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading backup history...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No backup sessions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="border rounded-lg overflow-hidden">
              <div
                className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => toggleSessionDetails(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedSession === session.id ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {formatDate(session.session_start_time)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : session.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        {session.session_end_time
                          ? formatDuration(
                              session.session_start_time,
                              session.session_end_time
                            )
                          : "In progress..."}
                      </span>
                      <span>{session.controller_ip}</span>
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
                        {zipStatus[session.id]?.exists && (
                          <div className="flex items-center gap-1 mt-1">
                            <Archive className="w-3 h-3 text-blue-500" />
                            <span className="text-blue-600">ZIP Ready</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {zipStatus[session.id]?.exists ? (
                        <Button
                          onClick={(e) => handleDownloadZip(session.id, e)}
                          size="default"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2"
                          title="Download ZIP"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download ZIP
                        </Button>
                      ) : (
                        <Button
                          onClick={(e) => handleCreateZip(session.id, e)}
                          disabled={creatingZip === session.id}
                          size="default"
                          className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2"
                          title="Create ZIP"
                        >
                          {creatingZip === session.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Archive className="w-4 h-4 mr-2" />
                              Create ZIP
                            </>
                          )}
                        </Button>
                      )}

                      <Button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        disabled={deletingSession === session.id}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        title="Delete Session"
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
                  ) : (
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          Backup Files (
                          {sessionDetails[session.id]?.length || 0})
                        </span>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {sessionDetails[session.id]?.map((file, index) => (
                          <div
                            key={index}
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
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {file.file_type}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(file.backup_time)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilesBackupHistory;

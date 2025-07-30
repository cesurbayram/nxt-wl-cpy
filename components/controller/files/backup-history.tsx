"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Download, RefreshCw } from "lucide-react";
import {
  getBackupHistory,
  downloadBackup,
  deleteBackup,
  BackupHistoryItem,
} from "@/utils/service/files/backup-history";

interface BackupHistoryProps {
  controllerId: string;
}

const BackupHistory: React.FC<BackupHistoryProps> = ({ controllerId }) => {
  const [backups, setBackups] = useState<BackupHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await getBackupHistory(controllerId);
      if (response.success && response.data) {
        setBackups(response.data);
      } else {
        console.error("Failed to fetch backups:", response.error);
        setBackups([]);
      }
    } catch (error) {
      console.error("Error fetching backups:", error);
      setBackups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (controllerId) {
      fetchBackups();
    }
  }, [controllerId]);

  const handleDownload = async (backup: BackupHistoryItem) => {
    try {
      await downloadBackup(backup.id, backup.file_name);
    } catch (error) {
      alert("Download failed. Please try again.");
    }
  };

  const handleDelete = async (backup: BackupHistoryItem) => {
    if (!confirm(`"${backup.file_name}" file will be deleted. Are you sure?`)) {
      return;
    }

    setDeleting(backup.id);
    try {
      const response = await deleteBackup(backup.id);
      if (response.success) {
        alert("Backup deleted successfully.");
        fetchBackups();
      } else {
        alert(`Delete failed: ${response.error}`);
      }
    } catch (error) {
      alert("Delete failed. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (sizeInMB: string) => {
    const size = parseFloat(sizeInMB);
    if (size >= 1000) {
      return `${(size / 1000).toFixed(1)} GB`;
    }
    return `${size} MB`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Backup History
            <RefreshCw className="h-4 w-4 animate-spin" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Backup history is loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Backup History</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchBackups}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4"></div>
            <div>No backup history found.</div>
            <div className="text-sm mt-2">
              Use the "Instant Backup" button to create your first backup.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Date</th>
                  <th className="text-left py-3 px-2 font-semibold">
                    File Name
                  </th>
                  <th className="text-center py-3 px-2 font-semibold">
                    File Count
                  </th>
                  <th className="text-center py-3 px-2 font-semibold">Size</th>
                  <th className="text-center py-3 px-2 font-semibold">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="text-sm">
                        {formatDate(backup.created_at)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-sm">
                        {backup.file_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {backup.controller_name}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {backup.file_count} dosya
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {formatFileSize(backup.file_size_mb)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(backup)}
                          className="h-8 px-3"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          <span className="text-xs">İndir</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(backup)}
                          disabled={deleting === backup.id}
                          className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {deleting === backup.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-3 w-3 mr-1" />
                              <span className="text-xs">Delete</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackupHistory;

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Check,
  Download,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Mail,
  FileText,
  Settings,
  Users,
  Activity,
} from "lucide-react";
import { NotificationService } from "@/utils/service/notification";
import { Notification, NotificationResponse } from "@/types/notification.types";
import { formatDistanceToNow } from "date-fns";
import { format } from "date-fns";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const fetchNotifications = async (unreadOnly = false) => {
    try {
      setLoading(true);
      const response = await NotificationService.getNotifications(
        undefined, // Use current user ID
        unreadOnly,
        100
      );
      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
      setTotalCount(response.total_count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(activeTab === "unseen");

    // Auto-refresh every 30 seconds when page is active
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchNotifications(activeTab === "unseen");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications(activeTab === "unseen");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeTab]);

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = async (
    notification: Notification,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!notification.is_read) {
      try {
        await NotificationService.markAsRead([notification.id]);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const getNotificationIcon = (type: string, severity?: string) => {
    switch (type) {
      case "mail_sent":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "mail_failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "report_ready":
        return <Download className="h-5 w-5 text-blue-500" />;
      case "report_generated":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "report_failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "maintenance_completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "maintenance_scheduled":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "maintenance_overdue":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "employee_added":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "employee_updated":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "employee_deleted":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "alarm_triggered":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, severity?: string) => {
    switch (severity) {
      case "error":
        return "border-l-red-500";
      case "warning":
        return "border-l-orange-500";
      case "success":
        return "border-l-green-500";
      case "info":
      default:
        return "border-l-blue-500";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  const formatFullDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP p");
    } catch {
      return "Unknown date";
    }
  };

  const renderNotificationAction = (notification: Notification) => {
    if (
      notification.type === "report_ready" &&
      notification.data?.download_url
    ) {
      return (
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={(e) => {
            e.stopPropagation();
            window.open(notification.data.download_url, "_blank");
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download {notification.data.file_name}
        </Button>
      );
    }
    return null;
  };

  const getStats = () => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const todayNotifications = notifications.filter(
      (n) => new Date(n.created_at) >= todayStart
    ).length;

    const errorNotifications = notifications.filter(
      (n) => n.data?.severity === "error"
    ).length;

    const warningNotifications = notifications.filter(
      (n) => n.data?.severity === "warning"
    ).length;

    return {
      today: todayNotifications,
      errors: errorNotifications,
      warnings: warningNotifications,
      total: totalCount,
    };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] bg-clip-text text-transparent">
            System Notifications
          </h1>
          <p className="text-gray-500">
            Stay updated with all system activities and events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {unreadCount} unread
          </Badge>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.errors}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.warnings}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto">
              <TabsList className="w-full min-w-max flex">
                <TabsTrigger
                  value="all"
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4"
                >
                  <span className="sm:hidden">All</span>
                  <span className="hidden sm:inline">All</span>
                </TabsTrigger>
                <TabsTrigger
                  value="unseen"
                  className="flex-1 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4"
                >
                  <span className="sm:hidden">
                    New
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-1 h-3 w-3 rounded-full text-xs p-0"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </span>
                  <span className="hidden sm:inline">
                    Unseen
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-2 h-4 w-4 rounded-full text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-4">
              <ScrollArea className="h-[600px]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">
                      No notifications yet
                    </p>
                    <p className="text-gray-400 text-sm">
                      System events will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-l-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${getNotificationColor(
                          notification.type,
                          notification.data?.severity
                        )} ${
                          !notification.is_read ? "bg-blue-50" : "bg-white"
                        } border border-gray-200`}
                        onClick={(e) =>
                          handleNotificationClick(notification, e)
                        }
                      >
                        <div className="flex items-start space-x-4">
                          {getNotificationIcon(
                            notification.type,
                            notification.data?.severity
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p
                                className={`text-sm font-medium ${
                                  !notification.is_read
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  {formatTime(notification.created_at)}
                                </span>
                                {!notification.is_read && (
                                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatFullDate(notification.created_at)}
                            </p>
                            {renderNotificationAction(notification)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unseen" className="mt-4">
              <ScrollArea className="h-[600px]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : notifications.filter((n) => !n.is_read).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
                    <p className="text-gray-500 text-lg">All caught up!</p>
                    <p className="text-gray-400 text-sm">
                      No unread notifications
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications
                      .filter((n) => !n.is_read)
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-l-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${getNotificationColor(
                            notification.type,
                            notification.data?.severity
                          )} bg-blue-50 border border-gray-200`}
                          onClick={(e) =>
                            handleNotificationClick(notification, e)
                          }
                        >
                          <div className="flex items-start space-x-4">
                            {getNotificationIcon(
                              notification.type,
                              notification.data?.severity
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">
                                    {formatTime(notification.created_at)}
                                  </span>
                                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatFullDate(notification.created_at)}
                              </p>
                              {renderNotificationAction(notification)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

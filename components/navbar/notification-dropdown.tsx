"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import {
  Bell,
  Check,
  Download,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  X,
  Calendar,
  Clock,
} from "lucide-react";
import { NotificationService } from "@/utils/service/notification";
import { Notification, NotificationResponse } from "@/types/notification.types";
import { formatDistanceToNow, format } from "date-fns";
import { getDataFromStorage } from "@/utils/common/storage";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [cacheToken, setCacheToken] = useState<string>("");
  const CACHE_DURATION = 5 * 60 * 1000;

  const isValidToken = () => {
    try {
      const userData = getDataFromStorage("user");
      const token = userData?.token;

      if (!token) {
        console.log("No auth token found - skipping notifications");
        return false;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.log("Auth token expired - skipping notifications");
          return false;
        }
      } catch (e) {}

      return true;
    } catch (error) {
      console.log("🔒 Token validation error - skipping notifications");
      return false;
    }
  };

  const fetchNotifications = async (
    unreadOnly = false,
    forceRefresh = false
  ) => {
    if (!isValidToken()) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const now = Date.now();
    const userData = getDataFromStorage("user");
    const userToken = userData?.token?.substring(0, 10) || "guest";
    const currentToken = `${userToken}-${unreadOnly}-${Math.floor(
      now / CACHE_DURATION
    )}`;

    if (
      !forceRefresh &&
      currentToken === cacheToken &&
      now - lastFetchTime < CACHE_DURATION
    ) {
      console.log("Using cached notifications - No API call needed");
      return;
    }

    try {
      setLoading(true);
      console.log("📡 Fetching fresh notifications from API");

      const response = await NotificationService.getNotifications(
        undefined,
        unreadOnly,
        50
      );

      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
      setLastFetchTime(now);
      setCacheToken(currentToken);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(false, true);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications(false, true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchNotifications();
      }
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(activeTab === "unseen", true);
      const openInterval = setInterval(() => {
        fetchNotifications(activeTab === "unseen");
      }, 60000);
      return () => clearInterval(openInterval);
    }
  }, [isOpen, activeTab]);

  const handleMarkAllAsRead = async () => {
    if (!isValidToken()) {
      console.log("Cannot mark as read - invalid token");
      return;
    }

    try {
      await NotificationService.markAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setCacheToken("");
      setLastFetchTime(0);
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
      if (!isValidToken()) {
        console.log("Cannot mark notification as read - invalid token");
        return;
      }

      try {
        await NotificationService.markAsRead([notification.id]);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        setCacheToken("");
        setLastFetchTime(0);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const getNotificationIcon = (type: string, severity?: string) => {
    switch (type) {
      case "mail_sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "mail_failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "report_ready":
        return <Download className="h-4 w-4 text-blue-500" />;
      case "report_generated":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "report_failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "maintenance_completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "maintenance_scheduled":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "maintenance_overdue":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "employee_added":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "employee_updated":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "employee_deleted":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "controller_added":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "alarm_triggered":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, severity?: string) => {
    switch (type) {
      case "alarm_triggered":
      case "mail_failed":
      case "report_failed":
        return "border-red-500";
      case "maintenance_overdue":
      case "employee_deleted":
        return "border-orange-500";
      case "mail_sent":
      case "maintenance_completed":
      case "employee_added":
      case "controller_added":
        return "border-green-500";
      default:
        return "border-blue-500";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy, HH:mm");
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
          className="mt-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            window.open(notification.data.download_url, "_blank");
          }}
        >
          <Download className="h-3 w-3 mr-1" />
          files/{notification.data.file_name || "report"}
        </Button>
      );
    }
    return null;
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unseen") {
      return !notification.is_read;
    }
    return true;
  });

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative p-2 rounded-full hover:bg-accent"
        onClick={() => setIsOpen(true)}
      >
        <Bell size={24} className="text-foreground" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div
          className="fixed top-16 left-0 right-0 bottom-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Notifications</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="w-full mb-4 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                Mark all as read
              </Button>
            )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all" className="relative">
                  All
                </TabsTrigger>
                <TabsTrigger value="unseen" className="relative">
                  Unseen
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-2 h-4 w-4 rounded-full text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-r-lg ${getNotificationColor(
                        notification.type,
                        notification.data?.severity
                      )} ${
                        !notification.is_read ? "bg-blue-50" : "bg-gray-50"
                      }`}
                      onClick={(e) => handleNotificationClick(notification, e)}
                    >
                      <div className="flex items-start space-x-3">
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
                            {!notification.is_read && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-400">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>
                          {renderNotificationAction(notification)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="p-4 border-t bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              That's all your notifications from the last 90 days
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;

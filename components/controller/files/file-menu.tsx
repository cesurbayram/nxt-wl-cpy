import React from "react";
import { cn } from "@/lib/utils";

interface FileMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const FileMenu: React.FC<FileMenuProps> = ({
  activeTab,
  onTabChange,
}) => {
  const menuItems = [
    { id: "overview", label: "Overview" },
    { id: "plans", label: "Plans" },
    { id: "explorer", label: "Explorer" },
  ];

  return (
    <div className="w-60 border-r bg-background">
      <div className="p-4">
        <div className="text-sm font-medium mb-4">File backup</div>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium",
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

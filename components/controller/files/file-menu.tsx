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
        <h3 className="font-medium mb-4">File backup</h3>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md transition-colors",
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

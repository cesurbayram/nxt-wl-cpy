"use client";
import { Button } from "../ui/button";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { MdLanguage } from "react-icons/md";
import UserProfileButton from "./user-profile-button";
import NotificationDropdown from "./notification-dropdown";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useTheme } from "next-themes";

const TopNavbar = () => {
  const { theme, setTheme } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState("EN");
  const [mounted, setMounted] = useState(false);

  const languages = [{ code: "EN", label: "English" }];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="py-4 flex justify-end px-6 transition-colors duration-200 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-accent"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <MdDarkMode size={20} className="text-foreground" />
          ) : (
            <MdLightMode size={20} className="text-foreground" />
          )}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-3 py-1 text-sm font-medium hover:bg-accent"
            >
              {currentLanguage}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-0">
            <div className="grid grid-cols-1">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant="ghost"
                  className="justify-start text-sm hover:bg-accent"
                  onClick={() => setCurrentLanguage(lang.code)}
                >
                  {lang.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <NotificationDropdown />

        <UserProfileButton />
      </div>
    </div>
  );
};

export default TopNavbar;

"use client";
import { Button } from "../ui/button";
import { MdLightMode, MdDarkMode, MdMenu, MdClose } from "react-icons/md";
import { MdLanguage } from "react-icons/md";
import UserProfileButton from "./user-profile-button";
import NotificationDropdown from "./notification-dropdown";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useTheme } from "next-themes";
import SideNavbar from "./side-navbar";

const TopNavbar = () => {
  const { theme, setTheme } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState("EN");
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages = [{ code: "EN", label: "English" }];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="py-4 flex justify-between lg:justify-end px-6 transition-colors duration-200 border-b border-gray-200">
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-accent"
            onClick={() => setMobileMenuOpen(true)}
          >
            <MdMenu size={20} className="text-foreground" />
          </Button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-accent"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <MdDarkMode size={18} className="text-foreground sm:w-5 sm:h-5" />
            ) : (
              <MdLightMode
                size={18}
                className="text-foreground sm:w-5 sm:h-5"
              />
            )}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium hover:bg-accent"
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

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed left-0 top-0 h-full w-64 bg-background shadow-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2"
              >
                <MdClose size={20} />
              </Button>
            </div>
            <SideNavbar />
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavbar;

"use client";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa6";
import { usePathname } from "next/navigation";

interface ChildPages {
  title: string;
  link: string;
  icon: JSX.Element;
}

interface CollapsibleButtonProps {
  parentIcon: JSX.Element;
  parentTitle: string;
  childPages: ChildPages[];
}

const CollapsibleButton = ({
  parentIcon,
  parentTitle,
  childPages,
}: CollapsibleButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const hasActiveChild = childPages.some((child) => {
    if (child.link === "/shift") {
      return pathname === "/shift";
    }
    return pathname.startsWith(child.link);
  });
  const isParentActive = hasActiveChild;

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  return (
    <>
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant={"ghost"}
          className={`
            group relative w-full h-11 px-3 mb-1
            flex justify-start items-center gap-3
            rounded-xl transition-all duration-200
            text-sm font-medium
            ${
              isParentActive
                ? "bg-gradient-to-r from-[#6950e8]/10 to-[#6950e8]/5 text-[#6950e8]"
                : "text-slate-600 hover:text-[#6950e8] hover:bg-slate-50"
            }
            hover:translate-x-1 hover:shadow-sm
          `}
        >
          <div
            className={`
            flex items-center justify-center w-5 h-5
            transition-all duration-200
            ${isParentActive ? "scale-110" : "group-hover:scale-105"}
          `}
          >
            {parentIcon}
          </div>

          <span className="flex-1">{parentTitle}</span>

          <FaChevronRight
            className={`
              w-3 h-3 transition-all duration-300 ease-out
              ${isOpen ? "rotate-90 text-[#6950e8]" : "rotate-0"}
              ${isParentActive ? "text-[#6950e8]" : "text-slate-400"}
            `}
          />

          {isParentActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#6950e8] rounded-r-full" />
          )}
        </Button>
      </div>

      <div
        className={`
        overflow-hidden transition-all duration-500 ease-out
        ${isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}
      `}
      >
        <div className="pl-3 pr-3 py-1 space-y-1">
          {childPages.map((item) => {
            const isChildActive =
              item.link === "/shift"
                ? pathname === "/shift"
                : pathname.startsWith(item.link);

            return (
              <div key={item.title} className="relative">
                <Button
                  asChild
                  variant={"ghost"}
                  className={`
                    group relative w-full h-9 px-3 ml-3
                    flex justify-start items-center gap-3
                    rounded-lg transition-all duration-200
                    text-sm font-medium
                    ${
                      isChildActive
                        ? "bg-[#6950e8]/8 text-[#6950e8] font-medium"
                        : "text-slate-500 hover:text-[#6950e8] hover:bg-slate-50"
                    }
                    ${!isChildActive ? "hover:translate-x-1" : ""}
                  `}
                >
                  <Link
                    href={item.link}
                    className="flex items-center gap-3 w-full"
                  >
                    <div className="relative">
                      <div className="absolute -left-9 top-1/2 w-4 h-px bg-slate-300" />
                      <div className="absolute -left-9 top-1/2 w-px h-4 bg-slate-300 -translate-y-2" />
                    </div>
                    <div
                      className={`
                      flex items-center justify-center w-4 h-4
                      transition-all duration-200
                      ${isChildActive ? "scale-110" : "group-hover:scale-105"}
                    `}
                    >
                      {item.icon}
                    </div>

                    <span className="flex-1">{item.title}</span>

                    {isChildActive && (
                      <div className="w-1.5 h-1.5 bg-[#6950e8] rounded-full" />
                    )}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CollapsibleButton;

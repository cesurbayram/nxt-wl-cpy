"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa6";

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

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant={"ghost"}
        className={`                    
                    flex
                    mb-1 
                    justify-start
                    items-center
                    gap-3
                    rounded-lg
                    hover:text-[#6950e8]
                    text-sm
                    text-[#6B7280]
                `}
      >
        {parentIcon}
        {parentTitle}
        <FaChevronRight
          className={`
                ml-auto
                transition-all
                duration-200
                ${isOpen ? "rotate-90" : "-rotate-0"}
            `}
          size={12}
        />
      </Button>
      <div className={`
        ${isOpen ? 'max-h-40' : 'max-h-0'}
        overflow-hidden
        pl-4
        transition-all
        duration-500
        ease-in-out        
        `}>
        {childPages.map((item) => (
          <Button
            asChild
            key={item.title}
            variant={"ghost"}
            className={`                                       
                      flex                   
                      justify-start
                      items-center
                      gap-3
                      rounded-lg
                      hover:text-[#6950e8]
                      text-sm
                      text-[#6B7280]
                  `}
          >
            <Link href={item.link}>
              {item.icon}
              {item.title}
            </Link>
          </Button>
        ))}
      </div>
    </>
  );
};

export default CollapsibleButton;

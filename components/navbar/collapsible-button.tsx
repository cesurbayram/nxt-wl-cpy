"use client";
import { ReactElement, useState } from "react";
import { Collapsible, CollapsibleTrigger } from "../ui/collapsible";
import { Button } from "../ui/button";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import Link from "next/link";
import { FaChevronDown, FaChevronRight } from "react-icons/fa6";

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild className="w-full">
        <Button
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
          {isOpen ? (
            <FaChevronDown className="ml-auto" size={12} />
          ) : (
            <FaChevronRight className="ml-auto" size={12} />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent
        className={`pl-4 space-y-2`}
      >
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleButton;

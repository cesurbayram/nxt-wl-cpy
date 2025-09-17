import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { MdAdd } from "react-icons/md";

interface PageWrapperProps {
  children: ReactNode;
  pageTitle: string;
  additionalComponent?: ReactNode;
  icon?: ReactNode;
  buttonText?: string;
  buttonAction?: () => void;
  shownHeaderButton?: boolean;
  headerActions?: ReactNode;
}

const PageWrapper = ({
  children,
  additionalComponent,
  pageTitle,
  icon,
  buttonText,
  buttonAction,
  shownHeaderButton = true,
  headerActions,
}: PageWrapperProps) => {
  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center">
          {icon && (
            <div className="p-2 bg-[#6950e81a] bg-opacity-10 inline rounded-lg mr-2">
              {icon}
            </div>
          )}

          <p className="text-base sm:text-lg">{pageTitle}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {headerActions}
          {additionalComponent}

          {shownHeaderButton && (
            <Button
              className="rounded-xl bg-[#6950E8] w-full sm:w-auto"
              onClick={buttonAction}
            >
              <MdAdd className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">{buttonText}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-1 sm:p-2 md:p-3 lg:p-4">{children}</CardContent>
    </Card>
  );
};

export default PageWrapper;

import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { MdAdd } from "react-icons/md";

interface PageWrapperProps {
    children: ReactNode;
    pageTitle: string;
    additionalComponent?: ReactNode;
    icon?: ReactNode;
    buttonText:string
    buttonAction?: () => void

}


const PageWrapper = ({ children, additionalComponent, pageTitle, icon, buttonText, buttonAction }: PageWrapperProps) => {
    return(
        <Card className="shadow-md rounded-xl">
            <CardHeader className="flex flex-row justify-between items-center">
                <div className="flex items-center">
                    <div className="p-2 bg-[#6950e81a] bg-opacity-10 inline rounded-lg mr-2">
                        {icon}
                    </div>

                    <p className="text-base">{pageTitle}</p>
                </div>

                {additionalComponent}

                <Button 
                    className="rounded-xl bg-[#6950E8]"
                    onClick={buttonAction}
                >
                    <MdAdd className="w-5 h-5 mr-2" /> <span className="text-sm">{buttonText}</span>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                {children}
            </CardContent>
        </Card>
    )
}

export default PageWrapper;
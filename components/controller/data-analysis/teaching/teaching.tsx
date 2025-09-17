import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileComparison from "./file-comparison";
import FSUComparison from "./fsu-comparison";
import {
  FileType,
  FSUSubType,
  FILE_TYPE_CONFIGS,
  FSU_SUBTYPE_CONFIGS,
  FileSystemDirectoryHandle,
} from "@/types/teaching.types";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";
import { toast } from "sonner";

interface TeachingProps {
  controllerId: string;
}

export const Teaching: React.FC<TeachingProps> = ({ controllerId }) => {
  const [selectedFileType, setSelectedFileType] = useState<FileType>(
    FileType.JOB
  );
  const [selectedFSUSubType, setSelectedFSUSubType] =
    useState<FSUSubType | null>(FSUSubType.AXIS_RANGE_LIMIT);
  const [activeTab, setActiveTab] = useState<string>(FileType.JOB);

  const [folder1, setFolder1] = useState<any | null>(null);
  const [folder2, setFolder2] = useState<any | null>(null);
  const [folder1Name, setFolder1Name] = useState<string>("");
  const [folder2Name, setFolder2Name] = useState<string>("");
  const [folder1Files, setFolder1Files] = useState<File[]>([]);
  const [folder2Files, setFolder2Files] = useState<File[]>([]);

  const handleFileTypeChange = (value: string) => {
    console.log("Tab changed to:", value);

    setActiveTab(value);

    if (value.startsWith("fsu-")) {
      const subType = value.replace("fsu-", "") as FSUSubType;
      setSelectedFSUSubType(subType);
      setSelectedFileType(FileType.FSU);
      return;
    }

    if (value === FileType.FSU) {
      const firstSubType = FSU_SUBTYPE_CONFIGS[0].type;
      setSelectedFileType(FileType.FSU);
      setSelectedFSUSubType(firstSubType);
      setTimeout(() => {
        setActiveTab(`fsu-${firstSubType}`);
      }, 0);
      return;
    }

    setSelectedFileType(value as FileType);
    if (value !== FileType.FSU) {
      setSelectedFSUSubType(null);
    }
  };

  const handleSelectFolder = async (isFirstFolder: boolean) => {
    try {
      const canUseDirectoryPicker =
        typeof window !== "undefined" &&
        typeof (window as any).showDirectoryPicker === "function" &&
        (window as any).isSecureContext;

      if (canUseDirectoryPicker) {
        const dirHandle = await (window as any).showDirectoryPicker();

        if (isFirstFolder) {
          setFolder1(dirHandle);
          setFolder1Name(dirHandle.name);
          await loadFilesFromFolder(dirHandle, true);
        } else {
          setFolder2(dirHandle);
          setFolder2Name(dirHandle.name);
          await loadFilesFromFolder(dirHandle, false);
        }

        toast.success(`Folder selected: ${dirHandle.name}`);
        return;
      }

      const input = document.createElement("input");
      input.type = "file";
      (input as any).webkitdirectory = true;
      input.multiple = true;

      const filesSelected = await new Promise<File[]>((resolve, reject) => {
        input.onchange = () => {
          const fileList = input.files ? Array.from(input.files) : [];
          if (fileList.length === 0) {
            reject(new Error("No files selected"));
          } else {
            resolve(fileList);
          }
        };
        input.click();
      });

      const first = filesSelected[0] as any;
      const relativePath: string | undefined = first?.webkitRelativePath;
      const derivedFolderName = relativePath
        ? relativePath.split("/")[0]
        : "Selected Folder";

      if (isFirstFolder) {
        setFolder1(null);
        setFolder1Name(derivedFolderName);
        setFolder1Files(filesSelected);
      } else {
        setFolder2(null);
        setFolder2Name(derivedFolderName);
        setFolder2Files(filesSelected);
      }

      toast.success(`Folder selected: ${derivedFolderName}`);
    } catch (error) {
      console.error("Folder selection error:", error);
      toast.error("Folder could not be selected");
    }
  };

  const loadFilesFromFolder = async (
    folderHandle: any,
    isFirstFolder: boolean
  ) => {
    const files: File[] = [];

    try {
      for await (const entry of folderHandle.values()) {
        if (entry.kind === "file") {
          const file = await entry.getFile();
          files.push(file);
        }
      }

      if (isFirstFolder) {
        setFolder1Files(files);
      } else {
        setFolder2Files(files);
      }
    } catch (error) {
      console.error("Error reading files:", error);
      toast.error("Unable to read files in folder");
    }
  };

  useEffect(() => {
    if (
      selectedFileType === FileType.FSU &&
      selectedFSUSubType &&
      activeTab === FileType.FSU
    ) {
      console.log("FSU subtype selected:", selectedFSUSubType);
      setActiveTab(`fsu-${selectedFSUSubType}`);
    }
  }, [selectedFileType, selectedFSUSubType]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Folder 1</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectFolder(true)}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Select Folder
            </Button>
          </div>
          {folder1Name ? (
            <p className="text-sm text-gray-600">Chosen: {folder1Name}</p>
          ) : (
            <p className="text-sm text-gray-400">No folder selected yet</p>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Folder 2</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectFolder(false)}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Select Folder
            </Button>
          </div>
          {folder2Name ? (
            <p className="text-sm text-gray-600">Chosen: {folder2Name}</p>
          ) : (
            <p className="text-sm text-gray-400">No folder selected yet</p>
          )}
        </div>
      </div>

      <Tabs
        defaultValue={FileType.JOB}
        value={activeTab}
        onValueChange={handleFileTypeChange}
        className="flex flex-col lg:grid lg:grid-cols-5 gap-3"
      >
        <div className="col-span-1">
          <TabsList className="flex flex-col h-fit border-2 gap-0">
            {FILE_TYPE_CONFIGS.filter(
              (config) => config.type !== FileType.FSU
            ).map((fileTypeConfig) => (
              <TabsTrigger
                key={fileTypeConfig.type}
                value={fileTypeConfig.type}
                className="w-full text-sm font-medium mb-1"
              >
                {fileTypeConfig.label}
              </TabsTrigger>
            ))}

            <TabsTrigger
              key={FileType.FSU}
              value={FileType.FSU}
              className={`w-full text-sm font-bold mb-0 ${
                selectedFileType === FileType.FSU
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              FSU
            </TabsTrigger>

            {selectedFileType === FileType.FSU && (
              <div className="border-t-0 border-b border-l border-r border-gray-200 bg-gray-50 overflow-hidden">
                {FSU_SUBTYPE_CONFIGS.map((fsuSubTypeConfig, index) => (
                  <TabsTrigger
                    key={`fsu-${fsuSubTypeConfig.type}`}
                    value={`fsu-${fsuSubTypeConfig.type}`}
                    className={`w-full text-sm pl-6 border-l-4 rounded-none ${
                      activeTab === `fsu-${fsuSubTypeConfig.type}`
                        ? "bg-white text-primary border-primary"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    } ${index !== 0 ? "border-t border-gray-200" : ""}`}
                  >
                    {fsuSubTypeConfig.label}
                  </TabsTrigger>
                ))}
              </div>
            )}
          </TabsList>
        </div>

        <div className="mt-4 lg:mt-0 lg:col-span-4">
          {FILE_TYPE_CONFIGS.filter(
            (config) => config.type !== FileType.FSU
          ).map((fileTypeConfig) => (
            <TabsContent key={fileTypeConfig.type} value={fileTypeConfig.type}>
              <FileComparison
                controllerId={controllerId}
                fileType={fileTypeConfig.type}
                folder1Files={folder1Files}
                folder2Files={folder2Files}
                folder1Name={folder1Name}
                folder2Name={folder2Name}
              />
            </TabsContent>
          ))}

          <TabsContent value={FileType.FSU}>
            {selectedFSUSubType && (
              <FSUComparison
                controllerId={controllerId}
                selectedSubType={selectedFSUSubType}
                folder1Files={folder1Files}
                folder2Files={folder2Files}
                folder1Name={folder1Name}
                folder2Name={folder2Name}
              />
            )}
          </TabsContent>

          {FSU_SUBTYPE_CONFIGS.map((fsuSubTypeConfig) => (
            <TabsContent
              key={`fsu-${fsuSubTypeConfig.type}`}
              value={`fsu-${fsuSubTypeConfig.type}`}
            >
              <FSUComparison
                controllerId={controllerId}
                selectedSubType={fsuSubTypeConfig.type}
                folder1Files={folder1Files}
                folder2Files={folder2Files}
                folder1Name={folder1Name}
                folder2Name={folder2Name}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default Teaching;

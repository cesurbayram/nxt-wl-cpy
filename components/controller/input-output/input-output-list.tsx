import { useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import type { InputOutput } from "@/types/inputOutput.types";
import { ColumnDef } from "@tanstack/react-table";

interface InputOutputListProps {
  inputOutput: InputOutput[];
}

const InputOutputList = ({ inputOutput }: InputOutputListProps) => {
  const [selectedByte, setSelectedByte] = useState<string | null>(
    inputOutput.length > 0 ? inputOutput[0].signalBitNumber.toString() : null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const signalByteNumbers = inputOutput.map((io) => ({
    value: io.signalBitNumber.toString(),
    display: io.displayByte || `${io.signalBitNumber}X`,
  }));

  const filteredBytes = signalByteNumbers.filter((byte) =>
    byte.display.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBits =
    inputOutput.find((io) => io.signalBitNumber.toString() === selectedByte)
      ?.bits || [];

  const columns: ColumnDef<{
    bitNumber: number;
    name: string;
    isActive: boolean;
  }>[] = [
    { accessorKey: "bitNumber", header: "Bit Number" },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "isActive",
      header: "Activity",
      cell: ({ row }) => (
        <span
          className={`inline-block w-4 h-4 rounded-full ${
            row.original.isActive ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      ),
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-3 border-r pr-4">
        <div className="text-sm font-medium mb-2">Signal Byte Number</div>
        <div className="relative">
          <div className="border rounded">
            <input
              type="text"
              className="w-full p-2 border-b focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Search byte number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div
              className="overflow-y-auto"
              style={{
                height: "450px", // Scroll alanı yüksekliği artırıldı
                scrollbarWidth: "thin",
                scrollbarColor: "#CBD5E0 #EDF2F7",
              }}
            >
              {filteredBytes.map((byte) => (
                <div
                  key={byte.value}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedByte === byte.value ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedByte(byte.value)}
                >
                  {byte.display}
                </div>
              ))}
              {filteredBytes.length === 0 && (
                <div className="p-2 text-gray-500 text-center">
                  No results found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-9">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">
            Bits for {selectedByte && `${selectedByte}X`}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 bg-green-500 rounded-full"></span>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 bg-gray-300 rounded-full"></span>
              <span>Inactive</span>
            </div>
          </div>
        </div>

        {selectedBits.length > 0 ? (
          <DataTable columns={columns} data={selectedBits} />
        ) : (
          <p className="text-gray-500">
            No bits available for {selectedByte && `${selectedByte}X`}
          </p>
        )}
      </div>
    </div>
  );
};

export default InputOutputList;

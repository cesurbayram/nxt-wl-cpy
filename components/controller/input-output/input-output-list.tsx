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

  const signalByteNumbers = inputOutput.map((io) =>
    io.signalBitNumber.toString()
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
        <select
          id="byte-select"
          className="w-full border p-2 rounded"
          onChange={(e) => setSelectedByte(e.target.value)}
          value={selectedByte || ""}
        >
          {signalByteNumbers.map((byte) => (
            <option key={byte} value={byte}>
              {byte}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-9">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Bits for {selectedByte}</div>
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
          <p className="text-gray-500">No bits available for {selectedByte}</p>
        )}
      </div>
    </div>
  );
};

export default InputOutputList;

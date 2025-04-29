"use client";

import React, { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getSavedSignals } from "@/utils/service/monitoring/tork-examination";
import { TorkExaminationSignal } from "@/types/tork-examination.types";

interface SignalSelectorProps {
  controllerId: string;
  selectedJobId?: string;
  selectedSignalIds: string[];
  onSelect: (signalIds: string[]) => void;
}

const signalCache = new Map<string, any[]>();

const SignalSelector: React.FC<SignalSelectorProps> = ({
  controllerId,
  selectedJobId,
  selectedSignalIds,
  onSelect,
}) => {
  const [signals, setSignals] = useState<TorkExaminationSignal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCount, setSelectedCount] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Cache'de varsa, oradan al
    if (signalCache.has(controllerId)) {
      setSignals(signalCache.get(controllerId) || []);
      setHasLoadedOnce(true);
    } else {
      if (!hasLoadedOnce) {
        fetchSignals();
      }
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [controllerId]);

  async function fetchSignals() {
    if (signalCache.has(controllerId)) {
      setSignals(signalCache.get(controllerId) || []);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getSavedSignals(controllerId);

      if (!isMountedRef.current) return;

      signalCache.set(controllerId, data);

      setSignals(data);
      setHasLoadedOnce(true);
    } catch (error) {
      if (isMountedRef.current) {
        toast.error("Failed to load signals");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    setSelectedCount(selectedSignalIds.length);
  }, [selectedSignalIds]);

  const handleSignalToggle = (signalId: string, isSelected: boolean) => {
    if (!isSelected) {
      onSelect([...selectedSignalIds, signalId]);
    } else {
      onSelect(selectedSignalIds.filter((id) => id !== signalId));
    }
  };

  const filteredSignals = signals.filter((signal) =>
    signal.signalNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-1">
      <Label className="text-sm">Signals</Label>

      <div className="relative">
        <input
          type="text"
          placeholder="Search signal number..."
          className="w-full p-1.5 text-sm border rounded-md mb-1.5"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="flex justify-between items-center px-2 py-1.5 border-b bg-gray-50">
          <div className="text-xs font-medium">Signal List</div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="text-xs">Inactive</span>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-16">
              <p className="text-sm">Loading signals...</p>
            </div>
          ) : filteredSignals.length === 0 ? (
            <div className="flex justify-center items-center h-16">
              <p className="text-sm">No signals found</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-2 py-1.5 text-left font-medium">
                    Signal Number
                  </th>
                  <th className="px-2 py-1.5 text-center font-medium">State</th>
                </tr>
              </thead>
              <tbody>
                {filteredSignals.map((signal) => {
                  const isSelected = selectedSignalIds.includes(signal.id);
                  return (
                    <tr
                      key={signal.id}
                      className={`border-b hover:bg-gray-50 cursor-pointer ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleSignalToggle(signal.id, isSelected)}
                    >
                      <td className="px-2 py-1.5">{signal.signalNumber}</td>
                      <td className="px-2 py-1.5">
                        <div className="flex justify-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              signal.signalState
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </ScrollArea>
        <div className="p-1.5 text-xs text-gray-500 border-t bg-gray-50">
          {selectedCount} of {signals.length} signal(s) selected
        </div>
      </div>
    </div>
  );
};

export default SignalSelector;

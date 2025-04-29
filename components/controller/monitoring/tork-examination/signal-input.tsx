"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  addSignal,
  deleteSignal,
  getSavedSignals,
  toggleSignalState,
} from "@/utils/service/monitoring/tork-examination";
import { TorkExaminationSignal } from "@/types/tork-examination.types";

interface SignalInputProps {
  controllerId: string;
  onSignalChange: (signals: TorkExaminationSignal[]) => void;
  isRefreshing?: boolean;
}

const convertToSignalNumber = (inputNumber: number): string => {
  const group = Math.floor((inputNumber - 1) / 8);

  const positionInGroup = (inputNumber - 1) % 8;

  const groupStartValue = 10010 + group * 10;

  const signalNumber = groupStartValue + positionInGroup;

  return signalNumber.toString();
};

export const convertToDisplayNumber = (signalNumber: string): number => {
  const num = parseInt(signalNumber, 10);
  const baseValue = 10010;
  const group = Math.floor((num - baseValue) / 10);
  const positionInGroup = (num - baseValue) % 10;

  return group * 8 + positionInGroup + 1;
};

const SignalInput: React.FC<SignalInputProps> = ({
  controllerId,
  onSignalChange,
  isRefreshing = false,
}) => {
  const [signalInput, setSignalInput] = useState("");
  const [signals, setSignals] = useState<TorkExaminationSignal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isRefreshing) {
      fetchSavedSignals(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    fetchSavedSignals(true);
  }, [controllerId]);

  const fetchSavedSignals = async (isInitialLoad: boolean = true) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }

    try {
      const savedSignals = await getSavedSignals(controllerId);

      const formattedSignals = savedSignals.map((signal: any) => {
        const signalState =
          signal.signal_state !== undefined
            ? signal.signal_state === true
            : signal.signalState === true;

        return {
          id: signal.id,
          signalNumber: signal.signal_number || signal.signalNumber || "",
          signalState: signalState,
          controller_id: signal.controller_id || controllerId,
          displayNumber: convertToDisplayNumber(
            signal.signal_number || signal.signalNumber || ""
          ),
        };
      });

      console.log("Loaded signals:", formattedSignals);

      setSignals(formattedSignals);
      onSignalChange(formattedSignals);
    } catch (error) {
      console.error("Error fetching saved signals:", error);
      if (isInitialLoad) {
        toast.error("Failed to load saved signals");
      }
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  const validateSignalAddress = (input: string): boolean => {
    const inputNumber = parseInt(input, 10);
    return !isNaN(inputNumber) && inputNumber >= 1 && inputNumber <= 4096;
  };

  const handleAddSignal = async () => {
    const inputValue = signalInput.trim();

    if (!inputValue) {
      return;
    }

    if (!validateSignalAddress(inputValue)) {
      toast.error(
        "Invalid signal address. Please enter a number between 1 and 4096."
      );
      return;
    }

    const inputNumber = parseInt(inputValue, 10);
    const convertedSignalNumber = convertToSignalNumber(inputNumber);

    if (signals.some((s) => s.signalNumber === convertedSignalNumber)) {
      toast.error("This signal is already added.  Please choose another one.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await addSignal(controllerId, convertedSignalNumber);
      if (success) {
        await fetchSavedSignals();
        setSignalInput("");
        toast.success(`Signal ${inputNumber} added (${convertedSignalNumber})`);
      } else {
        toast.error("An error occurded while adding the signal");
      }
    } catch (error) {
      console.error("Error adding signal:", error);
      toast.error("Failed to add signal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSignal = async (signal: TorkExaminationSignal) => {
    setIsLoading(true);
    try {
      const success = await deleteSignal(controllerId, signal.id);
      if (success) {
        await fetchSavedSignals();
        const displayNumber =
          signal.displayNumber || convertToDisplayNumber(signal.signalNumber);
        toast.success(`Signal ${displayNumber} removed`);
      } else {
        toast.error("An error occured while removing the signal");
      }
    } catch (error) {
      console.error("Error removing signal:", error);
      toast.error("Failed to remove signal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSignal = async (signal: TorkExaminationSignal) => {
    const newState = !signal.signalState;

    try {
      const success = await toggleSignalState(
        controllerId,
        signal.id,
        newState
      );
      if (success) {
        await fetchSavedSignals(false);

        const displayNumber =
          signal.displayNumber || convertToDisplayNumber(signal.signalNumber);
        toast.success(
          `Signal ${displayNumber} ${newState ? "activated" : "deactivated"}`
        );
      } else {
        toast.error("Failed to toggle signal state");
      }
    } catch (error) {
      console.error("Error toggling signal state:", error);
      toast.error("Failed to toggle signal state");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddSignal();
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <Label className="text-sm">Manual Signal Input</Label>
      </div>

      <div className="flex gap-2 mb-2">
        <Input
          value={signalInput}
          onChange={(e) => setSignalInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="signal number (1-4096)"
          className="h-9 text-sm"
          disabled={isLoading}
        />
        <Button
          type="button"
          onClick={handleAddSignal}
          size="sm"
          variant="outline"
          className="h-9"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="px-2 py-1.5 border-b bg-gray-50 flex justify-between items-center">
          <div className="text-xs font-medium">Selected Signals</div>
          <div className="flex items-center gap-1">
            {isRefreshing && (
              <div className="text-xs text-gray-400">Updating...</div>
            )}
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isRefreshing ? "animate-spin text-primary" : "text-gray-500"
              } cursor-pointer hover:text-primary transition-colors`}
              onClick={() => fetchSavedSignals(false)}
              aria-label="Refresh signals"
            />
          </div>
        </div>

        <ScrollArea className="h-[190px]">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-gray-500">
              Loading signals...
            </div>
          ) : signals.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              No signals added yet
            </div>
          ) : (
            <div className="divide-y">
              {signals.map((signal) => (
                <div
                  key={signal.id}
                  className="flex justify-between items-center px-3 py-2 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-2 ${
                        signal.signalState ? "bg-green-500" : "bg-gray-300"
                      } cursor-pointer ${
                        isRefreshing ? "transition-colors duration-300" : ""
                      }`}
                      title={
                        signal.signalState
                          ? "Active (click to deactivate)"
                          : "Inactive (click to activate)"
                      }
                      onClick={() => handleToggleSignal(signal)}
                    ></div>
                    <div className="text-sm font-medium">
                      {signal.displayNumber ||
                        convertToDisplayNumber(signal.signalNumber) ||
                        "No Number"}
                      {!signal.signalNumber && (
                        <span className="text-red-500 ml-1">
                          (Hata: Sinyal numarası boş)
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleRemoveSignal(signal)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-1.5 border-t bg-gray-50">
          <div className="text-xs text-gray-500">
            {signals.length} signal selected
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalInput;

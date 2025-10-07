import fs from "fs";
import path from "path";
import { ParsedLogEntry } from "@/types/system-health-report.types";

/**
 * Parse LOGDATA.DAT file content
 */
export function parseLogContent(content: string, maxEntries: number = 100): ParsedLogEntry[] {
  const entries: ParsedLogEntry[] = [];
  const lines = content.split("\n");

  let currentEntry: Partial<ParsedLogEntry> = {};
  let entryLines: string[] = [];
  let isMultiLineValue = false;
  let multiLineKey = "";
  let multiLineContent: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("///INDEX")) {
      // Save previous entry
      if (currentEntry.index !== undefined) {
        if (isMultiLineValue && multiLineContent.length > 0) {
          currentEntry.fields![multiLineKey] = multiLineContent.join("\n");
        }

        entries.push({
          index: currentEntry.index,
          date: currentEntry.date,
          event: currentEntry.event,
          loginName: currentEntry.loginName,
          fields: currentEntry.fields || {},
          rawData: entryLines.join("\n"),
        });

        if (entries.length >= maxEntries) {
          break;
        }
      }

      // Start new entry
      currentEntry = { fields: {} };
      entryLines = [line];
      isMultiLineValue = false;
      multiLineContent = [];

      const indexMatch = trimmedLine.match(/\/\/\/INDEX\s+(\d+)/);
      if (indexMatch) {
        currentEntry.index = parseInt(indexMatch[1]);
      }
    } else if (trimmedLine.includes(":") && !isMultiLineValue) {
      const colonIndex = trimmedLine.indexOf(":");
      const key = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim();

      if (key === "DATE") {
        currentEntry.date = value;
      } else if (key === "EVENT") {
        currentEntry.event = value;
      } else if (key === "LOGIN NAME") {
        currentEntry.loginName = value;
      } else if (key.startsWith("///")) {
        // Ignore comment lines
      } else {
        currentEntry.fields![key] = value;

        if (value.endsWith("...") || value === "") {
          isMultiLineValue = true;
          multiLineKey = key;
          multiLineContent = value ? [value] : [];
        }
      }

      entryLines.push(line);
    } else if (isMultiLineValue && trimmedLine) {
      multiLineContent.push(trimmedLine);
      entryLines.push(line);
    } else {
      entryLines.push(line);
    }
  }

  // Add last entry
  if (currentEntry.index !== undefined) {
    if (isMultiLineValue && multiLineContent.length > 0) {
      currentEntry.fields![multiLineKey] = multiLineContent.join("\n");
    }

    entries.push({
      index: currentEntry.index,
      date: currentEntry.date,
      event: currentEntry.event,
      loginName: currentEntry.loginName,
      fields: currentEntry.fields || {},
      rawData: entryLines.join("\n"),
    });
  }

  return entries;
}

/**
 * Read LOGDATA.DAT file for a specific controller
 */
export async function readLogDataFile(ipAddress: string): Promise<ParsedLogEntry[]> {
  try {
    const fileName = "LOGDATA.DAT";
    const folderName = `${ipAddress}_LOGDATA`;
    
    // Check platform and use appropriate path
    const isWindows = process.platform === 'win32';
    const filePath = isWindows 
      ? path.join("C:", "Watchlog", "UI", folderName, fileName)
      : path.join(process.env.HOME || "/tmp", "Watchlog", "UI", folderName, fileName);

    if (!fs.existsSync(filePath)) {
      return [];
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    return parseLogContent(fileContent, 100);
  } catch (error) {
    console.error(`Error reading log file for ${ipAddress}:`, error);
    return [];
  }
}

/**
 * Analyze log entries
 */
export function analyzeLogEntries(entries: ParsedLogEntry[]) {
  const eventCounts: Record<string, number> = {};
  const criticalEvents: ParsedLogEntry[] = [];

  for (const entry of entries) {
    // Count events
    if (entry.event) {
      eventCounts[entry.event] = (eventCounts[entry.event] || 0) + 1;

      // Identify critical events
      const eventLower = entry.event.toLowerCase();
      if (
        eventLower.includes("error") ||
        eventLower.includes("alarm") ||
        eventLower.includes("emergency") ||
        eventLower.includes("stop") ||
        eventLower.includes("fault")
      ) {
        criticalEvents.push(entry);
      }
    }
  }

  // Sort by count
  const topEvents = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([eventType, count]) => ({
      eventType,
      count,
      percentage: (count / entries.length) * 100,
    }));

  return {
    totalEntries: entries.length,
    eventCounts,
    topEvents,
    criticalEvents: criticalEvents.slice(0, 20),
  };
}


/**
 * Parse system.sys file content to extract robot information
 */

export interface ParsedSystemInfo {
  systemNo?: string;
  version?: string;
  paramNo?: string;
  application?: string;
  language?: string;
  robotModel?: string;
  robotName?: string;
}

/**
 * Parses SYSTEM.SYS file content and extracts key information
 * @param content - The raw content of SYSTEM.SYS file
 * @returns Parsed system information
 */
export const parseSystemFile = (content: string): ParsedSystemInfo => {
  const lines = content.split('\n');
  const result: ParsedSystemInfo = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Parse SYSTEM NO (e.g., "//SYSTEM NO : DS4.42.00A(JP/US)-14")
    if (trimmedLine.startsWith('//SYSTEM NO')) {
      const match = trimmedLine.match(/:\s*(.+)/);
      if (match) {
        result.systemNo = match[1].trim();
        result.version = match[1].trim(); // Use systemNo as version
      }
    }

    // Parse PARAM NO (e.g., "//PARAM  NO : 4.34")
    if (trimmedLine.startsWith('//PARAM')) {
      const match = trimmedLine.match(/:\s*(.+)/);
      if (match) {
        result.paramNo = match[1].trim();
      }
    }

    // Parse APPLI (e.g., "//APPLI     : ARC WELDING")
    if (trimmedLine.startsWith('//APPLI')) {
      const match = trimmedLine.match(/:\s*(.+)/);
      if (match) {
        result.application = match[1].trim();
      }
    }

    // Parse LANGUAGE (e.g., "//LANGUAGE  :  4.42-14-00, 4.42-14-00")
    if (trimmedLine.startsWith('//LANGUAGE')) {
      const match = trimmedLine.match(/:\s*(.+)/);
      if (match) {
        result.language = match[1].trim();
      }
    }

    // Parse ROBOT NAME section (e.g., "MA01400-B0*  0011_1111")
    if (trimmedLine.startsWith('//ROBOT NAME')) {
      // Get the next line after //ROBOT NAME
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1].trim();
        // Check if next line is not a comment and not empty
        if (nextLine && !nextLine.startsWith('//')) {
          // Extract robot model (first part before spaces)
          const robotMatch = nextLine.match(/^([A-Z0-9\-\*]+)/);
          if (robotMatch) {
            result.robotModel = robotMatch[1];
            result.robotName = nextLine; // Keep full line
          }
        }
      }
    }
  }

  return result;
};

/**
 * Format robot model for display
 * @param robotModel - Raw robot model string (e.g., "MA01400-B0*")
 * @returns Formatted model string (e.g., "MA1440/MH12-A0*(MA1440)")
 */
export const formatRobotModel = (robotModel?: string): string => {
  if (!robotModel) return 'Unknown';
  
  // Extract base model number (e.g., MA01400 -> MA1440)
  const modelMatch = robotModel.match(/([A-Z]+)0*(\d+)/);
  if (modelMatch) {
    const prefix = modelMatch[1];
    const number = modelMatch[2];
    const suffix = robotModel.replace(/[A-Z]+\d+/, '');
    return `${prefix}${number}${suffix}`;
  }
  
  return robotModel;
};

/**
 * Get application display name
 * @param application - Raw application string
 * @returns Formatted application name
 */
export const formatApplication = (application?: string): string => {
  if (!application) return 'Unknown';
  
  const appMap: { [key: string]: string } = {
    'ARC WELDING': 'ARC',
    'HANDLING': 'HANDLING',
    'SPOT WELDING': 'SPOT',
    'GENERAL': 'GENERAL',
    'PAINT': 'PAINT',
  };
  
  return appMap[application.toUpperCase()] || application;
};


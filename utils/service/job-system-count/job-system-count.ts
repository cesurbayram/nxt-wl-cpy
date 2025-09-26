import { JobSystemCountConfig, SystemCountValue, GeneralVariableType } from "@/types/job-system-count.types";

export const sendGeneralVariableCommand = async (
  controllerId: string,
  generalNo: string,
  variableType: GeneralVariableType
): Promise<boolean> => {
  const typeMap = {
    byte: "GeneralByte",
    int: "GeneralInt",
    double: "GeneralDouble",
    real: "GeneralReal",
    string: "GeneralString"
  };

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/general-variable-socket`,
    {
      method: "POST",
      body: JSON.stringify({
        type: typeMap[variableType],
        data: {
          controllerId,
          GeneralNo: generalNo,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    const errorData = await apiRes.json();
    throw new Error(
      `An error occurred when sending general ${variableType} command: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

export const sendGeneralVariableExitCommand = async (
  controllerId: string,
  generalNo: string,
  variableType: GeneralVariableType
): Promise<boolean> => {
  const typeMap = {
    byte: "GeneralByteExit",
    int: "GeneralIntExit",
    double: "GeneralDoubleExit",
    real: "GeneralRealExit",
    string: "GeneralStringExit"
  };

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/general-variable-exit-socket`,
    {
      method: "POST",
      body: JSON.stringify({
        type: typeMap[variableType],
        data: {
          controllerId,
          GeneralNo: generalNo,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    const errorData = await apiRes.json();
    throw new Error(
      `An error occurred when sending general ${variableType} exit command: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

// Job System Count Service
export class JobSystemCountService {
  // Config oluştur veya güncelle
  static async saveConfig(config: Omit<JobSystemCountConfig, 'id'>): Promise<JobSystemCountConfig> {
    const response = await fetch('/api/job-system-count/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error('Failed to save config');
    }

    return response.json();
  }

  // Job için config al
  static async getConfig(jobId: string, controllerId: string): Promise<JobSystemCountConfig | null> {
    const response = await fetch(`/api/job-system-count/config?jobId=${jobId}&controllerId=${controllerId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get config');
    }

    const configs = await response.json();
    return configs[0] || null;
  }

  // System Count okumayı başlat
  static async startReading(
    jobId: string, 
    controllerId: string, 
    generalNo: string, 
    variableType: GeneralVariableType
  ): Promise<boolean> {
    try {
      // 1. Config kaydet
      await this.saveConfig({
        jobId,
        controllerId,
        generalNo,
        variableType,
        isActive: true
      });

      // 2. GeneralVariable command gönder
      await sendGeneralVariableCommand(controllerId, generalNo, variableType);

      console.log(`System count reading started: Job ${jobId}, Controller ${controllerId}, General ${generalNo}`);
      return true;
    } catch (error) {
      console.error('Error starting system count reading:', error);
      return false;
    }
  }

  // System Count okumayı durdur
  static async stopReading(jobId: string, controllerId: string): Promise<boolean> {
    try {
      // Config'i al
      const config = await this.getConfig(jobId, controllerId);
      if (!config) {
        return true; // Zaten config yok
      }

      // GeneralVariable exit command gönder
      await sendGeneralVariableExitCommand(
        controllerId,
        config.generalNo,
        config.variableType
      );

      // Config'i deaktif et
      await fetch('/api/job-system-count/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: config.id,
          isActive: false
        })
      });

      console.log(`System count reading stopped: Job ${jobId}, Controller ${controllerId}`);
      return true;
    } catch (error) {
      console.error('Error stopping system count reading:', error);
      return false;
    }
  }

  // En son system count değerini al (API üzerinden)
  static async getLatestSystemCount(jobId: string, controllerId: string): Promise<number> {
    try {
      const response = await fetch(`/api/job-system-count/value?jobId=${jobId}&controllerId=${controllerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get system count value');
      }

      const data = await response.json();
      return data.value || 0;
    } catch (error) {
      console.error('Error getting latest system count:', error);
      return 0;
    }
  }

  // Bulk system count değerlerini al (production comparison için)
  static async getBulkSystemCounts(
    controllerId: string, 
    jobIds: string[]
  ): Promise<Record<string, number>> {
    try {
      const response = await fetch('/api/job-system-count/bulk-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ controllerId, jobIds })
      });

      if (!response.ok) {
        throw new Error('Failed to get bulk system counts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting bulk system counts:', error);
      return {};
    }
  }
}

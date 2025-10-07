export interface ProductionValue {
  id?: string;
  controllerId: string;
  shiftId: string;
  jobId: string;
  producedProductCount: number;
  generalNo?: string; // Hangi GeneralDouble değişkeninden system count çekilecek
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  controllerName?: string;
  shiftName?: string;
  jobName?: string;
}

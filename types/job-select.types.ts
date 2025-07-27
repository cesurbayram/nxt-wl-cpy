export interface JobSelect {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}
export interface JobSelectData extends JobSelect {
  assigned_to_shift?: boolean;
  controller_id?: string;
  shift_id?: string;
}

export interface JobSelectFilter {
  controllerId: string;
  shiftId?: string;
}

export interface JobSelectResponse {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  assigned_to_shift?: boolean;
}

export interface ProductionVolumeJob extends JobSelect {
  productCount?: number;
  status?: string;
}

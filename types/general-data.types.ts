export interface GeneralRegister {
  id: string;
  controller_id: string;
  general_no: string;
  value: string;
}

export interface GeneralSignal {
  id: string;
  controller_id: string;
  general_no: string;
  value: boolean;
}

export interface GeneralVariable {
  id: string;
  controller_id: string;
  general_no: string;
  value: string | number;
  variable_type: 'byte' | 'int' | 'double' | 'real' | 'string';
}

export type GeneralDataType = 'register' | 'signal' | 'variable';
export type GeneralVariableType = 'byte' | 'int' | 'double' | 'real' | 'string';

export interface GeneralDataRequest {
  type: string;
  data: {
    controllerId: string;
    GeneralNo: string;
  };
}

export interface GeneralDataResponse {
  type: string;
  data: {
    type: string;
    ip_address: string;
    values: {
      No: string;
      Value: string | boolean;
    };
  };
}

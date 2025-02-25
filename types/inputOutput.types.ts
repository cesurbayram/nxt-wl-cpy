export interface InputOutput {
  signalBitNumber: string;
  displayByte?: string;
  name: string;
  bits: {
    bitNumber: number;
    name: string;
    isActive: boolean;
  }[];
}

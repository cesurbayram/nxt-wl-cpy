export interface InputOutput {
  signalBitNumber: string; // Byte numarası
  name: string; // Byte açıklaması
  bits: {
    // Bit bilgileri
    bitNumber: number; // Bit numarası
    name: string; // Bit adı
    isActive: boolean; // Bit durumu
  }[];
}

export interface Alarm {
  code: string;
  name?: string;
  mode?: string;
  type?: string;
  alarm?: string;
  detected?: string;
  removed?: string;
  text?: string;
  originDate?: string;
  priority?: number;
  is_active?: boolean;
}

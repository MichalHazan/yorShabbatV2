// app/utils/types.ts

export interface ShabbatTime {
  date: string;
  candle_lighting: string;
  havdalah: string;
  torah_en: string;
  torah_hw: string;
}

export interface Event  {
  title: string;
  time: Date ;
  sound: any;
};

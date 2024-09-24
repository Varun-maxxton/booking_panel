export interface Stay {
    roomId: number;
    stayDateFrom: string;
    stayDateTo: string;
    arrivalDays: string[];
    departureDays: string[];
    minStay: number;
    maxStay: number;
    bookDateFrom:string[];
    bookDateTo:string[];
    minDeviation:number;
    maxDeviation:number;
  }
  
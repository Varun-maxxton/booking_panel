import { Stay } from "./stay.interface";
export interface Room{
    roomId:number;
    locationId:number;
    locationName: string;
    roomName:string;
    pricePerDayPerPerson:number;
    guestCapacity:number;
    stays:Stay[],
    availability:string[];
    reviewScore?: number;
    reviewStars?: number;
    isBestRoom?: boolean;
    imageUrl?: string;
    numberOfNights:number;
    totalPrice:number;
}
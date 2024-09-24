import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Room } from './room.interface';
import { Stay } from './stay.interface';
@Injectable({
  providedIn: 'root'
})
export class DetailsService {
  private roomsapiUrl = 'https://jadhavsudhit.github.io/Booking-module/rooms.json';
  private staysapiUrl = 'https://jadhavsudhit.github.io/Booking-module/stays.json';

  constructor(private http:HttpClient) {}

  getRooms(): Observable<Room[]>{
    return this.http.get<Room[]>(this.roomsapiUrl);
  }
  getStays(): Observable<Stay[]>{
    return this.http.get<Stay[]>(this.staysapiUrl);
  }
  getCombinedData(): Observable<Room[]> {
    return forkJoin({
      rooms: this.getRooms(),
      stays: this.getStays()
    }).pipe(
      map(({ rooms, stays }) => this.combineData(rooms, stays))
    );
  }

  private combineData(rooms: Room[], stays: Stay[]): Room[] {
    const roomMap = new Map<number, Room>();
    rooms.forEach(room => {
      roomMap.set(room.roomId, { ...room, stays: [], availability: [] });
    });
    stays.forEach(stay => {
      const room1 = roomMap.get(stay.roomId);
      if (room1) {
        room1.stays.push(stay);
        const availabilityDetail = `From: ${stay.stayDateFrom}, To: ${stay.stayDateTo}`;
        if (!room1.availability.some(detail => detail === availabilityDetail)) {
          room1.availability.push(availabilityDetail);
        }
      }
    });
    return Array.from(roomMap.values());
  }

}

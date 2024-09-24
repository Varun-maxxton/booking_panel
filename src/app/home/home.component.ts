import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Room } from '../room.interface';
import { Stay } from '../stay.interface';
import { DetailsService } from '../details.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookingDetailsComponent } from '../booking-details/booking-details.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit{
  searchForm !: FormGroup;
  rooms: Room[] = [];
  stays:Stay[]=[];;
  uniqueLocations: string[]=[];
  filteredRooms: Room[] = []; 
  totalRoomData: Room[] = [];
  minPrice: number = 0;
  maxPrice: number = 4000;
  selectedPrice: number = 4000;
  selectedRoom!:Room;
  currentdate=new Date().toISOString().split('T')[0];
  imageList:string[]=[
    './assets/images/rooms/res1.jpg',
    './assets/images/rooms/res2.jpg',
    './assets/images/rooms/res3.jpg',
    './assets/images/rooms/res4.jpg',
    './assets/images/rooms/res5.jpg',
  ]
  
  
  
  onPriceChange(event: any): void {
    this.selectedPrice = event.target.value;
  }

  constructor(private fb:FormBuilder,private detailsservice: DetailsService,private router:Router,  private modalService: NgbModal ) {
    this.searchForm=this.fb.group({
      location:[''],
      stayDateFrom:[''],
      stayDateTo:[''],
      guests:[''],
      roomFilter: [false],
      monthFilter: [false],
      swimmingPoolFilter: [false],
      numberOfDays:[''],
    });
  }
  ngOnInit():void{
    // this.roomimages();
    this.detailsservice.getCombinedData().subscribe(room1 => {
      this.filteredRooms = room1;
      this.totalRoomData = room1;
      console.log('Merged data in Home:', room1);
      this.extractlocation(this.filteredRooms);
      this.applyfilters();
    });
    
  }

  status: boolean = true;
  hideBtn(): void{
    this.status = !this.status; 
  }


  onPricechange(event:any):void{
    this.selectedPrice=event.target.value;
    this.applyfilters();
  }
  extractlocation(rooms:Room[]):void{
    this.uniqueLocations=[...new Set(this.filteredRooms.map(room=>room.locationName))];
    console.log("unique",this.uniqueLocations);
    
  }
  

  applyfilters():void {
    this.filteredRooms = this.totalRoomData;
    const selectedLocation = this.searchForm.get('location')?.value;
    console.log('sele',selectedLocation);
    const selectedGuests=this.searchForm.get('guests')?.value;
    const arrivaldate = this.searchForm.get('stayDateFrom')?.value ? new Date(this.searchForm.get('stayDateFrom')?.value) : null;
    const departuredate = this.searchForm.get('stayDateTo')?.value ? new Date(this.searchForm.get('stayDateTo')?.value) : null;
    const numberOfDays = this.searchForm.get('numberOfDays')?.value;

    let roomsToFilter = [...this.filteredRooms];
    console.log('Initial rooms:', roomsToFilter);
    if (selectedLocation) {
      roomsToFilter = roomsToFilter.filter(room => room.locationName === selectedLocation);
    }
    console.log('After location filter:', roomsToFilter);
  
    if (selectedGuests) {
      roomsToFilter = roomsToFilter.filter(room => room.guestCapacity >= selectedGuests);
    }
    console.log('After guest filter:', roomsToFilter);
    
    roomsToFilter = roomsToFilter.filter(room => room.pricePerDayPerPerson <= this.selectedPrice);
    console.log('After price filter:', roomsToFilter);
  
    if(numberOfDays){
      roomsToFilter=roomsToFilter.filter(room=>{
        return room.stays.every(stay=>{
          const stayduration=(numberOfDays>=stay.minStay && numberOfDays<=stay.maxStay);
          return stayduration;
        })
      })
    }
    if(arrivaldate && departuredate){

      roomsToFilter = roomsToFilter.filter(room => {
        return room.stays.some(stay => {
          const stayFrom = new Date(stay.stayDateFrom);
          const stayTo = new Date(stay.stayDateTo);
          console.log("stayfrom",stayFrom);
          console.log("stato",stayTo);
          console.log("asrrivadate",arrivaldate);
          console.log("departure",departuredate);
          
          const isDateOverlap = stayTo >= arrivaldate &&  stayFrom <= departuredate;
          console.log("overlpa",isDateOverlap);
          return isDateOverlap ;
        });
      });
    }
    
    console.log('After stay filter:', roomsToFilter);
    if(arrivaldate && departuredate){

      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const occupyroomid:Set<number>=new Set();
      for(let i=0;i<bookings.length;i++){
        const bookfrom=new Date(bookings[i].summary.stayDateFro);
        const bookto=new Date(bookings[i].summary.stayDateTo);
        const roomID=bookings[i].summary.roomId;
        console.log("bookfrom",bookfrom);
        console.log("bookto",bookto);
        console.log("roomidsdf",roomID);
        const isoverlap=(arrivaldate&& departuredate) ? (arrivaldate<=bookto && departuredate>=bookfrom ) : true;
        if(isoverlap){
          occupyroomid.add(roomID);
        }
      }
      roomsToFilter=roomsToFilter.filter(room=>!occupyroomid.has(room.roomId));
    }
    
   
    
    this.filteredRooms = roomsToFilter;
    if (  this.filteredRooms.length === 0 &&!selectedLocation && !selectedGuests && !arrivaldate && !departuredate  && this.selectedPrice === this.maxPrice && !numberOfDays) {
      this.filteredRooms = [...this.rooms];
    }
    this.filteredRooms.sort((a, b) => a.pricePerDayPerPerson - b.pricePerDayPerPerson);
    console.log('Filtered rooms:', this.filteredRooms);
  }

  onSearch():void{
    this.applyfilters();
  }

  openBookingmodal(room:Room):void{
    this.selectedRoom=room;
    console.log("selectedroom",this.selectedRoom);
    
    const modalRef = this.modalService.open(BookingDetailsComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.selectedRoom = room;
    modalRef.componentInstance.stayDateFrom=this.searchForm.get('stayDateFrom')?.value;
    modalRef.componentInstance.stayDateTo=this.searchForm.get('stayDateTo')?.value;
  }
  goToTableView(): void {
    this.router.navigate(['/reception']);  
  }
  openPlanningChart(): void {
    this.router.navigate(['/planning-chart']);
  }
}




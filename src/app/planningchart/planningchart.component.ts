import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DetailsService } from '../details.service';
import { Room } from '../room.interface';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookingDetailsComponent } from '../booking-details/booking-details.component';
import { formatDate } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { StatusBookingComponent } from '../status-booking/status-booking.component';
import { FormBuilder, FormGroup } from '@angular/forms';


declare var bootstrap: any;
@Component({
  selector: 'app-planningchart',
  templateUrl: './planningchart.component.html',
  styleUrl: './planningchart.component.css',
})
export class PlanningchartComponent implements OnInit {
  searchForm !: FormGroup;
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  currentMonth: Date;
  daysInMonth: Date[] = [];
  dayNames: string[] = [];
  isMouseDown = false;
  selectedCells: Set<string> = new Set();
  rooms: Room[] = [];
  bookings: {
    bookingDetails: { fullName: string };
    summary: { roomId: number; stayDateFro: string; stayDateTo: string };
    status: string;
  }[] = [];
  // alreadyBookedCells: Set<string> = new Set();
  alreadyBookedCells: Map<string, any> = new Map();
  selectionStart: { roomId: number; date: Date } | null = null;
  currentRow: number | null = null;
  disabledCells: Set<string> = new Set();
  arrivalDays: Set<string> = new Set();
  departureDays: Set<string> = new Set();
  arrivalDate!: Date | null;
  departureDate!: Date | null;
  clickCount: { [key: string]: number } = {};
  clickTimer: { [key: string]: any } = {};
  selectedLocation: string = '';
  locations: string[] = []; 
  filteredRooms: Room[] = [];
  uniqueLocations: string[]=[];
  totalRoomData: Room[] = [];
  filteredRoomNames: Room[] = [];

  constructor(
    private router: Router,
    private detailsService: DetailsService,
    private modalService: NgbModal,
    private snackBar: MatSnackBar,private fb:FormBuilder
  ) {
    this.currentMonth = new Date();
    this.searchForm = this.fb.group({
      location: [''],
      roomName: [''],
      status: ['']
    });
  }

  ngOnInit() {
    this.updateDaysInMonth();
    this.loadBookingsFromLocalStorage();
    this.loadRoomDetails();
    this.highlightAlreadyBookedDates();
    this.prevMonth();
    this.nextMonth();
    this.currentMonth;
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });

    
   this.extractlocation(this.filteredRooms);
  }
 
  

  loadRoomDetails() {
    this.detailsService.getCombinedData().subscribe(
      (data: Room[]) => {
        this.filteredRooms = data;
        this.totalRoomData=data;
        this.extractlocation(this.filteredRooms);
        this.updateDisabledCells();
        this.updateRoomNames();
        this.highlightBookedDates();
        this.filterRooms();
        console.log('rooms', this.filteredRooms);
      },
      (error) => {
        console.error('Error fetching room details:', error);
      }
    );
  }
  extractlocation(rooms:Room[]):void{
    this.uniqueLocations=[...new Set(this.filteredRooms.map(room=>room.locationName))];
    // console.log("unique",this.uniqueLocations);
    
  }
  updateRoomNames() {
    const selectedLocation = this.searchForm.get('location')?.value;

    if (selectedLocation) {
      // Filter rooms based on selected location
      this.filteredRoomNames = this.totalRoomData.filter(room => room.locationName === selectedLocation);
    } else {
      // If no location is selected, show all rooms
      this.filteredRoomNames = [...this.totalRoomData];
    }
  }
  onLocationChange() {
    this.updateRoomNames();
    this.searchForm.get('roomName')?.reset(); // Reset room name when location changes
  }

  filterRooms() {
    this.filteredRooms = this.totalRoomData;
    const selectedLocation = this.searchForm.get('location')?.value;
    const selectedRoomName = this.searchForm.get('roomName')?.value;
    const selectedStatus = this.searchForm.get('status')?.value;

    let roomsToFilter = [...this.filteredRooms];
    // console.log('Initial rooms:', roomsToFilter);
    if (selectedLocation) {
      roomsToFilter = roomsToFilter.filter(room => room.locationName === selectedLocation);
    }
    // console.log('After location filter:', roomsToFilter);
    if (selectedRoomName) {
      roomsToFilter = roomsToFilter.filter(room => room.roomName === selectedRoomName);
    }

    if (selectedStatus) {
      roomsToFilter = roomsToFilter.filter(room => {
        return this.bookings.some(booking => 
          booking.summary.roomId === room.roomId && 
          booking.status === selectedStatus
        );
      });
    }


    this.filteredRooms = roomsToFilter;
    if (  this.filteredRooms.length === 0 &&!selectedLocation && !selectedStatus && !selectedRoomName) {
      this.filteredRooms = [...this.rooms];
    }
  }
  onSearch():void{
    this.filterRooms();
  }

  formatDate(day: Date): string {
    return moment(day).format('DD-MM-YYYY');
  }
  updateDisabledCells() {
    this.disabledCells.clear();
    this.rooms.forEach((room) => {
      const arrivaldays = room.stays.flatMap((stay) => stay?.arrivalDays || []);
      const departuredays = room.stays.flatMap((stay) => stay?.departureDays || []);
     
      const stayDatesFrom = room.stays
      .map((stay) => stay?.stayDateFrom ? new Date(stay.stayDateFrom) : null)
      .filter((date) => date !== null);

      const stayDatesTo = room.stays
      .map((stay) => stay?.stayDateTo ? new Date(stay.stayDateTo) : null)
      .filter((date) => date !== null);

      stayDatesFrom.forEach((staydatefrom, index) => {
        const staydateto = stayDatesTo[index];

        if (isNaN(staydatefrom.getTime()) || isNaN(staydateto.getTime())) {
          console.error(
            `Invalid stay dates for room ${room.roomId}: From ${room.stays[0]?.stayDateFrom}, To ${room.stays[0]?.stayDateTo}`
          );
          return;
        }

        this.daysInMonth.forEach((day) => {
          const dayOnly = new Date(
            day.getFullYear(),
            day.getMonth(),
            day.getDate()
          );
          if (dayOnly < staydatefrom) {
            const cellKey = `${room.roomId}-${moment(day).format('DD-MM-YYYY')}`;
            this.disabledCells.add(cellKey);
            this.selectedCells.delete(cellKey);
          } else if (dayOnly >= staydatefrom && dayOnly <= staydateto) {
            const dayname = this.getDayName(day);
            const cellKey = `${room.roomId}-${moment(day).format('DD-MM-YYYY')}`;
            if (
              arrivaldays.includes(dayname) ||
              departuredays.includes(dayname)
            ) {
              // this.disabledCells.delete(cellKey);
            } else {
              this.disabledCells.add(cellKey);
              this.selectedCells.delete(cellKey);
            }
          }
        });
      });
    });
  }

  getDayName(date: Date): string {
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return daysOfWeek[date.getDay()];
  }

  isCellDisabled(roomId: number, day: Date): boolean {
    const cellKey = `${roomId}-${moment(day).format('DD-MM-YYYY')}`;
    return this.disabledCells.has(cellKey);
  }

  navigateToCustomer() {
    this.router.navigate(['/home']);
  }
  goToTableView(): void {
    this.router.navigate(['/reception']);
  }

  updateDaysInMonth() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    // console.log('numdays', numDays);

    this.daysInMonth = Array.from(
      { length: numDays },
      (_, i) => new Date(year, month, i + 1)
    );
    // console.log('daysinmont', this.daysInMonth);
  }

  prevMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      this.currentMonth.getDay()
    );
    // console.log('prev', this.currentMonth);

    this.updateDaysInMonth();
    this.highlightBookedDates();
    this.highlightAlreadyBookedDates();
    this.updateDisabledCells();
  }

  nextMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      this.currentMonth.getDay()
    );
    // console.log('nextmonth', this.currentMonth);
    this.updateDaysInMonth();
    this.highlightBookedDates();
    this.highlightAlreadyBookedDates();
    this.updateDisabledCells();
  }

  onMouseDown(roomId: number, day: Date, event: MouseEvent) {
   
    
    event.preventDefault();
    
    const room = this.filteredRooms.find((room) => room.roomId === roomId);
    const cellKey = `${roomId}-${moment(day).format('DD-MM-YYYY')}`;
    
    if (!room || this.alreadyBookedCells.has(cellKey) || this.disabledCells.has(cellKey)) {
      this.isMouseDown = false;
      this.selectedCells.clear();
      return;
    }
  
    const currentDate = moment(new Date());
    
// console.log("coming here");
    const bookDates = room.stays.map(stay => ({
      bookDateFrom: moment(stay.bookDateFrom, 'YYYY-MM-DD'),
      bookDateTo: moment(stay.bookDateTo, 'YYYY-MM-DD'),
      minDeviation: stay.minDeviation || 0,
      maxDeviation: stay.maxDeviation || Infinity,
    }));
  
    const minBookDateFrom = moment.min(bookDates.map(date => date.bookDateFrom));
    const maxBookDateTo = moment.max(bookDates.map(date => date.bookDateTo));
    const minDeviation = Math.min(...bookDates.map(date => date.minDeviation));
    const maxDeviation = Math.max(...bookDates.map(date => date.maxDeviation));
    const deviationDays = Math.ceil((moment(day).toDate().getTime() - currentDate.toDate().getTime()) / (1000 * 3600 * 24));
    // console.log("bookfrom of planning",minBookDateFrom);
    // console.log("bookto of planning",maxBookDateTo);
    // console.log("min of planning",minDeviation);
    // console.log("max of planning",maxDeviation);
    
    if (minBookDateFrom && currentDate < minBookDateFrom) {
      this.snackBar.open(
        `You can Book on or after ${moment(minBookDateFrom).format('DD-MMM-YYYY')} Date.`,
        'X',
        { duration: 5000, verticalPosition: 'top' }
      );
      // console.log('coming tto  forst date');
      this.isMouseDown = false;
      this.selectedCells.clear();
      return;
    }
  
    if (maxBookDateTo && currentDate > maxBookDateTo) {
      this.snackBar.open(
        `You should have book before ${moment(maxBookDateTo).format('DD-MMM-YYYY')} Date.`,
        'X',
        { duration: 5000, verticalPosition: 'top' }
      );
      console.log('coming tto date');
      this.isMouseDown = false;
      this.selectedCells.clear();
      return;
    }
  
    
    if (deviationDays < minDeviation) {
      this.snackBar.open(
        `Minimum deviation of ${minDeviation} days required. You selected ${deviationDays} days.`,
        'X',
        { duration: 5000, verticalPosition: 'top' }
      );
      // console.log('coming to mindeviation');
      this.isMouseDown = false;
      this.selectedCells.clear();
      return;
    }
    if (deviationDays > maxDeviation) {
      this.snackBar.open(
        `Maximum deviation of ${maxDeviation} days exceeded. You selected ${deviationDays} days.`,
        'X',
        { duration: 5000, verticalPosition: 'top' }
      );
      // console.log('coming to maxdeviation');
      this.isMouseDown = false;
      this.selectedCells.clear();
      return;
    }
    const isDeparture = this.alreadyBookedCells.has(`${roomId}-${moment(day).format('DD-MM-YYYY')}-end`);
    const isArrival = this.alreadyBookedCells.has(`${roomId}-${moment(day).format('DD-MM-YYYY')}-start`);
    if (!isDeparture && !this.isarrival(day, roomId)) {
      // console.log('coming or not coming');

      this.snackBar.open(
        'Please start your selection on a valid arrival day.',
        'X',
        {
          duration: 10000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['custom-snackbar'],
        }
      );
      // console.log('coming or not coming');
      this.isMouseDown = false;
      this.selectedCells.clear();
      return;
    }
  
    this.isMouseDown = true;
    this.arrivalDate = day;
    this.selectionStart = { roomId, date: new Date(day) };
    this.toggleSelection(roomId, day);
    // console.log("end of mousedown");
    
  }

  onMouseOver(roomId: number, day: Date, event: MouseEvent) {
    const cellKey = `${roomId}-${moment(day).format('DD-MM-YYYY')}`;
    if (this.alreadyBookedCells.has(cellKey) ) {
      return;
    }
    if (this.isMouseDown && this.selectionStart) {
      const { roomId: startRoomId, date: startDate } = this.selectionStart;
      
      if (roomId === startRoomId && day >= startDate) {
        this.toggleSelection(roomId, day);
      }
      
    }
  }

  onMouseUp(roomId: number, day: Date, event: MouseEvent) {
    // console.log("comin gto moiseup");
    
    const room = this.filteredRooms.find((room) => room.roomId === roomId);
    const cellKey = `${roomId}-${moment(day).format('DD-MM-YYYY')}`;
    if (!room ||
      this.alreadyBookedCells.has(cellKey) ||
      this.disabledCells.has(cellKey)
    ) {
      this.isMouseDown = false;
      this.selectedCells.clear();
      return;
    }
   
    const currentDate = moment(new Date());
    const maxDeviation = Math.max(...room.stays.map(stay => stay.maxDeviation || Infinity));
    const deviationDays = Math.ceil((moment(day).toDate().getTime() - currentDate.toDate().getTime()) / (1000 * 3600 * 24));
    // console.log("deviation of planiing departure",deviationDays);
    if (deviationDays > maxDeviation) {
      this.snackBar.open(
        `Departure Date (${day.toLocaleString()}) and Today's Date (${currentDate.toLocaleString()}) should not be more than ${maxDeviation} days. You seelected ${deviationDays} days. `,
        'X',
        { duration: 10000, verticalPosition: 'top' }
      );
      // console.log('coming to maxdeviation');
      this.isMouseDown = false;
      this.selectedCells.clear();
      return;
    }

    if (!this.isdeparture(day, roomId)  && !this.isarrival(day, roomId)) {
      this.snackBar.open(
        'Please end your selection on a valid departure day.',
        'X',
        { duration: 3000, verticalPosition: 'top' }
      );
      this.isMouseDown = false;
      this.selectionStart = null;
      this.selectedCells.clear();

      return;
    }
    this.isMouseDown = false;

    this.departureDate = day;

    if (this.arrivalDate && this.departureDate && room) {
      const duration =
        Math.ceil(
          (this.departureDate.getTime() - this.arrivalDate.getTime()) /
            (1000 * 3600 * 24)
        ) + 1;
      const nights = duration - 1;
      // const maxstay=room.stays[0].maxStay;
      // const minstay=room.stays[0].minStay;
      const maxstay = Math.max(...room.stays.map(stay => stay.maxStay || -Infinity));
    const minstay = Math.min(...room.stays.map(stay => stay.minStay || Infinity));

      const overlappingDates: string[] = [];
      this.daysInMonth.forEach((dayInMonth) => {
        if (
          dayInMonth >= this.arrivalDate! &&
          dayInMonth <= this.departureDate!
        ) {
          const overlappingKey = `${roomId}-${moment(dayInMonth).format('DD-MM-YYYY')}`;
          // console.log('overlapping', overlappingKey);

          if (this.alreadyBookedCells.has(overlappingKey) && dayInMonth !== this.departureDate!) {
            overlappingDates.push(moment(dayInMonth).format('DD-MMM-YY'));
          }
        }
      });
      // console.log('day in month', this.daysInMonth);

      // console.log('overlap', overlappingDates);
      // console.log('lenght', overlappingDates.length);
      // console.log('alreadybooked', this.alreadyBookedCells);

      const arrivalKey = `${roomId}-${moment(this.arrivalDate!).format('DD-MM-YYYY')}-start`;
      const departureKey = `${roomId}-${moment(this.departureDate!).format('DD-MM-YYYY')}-end`;
      const isExactMatch = this.alreadyBookedCells.has(arrivalKey) && this.alreadyBookedCells.has(departureKey);
      console.log('exactmatch', isExactMatch);

      if (overlappingDates.length > 0 || isExactMatch) {
        
        const arrivalDateFormatted = moment(this.arrivalDate).format('DD-MMM-YYYY');
      const departureDateFormatted = moment(this.departureDate).format('DD-MMM-YYYY');
      
      const messageParts = [];
      
      if (isExactMatch) {
        messageParts.push(`The room is already booked from ${arrivalDateFormatted} to ${departureDateFormatted}`);
      }

      if (overlappingDates.length > 0) {
        messageParts.push(`The room is also booked on the following dates: ${overlappingDates.join(', ')}`);
      }

      this.snackBar.open(
        `${messageParts.join('. ')}. Please choose different dates.`,
        "X", { duration: 5000, verticalPosition: "top" }
      );
        this.selectionStart = null;
        this.selectedCells.clear();
        this.arrivalDate = null;
        this.departureDate = null;
        return;
      }

      if (nights > maxstay) {
        this.snackBar.open(
          `Stay duration should not exceed ${
            maxstay + 1
          } days, ${maxstay} nights. Your selection is ${duration} days, ${nights} nights.`,
          'X',
          { duration: 5000, verticalPosition: 'top' }
        );
        this.selectionStart = null;
        this.selectedCells.clear();
        this.arrivalDate = null;
        this.departureDate = null;
        return;
      }
      if (nights < minstay) {
        this.snackBar.open(
          `Stay duration must be at least ${
            minstay + 1
          } days, ${minstay} nights. Your selection is ${duration} days, ${nights} nights.`,
          'X',
          { duration: 5000, verticalPosition: 'top' }
        );
        this.selectionStart = null;
        this.selectedCells.clear();
        this.arrivalDate = null;
        this.departureDate = null;
        return;
      }
      this.openBookingModal(roomId);
    }
    this.selectionStart = null;
    this.arrivalDate = null;
    this.departureDate = null;
    // console.log("end of mouseup");
  }

  // isBookingAllowed(day: Date, roomId: number): boolean{
  //   const room = this.rooms.find((room) => room.roomId === roomId);
  //   if(room && room.stays.length>0){
  //     const bookdatefrom=
  //   }
  // }
  isarrival(day: Date, roomId: number): boolean {
    const room = this.filteredRooms.find((room) => room.roomId === roomId);
    // console.log("came here",this.filteredRooms);
    if (room && room.stays.length > 0) {
      
      const arrivad = room.stays.flatMap(stay => stay.arrivalDays || []);
      const arrday = formatDate(day, 'EEE', 'en-US').toUpperCase();
      return arrivad.includes(arrday);
    }
 
  
    return false;
  }
  
  isdeparture(day: Date, roomId: number): boolean {
    const room = this.filteredRooms.find((room) => room.roomId === roomId);
    if (room && room.stays.length > 0) {
      const departured = room.stays.flatMap(stay => stay.departureDays || []);
      const depday = formatDate(day, 'EEE', 'en-US').toUpperCase();
      return departured.includes(depday);
    }
    
    return false;
  }
  

  toggleSelection(roomId: number, day: Date) {
    const cellKey = `${roomId}-${moment(day).format('DD-MM-YYYY')}`;
    if (this.alreadyBookedCells.has(cellKey)) {
      return;
    }
    if (this.selectedCells.has(cellKey)) {
      this.selectedCells.delete(cellKey);
    } else {
      this.selectedCells.add(cellKey);
    }
  }
  openBookingModal(roomId: number): void {
    const selectedRoom = this.filteredRooms.find((room) => room.roomId === roomId);

    if (selectedRoom) {
      const isAnyCellBooked = Array.from(this.selectedCells).some((cellKey) =>
        this.alreadyBookedCells.has(cellKey)
      );
      if (isAnyCellBooked) {
        return;
      }
      const modalRef = this.modalService.open(BookingDetailsComponent, {
        size: 'lg',
        backdrop: 'static',
      });
      modalRef.componentInstance.selectedRoom = selectedRoom;
      modalRef.componentInstance.stayDateFrom = this.arrivalDate;
      modalRef.componentInstance.stayDateTo = this.departureDate;
      modalRef.result.then(
        (result) => {
          if (result === 'booking confirmed') {
            this.loadBookingsFromLocalStorage();
            this.highlightAlreadyBookedDates();
          }
        },
        (reason) => {
          console.log('Modal dismissed:', reason);
          this.selectedCells.clear();
        }
      );
    }
  }

  loadBookingsFromLocalStorage() {
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
      this.bookings = JSON.parse(storedBookings);
      console.log('Bookings Loaded:', this.bookings);
    }
    this.highlightBookedDates();
    this.highlightAlreadyBookedDates();
  }

  highlightBookedDates() {
    // console.log('Highlighting Booked Dates');
    this.selectedCells.clear();

    this.bookings.forEach((booking) => {
      const roomId = booking.summary.roomId;
      const startDate = new Date(booking.summary.stayDateFro);
      const endDate = new Date(booking.summary.stayDateTo);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      // console.log("kdjfnasd",startDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        // console.error(`Invalid dates for booking: ${booking.summary.stayDateFro} - ${booking.summary.stayDateTo}`);
        return;
      }

      this.daysInMonth.forEach((day) => {
        const dayOnly = new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate()
        );
        dayOnly.setHours(0, 0, 0, 0);
        // console.log("day selected",dayOnly);
        if (dayOnly >= startDate && dayOnly <= endDate) {
          const cellKey = `${roomId}-${moment(dayOnly).format('DD-MM-YYYY')}`;
          // console.log(`Adding to Selected Cells: ${cellKey}`);
          this.selectedCells.add(cellKey);
        }
      });
    });
    console.log("selcte",this.selectedCells);
    
    console.log('Highlighted Cells:', Array.from(this.selectedCells));
  }

  highlightAlreadyBookedDates() {
    console.log('Highlighting Already Booked Dates');
    this.alreadyBookedCells.clear();

    this.bookings.forEach((booking) => {
      const roomId = booking.summary.roomId;
      const startDate = new Date(booking.summary.stayDateFro);
      const endDate = new Date(booking.summary.stayDateTo);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error(
          `Invalid dates for booking: ${booking.summary.stayDateFro} - ${booking.summary.stayDateTo}`
        );
        return;
      }
      
      // console.log(`Booking Details: Room ${roomId}, From ${startDate.toISOString()}, To ${endDate.toISOString()}`);
      this.daysInMonth.forEach((day) => {
        
        const dayOnly = this.stripTime(day);
        // console.log("day already",dayOnly);

        if (dayOnly >= startDate && dayOnly <= endDate) {
          const cellKey = `${roomId}-${moment(dayOnly).format('DD-MM-YYYY')}`;
          const bookingDetails = {
            classes: '',
            fullName: booking.bookingDetails?.fullName || 'Guest',
            status: booking.status
        };
          let existingClasses = this.alreadyBookedCells.get(cellKey) || '';

          const isStart = this.isStartBookingDate(roomId, dayOnly);
          const isEnd = this.isEndBookingDate(roomId, dayOnly);

          if (this.isStartBookingDate(roomId, dayOnly)) {
            console.log("start",booking.status, this.getBookingCellColor(booking.status, 'start'))
            // this.alreadyBookedCells.set(cellKey, this.getBookingCellColor(booking.status, 'start'));
            existingClasses += ` ${this.getBookingCellColor(booking.status, 'start')}`;
          } 
          else if (this.isEndBookingDate(roomId, dayOnly)) {
              // this.alreadyBookedCells.set(cellKey, this.getBookingCellColor(booking.status, 'end'));
              existingClasses += ` ${this.getBookingCellColor(booking.status, 'end')}`;
          } 
          else if (dayOnly > startDate && dayOnly < endDate) {
              // this.alreadyBookedCells.set(cellKey, this.getBookingCellColor(booking.status, 'full'));
              existingClasses += ` ${this.getBookingCellColor(booking.status, 'full')}`;
          }
          this.alreadyBookedCells.set(cellKey, existingClasses.trim());
        }

      });
    });
    // console.log('Already Booked Cells:', Array.from(this.alreadyBookedCells));
  }

  getBookingCellColor(status: string, cellType: 'start' | 'end' | 'full'): string {
    const baseColor = this.getStatusColor(status);
    switch (cellType) {
        case 'start':
            return `${baseColor} start-booking-full`;
        case 'end':
            return `${baseColor} end-booking-half-right`;
        case 'full':
        default:
            return `${baseColor} full-booking`;
    }
}

  
  isRoomBooked(roomId: number, day: Date): boolean {
    const cellKey = `${roomId}-${moment(day).format('DD-MM-YYYY')}`;
    const isBooked = this.alreadyBookedCells.has(cellKey);
    // console.log(`Checking if Room ${roomId} on ${day.toISOString()}: ${isBooked}`);
    return isBooked;
  }

  getbookingstatus(roomId: number, day: Date): string {
    const booking = this.bookings.find(
      (b) =>
        b.summary.roomId === roomId &&
        this.isSameOrAfter(this.stripTime(day), this.stripTime(new Date(b.summary.stayDateFro))) &&
        this.isSameOrBefore(this.stripTime(day), this.stripTime(new Date(b.summary.stayDateTo)))
    );
    return booking?.status || 'Available';
}

stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

isSameOrAfter(date1: Date, date2: Date): boolean {
    return date1.getTime() >= date2.getTime();
}

isSameOrBefore(date1: Date, date2: Date): boolean {
    return date1.getTime() <= date2.getTime();
}


  isStartBookingDate(roomId: number, day: Date): boolean {
    return this.bookings.some(
      (booking) =>
        booking.summary.roomId === roomId &&
        new Date(booking.summary.stayDateFro).toDateString() ===
          day.toDateString()
    );
  }

  isEndBookingDate(roomId: number, day: Date): boolean {
    return this.bookings.some(
      (booking) =>
        booking.summary.roomId === roomId &&
        new Date(booking.summary.stayDateTo).toDateString() ===
          day.toDateString()
    );
  }
  getStatusColor(status: string): string {
    if(status === 'Confirmed'){
      // console.log("statussssss",status)

      return 'blue';
    }
    else if(status === 'Cancelled'){
      return 'gray';
    }
    else if(status === 'New'){
      return 'orange';
    }
    else if(status === 'Checked-In'){
      return 'green';
    }
    else if(status === 'Checked-Out'){
      return 'red';
    }
    return '';
   
  }
  
  
  gettooltip(roomId: number, day: Date): string {
    const booking = this.bookings.find(
      (booking) =>
        booking.summary.roomId === roomId &&
        day >= new Date(booking.summary.stayDateFro) &&
        day <= new Date(booking.summary.stayDateTo)
    );
    // console.log("gettooltip");
    if (booking) {
      const fullName = booking.bookingDetails?.fullName || 'Guest';
      const stayfrom = moment(booking.summary.stayDateFro).format('DD-MMM-YY');
      const stayto = moment(booking.summary.stayDateTo).format('DD-MMM-YY');
      const status = booking.status || '';
      return `Room: ${roomId}\nGuest: ${fullName}\nFrom: ${stayfrom}\nTo: ${stayto}\nStatus: ${status}`;
    }
    return '';
  }
  onCellDoubleClick(roomId: number, day: Date, event: MouseEvent) {
    const cellKey = `${roomId}-${moment(day).format('DD-MM-YYYY')}`;
    if (this.alreadyBookedCells.has(cellKey)) {
      this.openStatusUpdateModal(roomId, day);
    }
  }


  openStatusUpdateModal(roomId: number, day: Date): void {
    const startDate = new Date(day);
    const endDate = new Date(day);
    const modalRef = this.modalService.open(StatusBookingComponent, {
      size: 'md',
      backdrop: 'static',
    });
    modalRef.componentInstance.roomId = roomId;
    modalRef.componentInstance.startDate = startDate;
    modalRef.componentInstance.endDate = endDate;
    modalRef.result.then(
      (result) => {
        console.log('Status updated:', result);
        this.loadBookingsFromLocalStorage();
        this.highlightAlreadyBookedDates();
      
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }

  
  getDynamicClasses(roomId: number, day: any): { [key: string]: boolean } {
    const status = this.getbookingstatus(roomId, day);
    // if(this.isarrival(day, roomId) || this.isdeparture(day, roomId)){
    //   // console.log("came herererererererererererererererererererererererererererererererere");
    // }
    return {
      'start-booking': this.isStartBookingDate(roomId, day),
      'end-booking': this.isEndBookingDate(roomId, day),
      'already-booked': this.isRoomBooked(roomId, day),
      'arrival-day': this.isarrival(day, roomId),
      'departure-day': this.isdeparture(day, roomId),
      'selected': this.selectedCells.has(roomId + '-' + this.formatDate(day)),
      'disabled': this.isCellDisabled(roomId, day),
      [status.toLowerCase()]: true
    };
  }
}

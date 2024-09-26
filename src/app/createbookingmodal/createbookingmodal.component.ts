// import { Component, Input, OnInit, Inject } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { DetailsService } from '../details.service';
// import {
//   FormBuilder,
//   FormGroup,
//   Validators,
//   AbstractControl,
//   ValidationErrors,
// } from '@angular/forms';
// import { Room } from '../room.interface';
// import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
// import moment from 'moment';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { ConfirmComponent } from '../confirm/confirm.component';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import { MatDialog } from '@angular/material/dialog';
// // import { MyDialogComponent } from './my-dialog/my-dialog.component'; // Adjust the path accordingly



// declare var $: any;

// @Component({
//   selector: 'app-createbookingmodal',
//   templateUrl: './createbookingmodal.component.html',
//   styleUrl: './createbookingmodal.component.css',
// })
// export class CreatebookingmodalComponent implements OnInit {
//   @Input() stayDateFrom!: Date;
//   @Input() stayDateTo!: Date;
//   uniqueLocations: string[] = [];
//   filteredRooms: Room[] = [];
//   bookingForm!: FormGroup;
//   summaryForm!: FormGroup;
//   paymentForm!: FormGroup;
//   totalPrice: number = 0;
//   stepIndex: number = 0;
//   isExistingCustomer: boolean = false;
//   existingCustomers: any[] = [];
//   selectedRoom: any;
//   paymentMode: 'online' | 'cash' = 'online';
//   currentdate = new Date().toISOString().split('T')[0];
//   showConfirmation = false;
//   availableRooms: any[] = [];
//   totalRoomData: Room[] = [];
//   rooms: Room[] = [];
//   data1: Room[] = [];
//   datesLoaded: boolean = false;
//   validDates: Set<string> = new Set();
//   arrivalDates: Date[] = [];
//   arrive: any[] = [];
//   departureDates: Date[] = [];
//   selectedArrivalDate: string | null = null;
//   selectedDepartureDate: string | null = null;
//   guestsNUmbers: number[] = [];
//   bookings: {
//     bookingDetails: { fullName: string };
//     summary: { roomId: number; stayDateFro: string; stayDateTo: string };
//     status: string;
//   }[] = [];
//   isRoomSelected = false;
//   selectedroom:any;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private detailsService: DetailsService,
//     public dialogRef: MatDialogRef<CreatebookingmodalComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: any
//   ) {
//     this.initialize();

//     this.detailsService.getCombinedData().subscribe((rooms) => {
//       this.filteredRooms = rooms;
//       this.totalRoomData = rooms;
//       this.data1 = rooms || [];
//       console.log('Merged data in Booking:', this.data1);
//       let validDates: Set<string> = new Set();
//       const currentDate = moment().startOf('day');
//       const bookDateFromArray: string[] = [];
//       rooms.forEach((room) => {
//         room.stays.forEach((stay) => {
//           const bookDateFrom = stay?.bookDateFrom
//             ? moment(stay.bookDateFrom, 'YYYY-MM-DD').startOf('day')
//             : currentDate;
//           const bookDateTo = stay?.bookDateTo
//             ? moment(stay.bookDateTo, 'YYYY-MM-DD').startOf('day')
//             : moment(stay.stayDateTo)
//                 .subtract(stay.minStay + (stay.minDeviation || 0), 'days')
//                 .startOf('day');
//           const stayDateFro = moment(stay.stayDateFrom, 'YYYY-MM-DD').startOf(
//             'day'
//           );
//           const stayDateTo = moment(stay.stayDateTo, 'YYYY-MM-DD').startOf(
//             'day'
//           );
//           const minDeviation = stay.minDeviation || 0;
//           const maxDeviation = stay.maxDeviation || Infinity;
//           const arrivalDays = stay.arrivalDays || [];
//           const minArrivalDate = currentDate.clone().add(minDeviation, 'days');
//           const maxArrivalDate = currentDate.clone().add(maxDeviation, 'days');
//           //   console.log('Booking From:', bookDateFrom);
//           // console.log('Booking To:', bookDateTo);
//           // console.log('Min Deviation:', minDeviation);
//           // console.log('Max Deviation:', maxDeviation);
//           bookDateFromArray.push(bookDateFrom.format('YYYY-MM-DD'));
//           if (currentDate.isBetween(bookDateFrom, bookDateTo, 'day', '[]')) {
//             for (
//               let i = stayDateFro.clone();
//               i.isSameOrBefore(
//                 stayDateTo.clone().subtract(stay.minStay || 0, 'days')
//               );
//               i.add(1, 'day')
//             ) {
//               const isOnArrivalDays =
//                 arrivalDays.length > 0 ||
//                 arrivalDays.includes(i.format('ddd').toUpperCase());
//               const isValidForMinDeviation = i.isSameOrAfter(minArrivalDate);
//               const isValidForMaxDeviation = i.isSameOrBefore(maxArrivalDate);

//               if (
//                 isOnArrivalDays &&
//                 isValidForMinDeviation &&
//                 isValidForMaxDeviation
//               ) {
//                 validDates.add(i.format('YYYY-MM-DD'));
//               }
//             }
//           }
//         });
//       });
//       console.log(' bookdatefrom all da\n', bookDateFromArray.toLocaleString());
//       // console.log('valid dates ', validDates);

//       this.arrivalDates = Array.from(validDates).map((dateString) =>
//         moment(dateString, 'YYYY-MM-DD').toDate()
//       );
//       this.datesLoaded = true;
//       this.arrive = this.arrivalDates;
//       console.log('Arrival Dates:', this.arrivalDates.toLocaleString());
//     });
//     this.loadBookingsFromLocalStorage();
//   }

// ngOnInit(): void {
//   this.subscribeToFormChanges();
//   this.updatePaymentTotal();
// }

//   initialize() {
//     this.bookingForm = this.fb.group({
//       existingCustomer: [''],
//       customerId: [''],
//       fullName: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       phone: ['', Validators.required],
//       birthDate: ['', Validators.required],
//       address: ['', Validators.required],
//     });

//     this.loadExistingCustomers();

//     if (!this.isExistingCustomer) {
//       this.generateCustomerId();
//     }
//     this.summaryForm = this.fb.group({
//       roomId: [''],
//       locationName: [''],
//       roomName: [''],
//       guestCapacity: ['', Validators.required],
//       stayDateFro: ['', Validators.required],
//       stayDateTo: ['', Validators.required],
//       pricePerPerson: [''],
//       totalPrice: [''],
//       numberOfDays: [''],
//       arrivalDays: [''],
//       departureDays: [''],

//       minStay: [''],
//       maxStay: [''],
//     });

//     this.paymentForm = this.fb.group({
//       cardNumber: ['', Validators.required],
//       cardName: ['', Validators.required],
//       expirationDate: ['', Validators.required],
//       cvv: ['', Validators.required],
//       totalAmount:[{value:'',disabled:true}],
//       paidAmount: [{ value: '', disabled: this.paymentMode !== 'cash' }],
//       dueAmount: [{ value: '', disabled: this.paymentMode !== 'cash' }],
//     });

//   }

//   subscribeToFormChanges() {
//     this.summaryForm.get('guestCapacity')?.valueChanges.subscribe(() => {
//       this.filterAvailableRooms();
//     });

//     this.summaryForm.get('stayDateFro')?.valueChanges.subscribe(() => {
//       this.filterAvailableRooms();
//     });

//     this.summaryForm.get('stayDateTo')?.valueChanges.subscribe(() => {
//       this.filterAvailableRooms();
//     });

//     // Subscribe to changes in paidAmount
//     this.paymentForm.get('paidAmount')?.valueChanges.subscribe(() => {
//       this.updateDueAmount();
//     });
//   }

//   onGuestCapacityChange(event: any): void {
//     this.filterAvailableRooms();
//   }

//   print() {
//     console.log('arival', this.arrivalDates);
//   }

//   onArrivalDateChange(event: any): void {
    
//     const selectedDate = moment(event.value).format('YYYY-MM-DD');
//     const currentDate = moment(new Date()).format('YYYY-MM-DD');

//     let departureDateSet: Set<string> = new Set();
//     this.selectedArrivalDate = selectedDate;
//     const arrivalDate = moment(selectedDate).format('YYYY-MM-DD');
//     this.data1.forEach((room) => {
//       let roomAvailable = false;
//       let count = 0;
      
//       room.stays.forEach((stay) => {
//         count++;
//         const stayDateFrom = moment(stay.stayDateFrom).format('YYYY-MM-DD');
//         const stayDateTo = moment(stay.stayDateTo).format('YYYY-MM-DD');
//         const minStay = stay.minStay;
//         const maxStay = stay.maxStay;
//         const bookDateFrom = stay.bookDateFrom
//           ? moment(stay.bookDateFrom).format('YYYY-MM-DD')
//           : null;
//         const bookDateTo = stay.bookDateTo
//           ? moment(stay.bookDateTo).format('YYYY-MM-DD')
//           : null;
//         const minDeviation = stay.minDeviation;
//         const maxDeviation = stay.maxDeviation;
//         const arrivalDays = stay.arrivalDays.map((day) => day.toUpperCase());
//         const departureDays = stay.departureDays.map((day) =>
//           day.toUpperCase()
//         );
//         const bookedRooomsByRoomId = this.bookings.filter(
//           (booking) => booking.summary.roomId === room.roomId
//         );

//         const isOnArrivalDays =
//           arrivalDays.length > 0
//             ? arrivalDays.includes(
//                 moment(arrivalDate).format('ddd').toUpperCase()
//               )
//             : true;
//         const isBetweenBookFromAndToDate = moment(arrivalDate).isBetween(
//           bookDateFrom,
//           bookDateTo,
//           'day',
//           '[]'
//         );
//         const isBetweenStayFromAndToDate = moment(arrivalDate).isBetween(
//           stayDateFrom,
//           stayDateTo,
//           'day',
//           '[]'
//         );
//         const isValidForMinDeviation = moment(arrivalDate).isSameOrAfter(
//           moment(new Date()).add(stay.minDeviation, 'days').startOf('day')
//         );
//         const isValidForMaxDeviation = moment(arrivalDate).isSameOrBefore(
//           moment(new Date()).add(stay.maxDeviation, 'days').startOf('day')
//         );
//         // console.log(`Processing stay #${count} for roomId ${room.roomId}`);

//         // console.log('Selected Date:', selectedDate);
//         // console.log('Booking From:', bookDateFrom);
//         // console.log('Booking To:', bookDateTo);
//         // console.log('Min Deviation:', minDeviation);
//         // console.log('Max Deviation:', maxDeviation);

//         if (
//           isOnArrivalDays &&
//           isBetweenStayFromAndToDate &&
//           isBetweenBookFromAndToDate &&
//           isValidForMinDeviation &&
//           isValidForMaxDeviation
//         ) {
//           for (
//             let i = moment(arrivalDate);
//             i <= moment(stayDateTo).subtract(stay.minStay, 'days');
//             i = i.add(1, 'days')
//           ) {
//             let isOverlapping = false;
//             bookedRooomsByRoomId.forEach((booking) => {
//               const checkIn = moment(booking.summary.stayDateFro).format(
//                 'YYYY-MM-DD'
//               );
//               const checkOut = moment(booking.summary.stayDateTo).format(
//                 'YYYY-MM-DD'
//               );
//               if (
//                 moment(i).isBetween(
//                   moment(checkIn),
//                   moment(checkOut),
//                   'day',
//                   '[]'
//                 ) ||
//                 moment(i)
//                   .clone()
//                   .add(stay.minStay, 'days')
//                   .isBetween(moment(checkIn), moment(checkOut), 'day', '[]') ||
//                 moment(i)
//                   .clone()
//                   .add(stay.maxStay, 'days')
//                   .isBetween(moment(checkIn), moment(checkOut), 'day', '[]')
//               ) {
//                 isOverlapping = true;
//               }
//             });
//             const isValidForMinStay = moment(i).isSameOrAfter(
//               moment(arrivalDate).add(stay.minStay, 'days').startOf('day'),
//               'day'
//             );
//             const isValidForMaxStay = moment(i).isSameOrBefore(
//               moment(arrivalDate).add(stay.maxStay, 'days').startOf('day'),
//               'day'
//             );
//             const isOnDepartureDays =
//               departureDays.length > 0
//                 ? departureDays.includes(moment(i).format('ddd').toUpperCase())
//                 : true;

//             if (
//               isValidForMinStay &&
//               isValidForMaxStay &&
//               isOnDepartureDays &&
//               !isOverlapping
//             ) {
//               departureDateSet.add(moment(i).format('YYYY-MM-DD'));
//             }
//           }
//         }
//       });
//       console.log(`Total stays processed for roomId ${room.roomId}: ${count}`);
//       this.departureDates = Array.from(departureDateSet).map((dateString) =>
//         moment(dateString, 'YYYY-MM-DD').toDate()
//       );
//       console.log('departure dates: ', this.departureDates);

//       if (roomAvailable) {
//         this.filterAvailableRooms();
//       }
//     });
//   }

//   arrivaldateFilter = (d: Date | null): boolean => {
//     if (!d) return false;
//     // this.fetchValidDates();
//     // if (!this.datesLoaded) return false;
//     console.log('arrival ib datefilter', this.arrivalDates.toLocaleString());
//     // return true;
//     const availableDates = this.arrivalDates.map((date) =>
//       moment(date).format('YYYY-MM-DD')
//     );
//     return availableDates.includes(moment(d).format('YYYY-MM-DD'));
//   };

//   departuredatefilter = (d: Date | null): boolean => {
//     if (!d) return false;
//     const availableDates = this.departureDates.map((date) =>
//       moment(date).format('YYYY-MM-DD')
//     );
//     return availableDates.includes(moment(d).format('YYYY-MM-DD'));
//   };

//   onDepartureDateChange(event: any): void {
//     this.data1.forEach((room) => {
//       const selectedDate = moment(event.value).format('YYYY-MM-DD');
//       const currentDate = moment(new Date());
//       this.selectedDepartureDate = selectedDate;
//       room.stays.forEach((stay) => {
//         const stayDateFrom = moment(stay.stayDateFrom).format('YYYY-MM-DD');
//         const stayDateTo = moment(stay.stayDateTo).format('YYYY-MM-DD');
//         const arrivalDays = stay?.arrivalDays.map((item) => item.toUpperCase());
//         const departureDays = stay?.departureDays.map((item) =>
//           item.toUpperCase()
//         );
//         const isMinDaviationValid = stay?.minDeviation
//           ? moment(this.selectedArrivalDate).diff(stayDateFrom, 'hours') / 24 >=
//             stay.minDeviation
//           : true;
//         const isMaxDaviationValid = stay?.maxDeviation
//           ? moment(this.selectedArrivalDate).diff(stayDateFrom, 'hours') / 24 <=
//             stay.maxDeviation
//           : true;

//         if (
//           (arrivalDays.length > 0
//             ? arrivalDays.includes(
//                 moment(this.selectedArrivalDate).format('ddd').toUpperCase()
//               )
//             : true) &&
//           (departureDays.length > 0
//             ? departureDays.includes(
//                 moment(this.selectedDepartureDate).format('ddd').toUpperCase()
//               )
//             : true) &&
//           isMinDaviationValid &&
//           isMaxDaviationValid
//         ) {
//           const numberOfDays = Math.ceil(
//             moment(this.selectedDepartureDate)
//               .hours(10)
//               .diff(moment(this.selectedArrivalDate).hours(11), 'hours') / 24
//           );

//           if (numberOfDays >= stay.minStay && numberOfDays <= stay.maxStay) {
//             this.rooms.push(room);
//           }
//         }
//       });
//       if (
//         this.selectedArrivalDate &&
//         this.selectedDepartureDate &&
//         this.rooms.length > 0
//       ) {
//         this.guestsNUmbers = [];
//         const maxGuest = Math.max(
//           ...this.rooms.map((room) => room.guestCapacity)
//         );
//         for (let i = 1; i <= maxGuest; i++) {
//           this.guestsNUmbers.push(i);
//         }
//       }
//       this.filterAvailableRooms();
//     });
//   }

//   filterAvailableRooms(): void {
//     const arrivalDate = moment(
//       this.summaryForm?.get('stayDateFro')?.value
//     ).format('YYYY-MM-DD');
//     const departureDate = moment(
//       this.summaryForm?.get('stayDateTo')?.value
//     ).format('YYYY-MM-DD');
//     const guestCapacity = this.summaryForm.get('guestCapacity')?.value;
//     console.log('arr', arrivalDate);
//     console.log('dep', departureDate);
//     console.log('guest', guestCapacity);

//     this.filteredRooms = this.totalRoomData;
//     let roomsToFilter = [...this.totalRoomData];

//     if (guestCapacity) {
//       roomsToFilter = roomsToFilter.filter(
//         (room) => room.guestCapacity >= guestCapacity
//       );
//     }
//     // console.log('After guest filter:', roomsToFilter);

//     if (arrivalDate && departureDate) {
//       const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
//       const occupyroomid: Set<number> = new Set();
//       for (let i = 0; i < bookings.length; i++) {
//         const bookfrom = moment(bookings[i].summary.stayDateFro).format(
//           'YYYY-MM-DD'
//         );
//         const bookto = moment(bookings[i].summary.stayDateTo).format(
//           'YYYY-MM-DD'
//         );
//         const roomID = bookings[i].summary.roomId;
//         // console.log("bookfrom",bookfrom);
//         // console.log("bookto",bookto);
//         // console.log("roomidsdf",roomID);
//         const isoverlap =
//           arrivalDate && departureDate
//             ? arrivalDate <= bookto && departureDate >= bookfrom
//             : true;
//         if (isoverlap) {
//           occupyroomid.add(roomID);
//         }
//       }
//       roomsToFilter = roomsToFilter.filter(
//         (room) => !occupyroomid.has(room.roomId)
//       );
//     }
//     const numberOfNights =
//       arrivalDate && departureDate
//         ? moment(departureDate).diff(moment(arrivalDate), 'days')
//         : 0;

//     this.filteredRooms = roomsToFilter.map((room) => ({
//       ...room,
//       numberOfNights,
//       totalPrice:
//         room.pricePerDayPerPerson * (guestCapacity || 1) * numberOfNights,
//     }));

//     this.filteredRooms = roomsToFilter;
//     this.updatePaymentTotal();
//     this.filteredRooms.sort(
//       (a, b) => a.pricePerDayPerPerson - b.pricePerDayPerPerson
//     );

//     if (arrivalDate && departureDate) {
//       const numberOfNights = moment(departureDate).diff(
//         moment(arrivalDate),
//         'days'
//       );

//       this.filteredRooms.forEach((room) => {
//         room.numberOfNights = numberOfNights || 0;
//         room.totalPrice =
//           room.pricePerDayPerPerson *
//           (guestCapacity || 1) *
//           (numberOfNights || 1);
//       });
//     }
//   }
//   loadExistingCustomers(): void {
//     const existingData = JSON.parse(localStorage.getItem('bookings') || '[]');
//     this.existingCustomers = existingData.map(
//       (booking: any) => booking.bookingDetails
//     );
//   }

//   setCustomerMode(mode: string): void {
//     this.isExistingCustomer = mode === 'existing';
//     if (this.isExistingCustomer) {
//       this.bookingForm.reset({
//         existingCustomer: '',
//       });
//     } else {
//       this.generateCustomerId();
//     }
//   }

//   generateCustomerId(): void {
//     const randomId = 'CUS' + Math.floor(Math.random() * 1000000).toString();
//     this.bookingForm.patchValue({ customerId: randomId });
//   }

//   fillExistingCustomerDetails(event: any): void {
//     const selectedCustomerId = event.value;
//     const customerData = this.existingCustomers.find(
//       (c) => c.customerId === selectedCustomerId
//     );
//     if (customerData) {
//       this.bookingForm.patchValue({
//         customerId: customerData.customerId,
//         fullName: customerData.fullName,
//         email: customerData.email,
//         phone: customerData.phone,
//         address: customerData.address,
//         birthDate: customerData.birthDate,
//       });
//     }
//   }

//   loadBookingsFromLocalStorage() {
//     const storedBookings = localStorage.getItem('bookings');
//     if (storedBookings) {
//       this.bookings = JSON.parse(storedBookings);
//       console.log('Bookings Loaded:', this.bookings);
//     }
//   }
//   setPaymentMethod(method: 'online' | 'cash'): void {
//     this.paymentMode = method;
//     if (method === 'cash') {
//       this.paymentForm.get('paidAmount')?.enable();
//       this.paymentForm.get('dueAmount')?.enable();
//       this.paymentForm.get('cardNumber')?.clearValidators();
//       this.paymentForm.get('cardName')?.clearValidators();
//       this.paymentForm.get('expirationDate')?.clearValidators();
//       this.paymentForm.get('cvv')?.clearValidators();

//       this.paymentForm.get('paidAmount')?.setValidators([Validators.required]);
//       this.paymentForm.get('dueAmount')?.setValidators([Validators.required]);
//     } else {
//       // this.paymentForm.get('paidAmount')?.enable();
//       // this.paymentForm.get('dueAmount')?.disable();
//       this.paymentForm.get('paidAmount')?.clearValidators();
//       this.paymentForm.get('dueAmount')?.clearValidators();

//       this.paymentForm.get('cardNumber')?.setValidators([Validators.required]);
//       this.paymentForm.get('cardName')?.setValidators([Validators.required]);
//       this.paymentForm
//         .get('expirationDate')
//         ?.setValidators([Validators.required]);
//       this.paymentForm.get('cvv')?.setValidators([Validators.required]);
//     }
//     this.paymentForm.get('cardNumber')?.updateValueAndValidity();
//     this.paymentForm.get('cardName')?.updateValueAndValidity();
//     this.paymentForm.get('expirationDate')?.updateValueAndValidity();
//     this.paymentForm.get('cvv')?.updateValueAndValidity();
//     this.paymentForm.get('paidAmount')?.updateValueAndValidity();
//     this.paymentForm.get('dueAmount')?.updateValueAndValidity();
//   }
//   updatePaymentTotal(): void {
//     // if (this.selectedRoom) {
//     //   const totalPrice = this.selectedRoom.totalPrice;
//     //   this.paymentForm.get('totalAmount')?.setValue(totalPrice);
//     // } else {
//     //   this.paymentForm.get('totalAmount')?.setValue(0);
//     // }
//     if (this.selectedroom) {
//       const guestCapacity = this.summaryForm.get('guestCapacity')?.value || 1;
//       const numberOfNights = this.selectedroom.numberOfNights || 1;
//       const roomPricePerDay = this.selectedroom.pricePerDayPerPerson || 0;
  
//       // Calculate total price
//       const totalPrice = roomPricePerDay * guestCapacity * numberOfNights;
  
//       // Update the payment form
//       this.paymentForm.get('totalAmount')?.setValue(totalPrice);
  
//       // If there's any paid amount, update the due amount
//       this.updateDueAmount();
//     }
//   }


//   updateDueAmount(): void {
//     const totalAmount = this.paymentForm.get('totalAmount')?.value || 0;
//     const paidAmount = this.paymentForm.get('paidAmount')?.value || 0;
//     const dueAmount = totalAmount - paidAmount;
    
//     // Update due amount
//     this.paymentForm.get('dueAmount')?.setValue(dueAmount);
// }
  
//   selectRoom(room: any): void {
//     this.isRoomSelected = true;
//     this.stepIndex = 1;
//     this.selectedroom = room;
//     this.summaryForm.patchValue({
//       roomId: room.roomId,
//       locationName: room.locationName,
//       roomName: room.roomName,
//       guestCapacity: room.guestCapacity,
//       pricePerPerson: room.pricePerDayPerPerson,
//       totalPrice: room.totalPrice,
//       numberOfDays: room.numberOfNights, 
//       arrivalDays: room.arrivalDays,
//       departureDays: room.departureDays,
//       minStay: room.minStay,
//       maxStay: room.maxStay,
//     });
//     this.paymentForm.get('totalAmount')?.setValue(room.totalPrice);

    
//     this.paymentForm.get('dueAmount')?.setValue(room.totalPrice);
//     this.updatePaymentTotal();
//   }

//   onStepChange(event: any): void {
//     console.log('Step changed:', event);
//   }

//   onSubmit(): void {
//     if (this.paymentMode === 'cash') {
//       if (
//         this.paymentForm.get('dueAmount')?.invalid ||
//         this.paymentForm.get('paidAmount')?.invalid
//       ) {
//         this.paymentForm.markAllAsTouched();
//         return;
//       }
//     } else {
//       if (this.paymentForm.invalid) {
//         this.paymentForm.markAllAsTouched();
//         return;
//       }
//     }
//     if (
//       this.bookingForm.valid &&
//       this.paymentForm.valid &&
//       this.summaryForm.valid
//     ) {
//       const formattedStayDateFro = moment(
//         this.summaryForm.get('stayDateFro')?.value
//       ).format('YYYY-MM-DD');
//       const formattedStayDateTo = moment(
//         this.summaryForm.get('stayDateTo')?.value
//       ).format('YYYY-MM-DD');
//       const bookingData = {
//         bookingId: new Date().getTime(),
//         summary: {
//           ...this.summaryForm.value,
//           stayDateFro: formattedStayDateFro,
//           stayDateTo: formattedStayDateTo,
//         },
//         bookingDetails: this.bookingForm.value,
//         payment: {
//           ...this.paymentForm.value,
//           totalAmount: this.paymentForm.get('totalAmount')?.value,
//           paidAmount: this.paymentForm.get('paidAmount')?.value,
//           dueAmount: this.paymentForm.get('dueAmount')?.value,
//         },
//         status: 'New',
//       };
//       const existingData = JSON.parse(localStorage.getItem('bookings') || '[]');
//       existingData.push(bookingData);
//       localStorage.setItem('bookings', JSON.stringify(existingData));
//       console.log('Form submitted', this.bookingForm.value);
//       console.log('Booking Summary', this.summaryForm.value);
//       console.log('Payment Details', this.paymentForm.value);

//       this.dialogRef.close();
//     }
//   }
  
//   printInvoice(): void {
//     const data = document.getElementById('booking-preview');
//     if (data) {
//       html2canvas(data, { scale: 2 }).then((canvas) => { 
//         const imgWidth = 208; 
//         const pageHeight = 295; 
//         const imgHeight = (canvas.height * imgWidth) / canvas.width; 
//         let heightLeft = imgHeight; 
//         const pdf = new jsPDF('p', 'mm', 'a4'); 
//         let position = 0;
  
//         pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
//         heightLeft -= pageHeight; 
  
//         while (heightLeft >= 0) {
//           position = heightLeft - imgHeight;
//           pdf.addPage();
//           pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
//           heightLeft -= pageHeight; 
//         }
  
//         pdf.save('Booking_Invoice.pdf');
//       }).catch(err => {
//         console.error('Error generating PDF:', err);
//       });
//     } else {
//       console.error('Element not found for printing.');
//     }
//   }
  

//   onClose() {
    
//     this.dialogRef.close();
//   }
// }
import { Component, Input, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailsService } from '../details.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Room } from '../room.interface';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmComponent } from '../confirm/confirm.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MatDialog } from '@angular/material/dialog';
// import { MyDialogComponent } from './my-dialog/my-dialog.component'; // Adjust the path accordingly



declare var $: any;

@Component({
  selector: 'app-createbookingmodal',
  templateUrl: './createbookingmodal.component.html',
  styleUrl: './createbookingmodal.component.css',
})
export class CreatebookingmodalComponent implements OnInit {
  @Input() stayDateFrom!: Date;
  @Input() stayDateTo!: Date;
  uniqueLocations: string[] = [];
  filteredRooms: Room[] = [];
  bookingForm!: FormGroup;
  summaryForm!: FormGroup;
  paymentForm!: FormGroup;
  totalPrice: number = 0;
  stepIndex: number = 0;
  isExistingCustomer: boolean = false;
  existingCustomers: any[] = [];
  selectedRoom: any;
  paymentMode: 'online' | 'cash' = 'online';
  currentdate = new Date().toISOString().split('T')[0];
  showConfirmation = false;
  availableRooms: any[] = [];
  totalRoomData: Room[] = [];
  rooms: Room[] = [];
  data1: Room[] = [];
  datesLoaded: boolean = false;
  validDates: Set<string> = new Set();
  arrivalDates: Date[] = [];
  arrive: any[] = [];
  departureDates: Date[] = [];
  selectedArrivalDate: string | null = null;
  selectedDepartureDate: string | null = null;
  guestsNUmbers: number[] = [];
  bookings: {
    bookingDetails: { fullName: string };
    summary: { roomId: number; stayDateFro: string; stayDateTo: string };
    status: string;
  }[] = [];
  isRoomSelected = false;
  selectedroom:any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private detailsService: DetailsService,
    public dialogRef: MatDialogRef<CreatebookingmodalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.initialize();

    this.detailsService.getCombinedData().subscribe((rooms) => {
      this.filteredRooms = rooms;
      this.totalRoomData = rooms;
      this.data1 = rooms || [];
      console.log('Merged data in Booking:', this.data1);
      let validDates: Set<string> = new Set();
      const currentDate = moment().startOf('day');
      const bookDateFromArray: string[] = [];
      rooms.forEach((room) => {
        room.stays.forEach((stay) => {
          const bookDateFrom = stay?.bookDateFrom
            ? moment(stay.bookDateFrom, 'YYYY-MM-DD').startOf('day')
            : currentDate;
          const bookDateTo = stay?.bookDateTo
            ? moment(stay.bookDateTo, 'YYYY-MM-DD').startOf('day')
            : moment(stay.stayDateTo)
                .subtract(stay.minStay + (stay.minDeviation || 0), 'days')
                .startOf('day');
          const stayDateFro = moment(stay.stayDateFrom, 'YYYY-MM-DD').startOf(
            'day'
          );
          const stayDateTo = moment(stay.stayDateTo, 'YYYY-MM-DD').startOf(
            'day'
          );
          const minDeviation = stay.minDeviation || 0;
          const maxDeviation = stay.maxDeviation || Infinity;
          const arrivalDays = stay.arrivalDays || [];
          const minArrivalDate = currentDate.clone().add(minDeviation, 'days');
          const maxArrivalDate = currentDate.clone().add(maxDeviation, 'days');
          //   console.log('Booking From:', bookDateFrom);
          // console.log('Booking To:', bookDateTo);
          // console.log('Min Deviation:', minDeviation);
          // console.log('Max Deviation:', maxDeviation);
          bookDateFromArray.push(bookDateFrom.format('YYYY-MM-DD'));
          if (currentDate.isBetween(bookDateFrom, bookDateTo, 'day', '[]')) {
            for (
              let i = stayDateFro.clone();
              i.isSameOrBefore(
                stayDateTo.clone().subtract(stay.minStay || 0, 'days')
              );
              i.add(1, 'day')
            ) {
              const isOnArrivalDays =
                arrivalDays.length > 0 ||
                arrivalDays.includes(i.format('ddd').toUpperCase());
              const isValidForMinDeviation = i.isSameOrAfter(minArrivalDate);
              const isValidForMaxDeviation = i.isSameOrBefore(maxArrivalDate);

              if (
                isOnArrivalDays &&
                isValidForMinDeviation &&
                isValidForMaxDeviation
              ) {
                validDates.add(i.format('YYYY-MM-DD'));
              }
            }
          }
        });
      });
      console.log(' bookdatefrom all da\n', bookDateFromArray.toLocaleString());
      // console.log('valid dates ', validDates);

      this.arrivalDates = Array.from(validDates).map((dateString) =>
        moment(dateString, 'YYYY-MM-DD').toDate()
      );
      this.datesLoaded = true;
      this.arrive = this.arrivalDates;
      console.log('Arrival Dates:', this.arrivalDates.toLocaleString());
    });
    this.loadBookingsFromLocalStorage();
  }

ngOnInit(): void {
  this.subscribeToFormChanges();
  this.updatePaymentTotal();
}

  initialize() {
    this.bookingForm = this.fb.group({
      existingCustomer: [''],
      customerId: [''],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      birthDate: ['', Validators.required],
      address: ['', Validators.required],
    });

    this.loadExistingCustomers();

    if (!this.isExistingCustomer) {
      this.generateCustomerId();
    }
    this.summaryForm = this.fb.group({
      roomId: [''],
      locationName: [''],
      roomName: [''],
      guestCapacity: ['', Validators.required],
      stayDateFro: ['', Validators.required],
      stayDateTo: ['', Validators.required],
      pricePerPerson: [''],
      totalPrice: [''],
      numberOfDays: [''],
      arrivalDays: [''],
      departureDays: [''],

      minStay: [''],
      maxStay: [''],
    });

    this.paymentForm = this.fb.group({
      cardNumber: ['', Validators.required],
      cardName: ['', Validators.required],
      expirationDate: ['', Validators.required],
      cvv: ['', Validators.required],
      totalAmount:[{value:'',disabled:true}],
      paidAmount: [{ value: '', disabled: this.paymentMode !== 'cash' }],
      dueAmount: [{ value: '', disabled: this.paymentMode !== 'cash' }],
    });

  }

  subscribeToFormChanges() {
    this.summaryForm.get('guestCapacity')?.valueChanges.subscribe(() => {
      this.filterAvailableRooms();
    });

    this.summaryForm.get('stayDateFro')?.valueChanges.subscribe(() => {
      this.filterAvailableRooms();
    });

    this.summaryForm.get('stayDateTo')?.valueChanges.subscribe(() => {
      this.filterAvailableRooms();
    });

    // Subscribe to changes in paidAmount
    this.paymentForm.get('paidAmount')?.valueChanges.subscribe(() => {
      this.updateDueAmount();
    });
  }

  onGuestCapacityChange(event: any): void {
    this.filterAvailableRooms();
  }

  print() {
    console.log('arival', this.arrivalDates);
  }

  onArrivalDateChange(event: any): void {
    // Loop through each room
    const selectedDate = moment(event.value).format('YYYY-MM-DD');
    const currentDate = moment(new Date()).format('YYYY-MM-DD');

    let departureDateSet: Set<string> = new Set();
    this.selectedArrivalDate = selectedDate;
    const arrivalDate = moment(selectedDate).format('YYYY-MM-DD');
    this.data1.forEach((room) => {
      let roomAvailable = false;
      let count = 0;
      // Iterate through all stays of the room
      room.stays.forEach((stay) => {
        count++;
        const stayDateFrom = moment(stay.stayDateFrom).format('YYYY-MM-DD');
        const stayDateTo = moment(stay.stayDateTo).format('YYYY-MM-DD');
        const minStay = stay.minStay;
        const maxStay = stay.maxStay;
        const bookDateFrom = stay.bookDateFrom
          ? moment(stay.bookDateFrom).format('YYYY-MM-DD')
          : null;
        const bookDateTo = stay.bookDateTo
          ? moment(stay.bookDateTo).format('YYYY-MM-DD')
          : null;
        const minDeviation = stay.minDeviation;
        const maxDeviation = stay.maxDeviation;
        const arrivalDays = stay.arrivalDays.map((day) => day.toUpperCase());
        const departureDays = stay.departureDays.map((day) =>
          day.toUpperCase()
        );
        const bookedRooomsByRoomId = this.bookings.filter(
          (booking) => booking.summary.roomId === room.roomId
        );

        const isOnArrivalDays =
          arrivalDays.length > 0
            ? arrivalDays.includes(
                moment(arrivalDate).format('ddd').toUpperCase()
              )
            : true;
        const isBetweenBookFromAndToDate = moment(arrivalDate).isBetween(
          bookDateFrom,
          bookDateTo,
          'day',
          '[]'
        );
        const isBetweenStayFromAndToDate = moment(arrivalDate).isBetween(
          stayDateFrom,
          stayDateTo,
          'day',
          '[]'
        );
        const isValidForMinDeviation = moment(arrivalDate).isSameOrAfter(
          moment(new Date()).add(stay.minDeviation, 'days').startOf('day')
        );
        const isValidForMaxDeviation = moment(arrivalDate).isSameOrBefore(
          moment(new Date()).add(stay.maxDeviation, 'days').startOf('day')
        );
        // console.log(`Processing stay #${count} for roomId ${room.roomId}`);

        // console.log('Selected Date:', selectedDate);
        // console.log('Booking From:', bookDateFrom);
        // console.log('Booking To:', bookDateTo);
        // console.log('Min Deviation:', minDeviation);
        // console.log('Max Deviation:', maxDeviation);

        if (
          isOnArrivalDays &&
          isBetweenStayFromAndToDate &&
          isBetweenBookFromAndToDate &&
          isValidForMinDeviation &&
          isValidForMaxDeviation
        ) {
          for (
            let i = moment(arrivalDate);
            i <= moment(stayDateTo).subtract(stay.minStay, 'days');
            i = i.add(1, 'days')
          ) {
            let isOverlapping = false;
            bookedRooomsByRoomId.forEach((booking) => {
              const checkIn = moment(booking.summary.stayDateFro).format(
                'YYYY-MM-DD'
              );
              const checkOut = moment(booking.summary.stayDateTo).format(
                'YYYY-MM-DD'
              );
              if (
                moment(i).isBetween(
                  moment(checkIn),
                  moment(checkOut),
                  'day',
                  '[]'
                ) ||
                moment(i)
                  .clone()
                  .add(stay.minStay, 'days')
                  .isBetween(moment(checkIn), moment(checkOut), 'day', '[]') ||
                moment(i)
                  .clone()
                  .add(stay.maxStay, 'days')
                  .isBetween(moment(checkIn), moment(checkOut), 'day', '[]')
              ) {
                isOverlapping = true;
              }
            });
            const isValidForMinStay = moment(i).isSameOrAfter(
              moment(arrivalDate).add(stay.minStay, 'days').startOf('day'),
              'day'
            );
            const isValidForMaxStay = moment(i).isSameOrBefore(
              moment(arrivalDate).add(stay.maxStay, 'days').startOf('day'),
              'day'
            );
            const isOnDepartureDays =
              departureDays.length > 0
                ? departureDays.includes(moment(i).format('ddd').toUpperCase())
                : true;

            if (
              isValidForMinStay &&
              isValidForMaxStay &&
              isOnDepartureDays &&
              !isOverlapping
            ) {
              departureDateSet.add(moment(i).format('YYYY-MM-DD'));
            }
          }
        }
      });
      console.log(`Total stays processed for roomId ${room.roomId}: ${count}`);
      this.departureDates = Array.from(departureDateSet).map((dateString) =>
        moment(dateString, 'YYYY-MM-DD').toDate()
      );
      console.log('departure dates: ', this.departureDates);

      if (roomAvailable) {
        this.filterAvailableRooms();
      }
    });
  }

  arrivaldateFilter = (d: Date | null): boolean => {
    if (!d) return false;
    // this.fetchValidDates();
    // if (!this.datesLoaded) return false;
    console.log('arrival ib datefilter', this.arrivalDates.toLocaleString());
    // return true;
    const availableDates = this.arrivalDates.map((date) =>
      moment(date).format('YYYY-MM-DD')
    );
    return availableDates.includes(moment(d).format('YYYY-MM-DD'));
  };

  departuredatefilter = (d: Date | null): boolean => {
    if (!d) return false;
    const availableDates = this.departureDates.map((date) =>
      moment(date).format('YYYY-MM-DD')
    );
    return availableDates.includes(moment(d).format('YYYY-MM-DD'));
  };

  onDepartureDateChange(event: any): void {
    this.data1.forEach((room) => {
      const selectedDate = moment(event.value).format('YYYY-MM-DD');
      const currentDate = moment(new Date());
      this.selectedDepartureDate = selectedDate;
      room.stays.forEach((stay) => {
        const stayDateFrom = moment(stay.stayDateFrom).format('YYYY-MM-DD');
        const stayDateTo = moment(stay.stayDateTo).format('YYYY-MM-DD');
        const arrivalDays = stay?.arrivalDays.map((item) => item.toUpperCase());
        const departureDays = stay?.departureDays.map((item) =>
          item.toUpperCase()
        );
        const isMinDaviationValid = stay?.minDeviation
          ? moment(this.selectedArrivalDate).diff(stayDateFrom, 'hours') / 24 >=
            stay.minDeviation
          : true;
        const isMaxDaviationValid = stay?.maxDeviation
          ? moment(this.selectedArrivalDate).diff(stayDateFrom, 'hours') / 24 <=
            stay.maxDeviation
          : true;

        if (
          (arrivalDays.length > 0
            ? arrivalDays.includes(
                moment(this.selectedArrivalDate).format('ddd').toUpperCase()
              )
            : true) &&
          (departureDays.length > 0
            ? departureDays.includes(
                moment(this.selectedDepartureDate).format('ddd').toUpperCase()
              )
            : true) &&
          isMinDaviationValid &&
          isMaxDaviationValid
        ) {
          const numberOfDays = Math.ceil(
            moment(this.selectedDepartureDate)
              .hours(10)
              .diff(moment(this.selectedArrivalDate).hours(11), 'hours') / 24
          );

          if (numberOfDays >= stay.minStay && numberOfDays <= stay.maxStay) {
            this.rooms.push(room);
          }
        }
      });
      if (
        this.selectedArrivalDate &&
        this.selectedDepartureDate &&
        this.rooms.length > 0
      ) {
        this.guestsNUmbers = [];
        const maxGuest = Math.max(
          ...this.rooms.map((room) => room.guestCapacity)
        );
        for (let i = 1; i <= maxGuest; i++) {
          this.guestsNUmbers.push(i);
        }
      }
      this.filterAvailableRooms();
    });
  }

  filterAvailableRooms(): void {
    const arrivalDate = moment(
      this.summaryForm?.get('stayDateFro')?.value
    ).format('YYYY-MM-DD');
    const departureDate = moment(
      this.summaryForm?.get('stayDateTo')?.value
    ).format('YYYY-MM-DD');
    const guestCapacity = this.summaryForm.get('guestCapacity')?.value;
    console.log('arr', arrivalDate);
    console.log('dep', departureDate);
    console.log('guest', guestCapacity);

    this.filteredRooms = this.totalRoomData;
    let roomsToFilter = [...this.totalRoomData];

    if (guestCapacity) {
      roomsToFilter = roomsToFilter.filter(
        (room) => room.guestCapacity >= guestCapacity
      );
    }
    // console.log('After guest filter:', roomsToFilter);

    if (arrivalDate && departureDate) {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const occupyroomid: Set<number> = new Set();
      for (let i = 0; i < bookings.length; i++) {
        const bookfrom = moment(bookings[i].summary.stayDateFro).format(
          'YYYY-MM-DD'
        );
        const bookto = moment(bookings[i].summary.stayDateTo).format(
          'YYYY-MM-DD'
        );
        const roomID = bookings[i].summary.roomId;
        // console.log("bookfrom",bookfrom);
        // console.log("bookto",bookto);
        // console.log("roomidsdf",roomID);
        const isoverlap =
          arrivalDate && departureDate
            ? arrivalDate <= bookto && departureDate >= bookfrom
            : true;
        if (isoverlap) {
          occupyroomid.add(roomID);
        }
      }
      roomsToFilter = roomsToFilter.filter(
        (room) => !occupyroomid.has(room.roomId)
      );
    }
    const numberOfNights =
      arrivalDate && departureDate
        ? moment(departureDate).diff(moment(arrivalDate), 'days')
        : 0;

    this.filteredRooms = roomsToFilter.map((room) => ({
      ...room,
      numberOfNights,
      totalPrice:
        room.pricePerDayPerPerson * (guestCapacity || 1) * numberOfNights,
    }));

    this.filteredRooms = roomsToFilter;
    this.updatePaymentTotal();
    this.filteredRooms.sort(
      (a, b) => a.pricePerDayPerPerson - b.pricePerDayPerPerson
    );

    if (arrivalDate && departureDate) {
      const numberOfNights = moment(departureDate).diff(
        moment(arrivalDate),
        'days'
      );

      this.filteredRooms.forEach((room) => {
        room.numberOfNights = numberOfNights || 0;
        room.totalPrice =
          room.pricePerDayPerPerson *
          (guestCapacity || 1) *
          (numberOfNights || 1);
      });
    }
  }
  loadExistingCustomers(): void {
    const existingData = JSON.parse(localStorage.getItem('bookings') || '[]');
    this.existingCustomers = existingData.map(
      (booking: any) => booking.bookingDetails
    );
  }

  setCustomerMode(mode: string): void {
    this.isExistingCustomer = mode === 'existing';
    if (this.isExistingCustomer) {
      this.bookingForm.reset({
        existingCustomer: '',
      });
    } else {
      this.generateCustomerId();
    }
  }

  generateCustomerId(): void {
    const randomId = 'CUS' + Math.floor(Math.random() * 1000000).toString();
    this.bookingForm.patchValue({ customerId: randomId });
  }

  fillExistingCustomerDetails(event: any): void {
    const selectedCustomerId = event.value;
    const customerData = this.existingCustomers.find(
      (c) => c.customerId === selectedCustomerId
    );
    if (customerData) {
      this.bookingForm.patchValue({
        customerId: customerData.customerId,
        fullName: customerData.fullName,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        birthDate: customerData.birthDate,
      });
    }
  }

  loadBookingsFromLocalStorage() {
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
      this.bookings = JSON.parse(storedBookings);
      console.log('Bookings Loaded:', this.bookings);
    }
  }
  setPaymentMethod(method: 'online' | 'cash'): void {
    this.paymentMode = method;
    if (method === 'cash') {
      this.paymentForm.get('paidAmount')?.enable();
      this.paymentForm.get('dueAmount')?.enable();
      this.paymentForm.get('cardNumber')?.clearValidators();
      this.paymentForm.get('cardName')?.clearValidators();
      this.paymentForm.get('expirationDate')?.clearValidators();
      this.paymentForm.get('cvv')?.clearValidators();

      this.paymentForm.get('paidAmount')?.setValidators([Validators.required]);
      this.paymentForm.get('dueAmount')?.setValidators([Validators.required]);
    } else {
      // this.paymentForm.get('paidAmount')?.enable();
      // this.paymentForm.get('dueAmount')?.disable();
      this.paymentForm.get('paidAmount')?.clearValidators();
      this.paymentForm.get('dueAmount')?.clearValidators();

      this.paymentForm.get('cardNumber')?.setValidators([Validators.required]);
      this.paymentForm.get('cardName')?.setValidators([Validators.required]);
      this.paymentForm
        .get('expirationDate')
        ?.setValidators([Validators.required]);
      this.paymentForm.get('cvv')?.setValidators([Validators.required]);
    }
    this.paymentForm.get('cardNumber')?.updateValueAndValidity();
    this.paymentForm.get('cardName')?.updateValueAndValidity();
    this.paymentForm.get('expirationDate')?.updateValueAndValidity();
    this.paymentForm.get('cvv')?.updateValueAndValidity();
    this.paymentForm.get('paidAmount')?.updateValueAndValidity();
    this.paymentForm.get('dueAmount')?.updateValueAndValidity();
  }
  updatePaymentTotal(): void {
    // if (this.selectedRoom) {
    //   const totalPrice = this.selectedRoom.totalPrice;
    //   this.paymentForm.get('totalAmount')?.setValue(totalPrice);
    // } else {
    //   this.paymentForm.get('totalAmount')?.setValue(0);
    // }
    if (this.selectedroom) {
      const guestCapacity = this.summaryForm.get('guestCapacity')?.value || 1;
      const numberOfNights = this.selectedroom.numberOfNights || 1;
      const roomPricePerDay = this.selectedroom.pricePerDayPerPerson || 0;
  
      // Calculate total price
      const totalPrice = roomPricePerDay * guestCapacity * numberOfNights;
  
      // Update the payment form
      this.paymentForm.get('totalAmount')?.setValue(totalPrice);
  
      // If there's any paid amount, update the due amount
      this.updateDueAmount();
    }
  }


  updateDueAmount(): void {
    const totalAmount = this.paymentForm.get('totalAmount')?.value || 0;
    const paidAmount = this.paymentForm.get('paidAmount')?.value || 0;
    const dueAmount = totalAmount - paidAmount;
    
    // Update due amount
    this.paymentForm.get('dueAmount')?.setValue(dueAmount);
}
  
  selectRoom(room: any): void {
    this.isRoomSelected = true;
    this.stepIndex = 1;
    this.selectedroom = room;
    this.summaryForm.patchValue({
      roomId: room.roomId,
      locationName: room.locationName,
      roomName: room.roomName,
      guestCapacity: room.guestCapacity,
      pricePerPerson: room.pricePerDayPerPerson,
      totalPrice: room.totalPrice,
      numberOfDays: room.numberOfNights, 
      arrivalDays: room.arrivalDays,
      departureDays: room.departureDays,
      minStay: room.minStay,
      maxStay: room.maxStay,
    });
    this.paymentForm.get('totalAmount')?.setValue(room.totalPrice);

    
    this.paymentForm.get('dueAmount')?.setValue(room.totalPrice);
    this.updatePaymentTotal();
  }

  onStepChange(event: any): void {
    console.log('Step changed:', event);
  }

  onSubmit(): void {
    if (this.paymentMode === 'cash') {
      if (
        this.paymentForm.get('dueAmount')?.invalid ||
        this.paymentForm.get('paidAmount')?.invalid
      ) {
        this.paymentForm.markAllAsTouched();
        return;
      }
    } else {
      if (this.paymentForm.invalid) {
        this.paymentForm.markAllAsTouched();
        return;
      }
    }
    if (
      this.bookingForm.valid &&
      this.paymentForm.valid &&
      this.summaryForm.valid
    ) {
      const formattedStayDateFro = moment(
        this.summaryForm.get('stayDateFro')?.value
      ).format('YYYY-MM-DD');
      const formattedStayDateTo = moment(
        this.summaryForm.get('stayDateTo')?.value
      ).format('YYYY-MM-DD');
      const bookingData = {
        bookingId: new Date().getTime(),
        summary: {
          ...this.summaryForm.value,
          stayDateFro: formattedStayDateFro,
          stayDateTo: formattedStayDateTo,
        },
        bookingDetails: this.bookingForm.value,
        payment: {
          ...this.paymentForm.value,
          totalAmount: this.paymentForm.get('totalAmount')?.value,
          paidAmount: this.paymentForm.get('paidAmount')?.value,
          dueAmount: this.paymentForm.get('dueAmount')?.value,
        },
        status: 'New',
      };
      const existingData = JSON.parse(localStorage.getItem('bookings') || '[]');
      existingData.push(bookingData);
      localStorage.setItem('bookings', JSON.stringify(existingData));
      console.log('Form submitted', this.bookingForm.value);
      console.log('Booking Summary', this.summaryForm.value);
      console.log('Payment Details', this.paymentForm.value);

      this.dialogRef.close();
    }
  }
  
  printInvoice(): void {
    const data = document.getElementById('booking-preview');
    if (data) {
      html2canvas(data, { scale: 2 }).then((canvas) => { 
        const imgWidth = 208; 
        const pageHeight = 295; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width; 
        let heightLeft = imgHeight; 
        const pdf = new jsPDF('p', 'mm', 'a4'); 
        let position = 0;
  
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight; 
  
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight; 
        }
  
        pdf.save('Booking_Invoice.pdf');
      }).catch(err => {
        console.error('Error generating PDF:', err);
      });
    } else {
      console.error('Element not found for printing.');
    }
  }
  

  onClose() {
    
    this.dialogRef.close();
  }
}
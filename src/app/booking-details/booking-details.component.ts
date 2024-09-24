import { Component, Input, OnInit } from '@angular/core';
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
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../confirm/confirm.component';

declare var $: any;
@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.css',
})
export class BookingDetailsComponent implements OnInit {
  @Input() selectedRoom!: Room;
  @Input() stayDateFrom!: Date;
  @Input() stayDateTo!: Date;
  filteredRooms: Room[] = [];
  bookingForm!: FormGroup;
  summaryForm!: FormGroup;
  paymentForm!: FormGroup;
  totalPrice: number = 0;
  stepIndex: number = 0;
  isExistingCustomer: boolean = false;
  existingCustomers: any[] = [];
  paymentMode: 'online' | 'cash' = 'online';
  currentdate=new Date().toISOString().split('T')[0];
  showConfirmation=false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public activeModal: NgbActiveModal,
    private detailsService: DetailsService, private cdr: ChangeDetectorRef,private dialog: MatDialog
  ) {
    this.detailsService.getCombinedData().subscribe((rooms) => {
      this.filteredRooms = rooms;
      console.log('Merged data in Booking:', this.filteredRooms);
    });
  }

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
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

    const state = history.state;
    if (state && state.room) {
      this.selectedRoom = state.room;
    }
    console.log('seelect', this.selectedRoom);

    let mergedArrivalDays: string[] = [];
    let mergedDeaprturedays:string[]=[];
    this.selectedRoom.stays.forEach((stay) => {
      mergedArrivalDays = mergedArrivalDays.concat(stay.arrivalDays);
      mergedDeaprturedays=mergedDeaprturedays.concat(stay.departureDays);
    });
    console.log('mergearrival',mergedArrivalDays);
    console.log('mergedeparture',mergedDeaprturedays);
    const stays = this.selectedRoom.stays;
    
    this.summaryForm = this.fb.group({
      roomId: [this.selectedRoom.roomId],
      locationName: [this.selectedRoom.locationName],
      roomName: [this.selectedRoom.roomName],
      guestCapacity: [this.selectedRoom.guestCapacity, Validators.required],
      stayDateFro: [this.stayDateFrom ? moment(this.stayDateFrom).format('YYYY-MM-DD') :'' ,
        [Validators.required, this.arrivaldatevalidation.bind(this)],
      ],
      stayDateTo: [this.stayDateTo ? moment(this.stayDateTo).format('YYYY-MM-DD'):'',
        [Validators.required, this.departuredatevalidation.bind(this)],
      ],

      pricePerPerson: [this.selectedRoom.pricePerDayPerPerson],
      totalPrice: [this.totalPrice],
      numberOfDays: [''],
      arrivalDays: [mergedArrivalDays],
      departureDays:[mergedDeaprturedays],
      minStay: [Math.min(...stays.map(stay => stay.minStay || Infinity))],
      maxStay: [Math.max(...stays.map(stay => stay.maxStay || -Infinity))], 
      minBookDateFrom : [moment.min(stays.map(stay => moment(stay.bookDateFrom, 'YYYY-MM-DD') || moment()))],
      maxBookDateTo : [moment.max(stays.map(stay => moment(stay.bookDateTo, 'YYYY-MM-DD') || moment()))],
      minDeviation :[Math.min(...stays.map(stay => stay.minDeviation || 0))],
      maxDeviation :[ Math.max(...stays.map(stay => stay.maxDeviation || Infinity))]
      
    });
   
console.log('dnf',this.summaryForm?.get('stayDateFro')?.value);

    this.paymentForm = this.fb.group({
      cardNumber: ['', Validators.required],
      cardName: ['', Validators.required],
      expirationDate: ['', Validators.required],
      cvv: ['', Validators.required],
      paidAmount: [{ value: '', disabled: this.paymentMode !== 'cash' }],
      dueAmount: [{ value: '', disabled: this.paymentMode !== 'cash' }],
    });

    this.calculateTotalPrice();
  }

  arrivaldatevalidation(control: AbstractControl): ValidationErrors | null {
    const selectdate = moment(control.value,'YYYY-MM-DD');
    const bookDateFrom = moment(this.summaryForm?.get('bookDateFrom')?.value,'YYYY-MM-DD');
    const bookDateTo = moment(this.summaryForm?.get('bookDateTo')?.value,'YYYY-MM-DD');
    const minDeviation = this.summaryForm?.get('minDeviation')?.value;
    const maxDeviation = this.summaryForm?.get('maxDeviation')?.value;
    const dateto = moment(
      this.selectedRoom.stays[0]?.stayDateFrom || 
      this.selectedRoom.stays[1]?.stayDateFrom,'YYYY-MM-DD'
    );
    
    const datefrom = moment(
      this.selectedRoom.stays[0]?.stayDateTo || 
      this.selectedRoom.stays[1]?.stayDateTo,'YYYY-MM-DD'
    );
    const arrivaldays:string[]=(this.summaryForm?.get('arrivalDays')?.value || []).map((day: string) => day.toLowerCase());
    const selectedDay = selectdate.format('ddd').toLowerCase();
    const roomno = this.summaryForm?.get('roomId')?.value;
    const currentdate=moment(new Date());
    const deviation = Math.ceil((selectdate.toDate().getTime()-currentdate.toDate().getTime())/(1000*3600*24));
    console.log('dates', selectdate);
    console.log('bookfrom', bookDateFrom);
    console.log('bookto',bookDateTo);
    console.log("current date",currentdate);
    console.log("deviation",deviation);
    console.log('arrdays',arrivaldays);
    console.log('roomid',roomno);
    
    if (!selectdate.isValid() ) {
      return { invalidDate: 'Invalid date ' };
    }
    if (selectdate.isBefore(currentdate)) {
      return { pastDate: 'Check-in date cannot be in the past' };
    }
    if (currentdate <bookDateFrom ) {
      console.log("coming here");
      
      return { bookingDateValidation: `You can book after or on ${bookDateFrom.format('YYYY-MM-DD')} Date}` };
    }
    if (currentdate > bookDateTo ) {
      console.log("coming here 2");
      
      return { bookingDateValidation: `You should have book before or on ${bookDateTo.format('YYYY-MM-DD')} Date` };
    }
    if (deviation < minDeviation) {
      return { minDeviationViolation: `You can Book at least ${minDeviation} days before the arrival date` };
    }
  
    if (deviation > maxDeviation) {
      return { maxDeviationViolation: `You cannot book ${maxDeviation} days before the arrival date` };
    }
    if (selectdate.isBefore(dateto) || selectdate.isAfter(datefrom)) {
      return { checkInDateValidation: `Check-in date must be between ${dateto.format('YYYY-MM-DD')} and ${datefrom.format('YYYY-MM-DD')}` };
    }
    
    if (!arrivaldays.includes(selectedDay)) {
      return { checkInDateValidation: `Check-in date must be on ${arrivaldays.join(', ')}` };
    }
    if (roomno) {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      for (const booking of bookings) {
          const bookingStart =booking.summary.stayDateFro ?  moment(booking.summary.stayDateFro) : moment();
          const bookingEnd =booking.summary.stayDateTo ?  moment(booking.summary.stayDateTo) : moment();
          const storedRoomNo = booking.summary.roomId;
        // console.log("bookingstart",bookingStart);
        // console.log("booking hjbvjsdbvjksdvkjsvkjsvkjbskjvbjkvb",booking)
        
          if (
              storedRoomNo === roomno && ((selectdate>=bookingStart && selectdate <=bookingEnd)|| (selectdate<dateto && selectdate>datefrom))
          ) {
              return { roomUnavailable: 'Room is already booked for the selected check-in date' };
          }
      }
  }
    return null;
  }
  // selectdate.isBetween(bookingStart, bookingEnd, undefined, '[]')
  // (selectdate.isSame(bookingStart) && selectdate.isSame('day'))
  departuredatevalidation(control: AbstractControl): ValidationErrors | null {
    const selectDate=moment(control.value);
    const dateTo = moment(this.summaryForm?.get('stayDateFro')?.value);
    const datefrom =moment(
      this.selectedRoom.stays[0]?.stayDateTo || 
      this.selectedRoom.stays[1]?.stayDateTo
    );
    const maxDeviation = this.summaryForm?.get('maxDeviation')?.value;
    const departuredays:string[]=(this.summaryForm?.get('departureDays')?.value || []).map((day: string) => day.toLowerCase());
    const selectedday=selectDate.format('ddd').toLowerCase();
    const minstay = this.summaryForm?.get('minStay')?.value;
    const maxstay = this.summaryForm?.get('maxStay')?.value;
    const roomno = this.summaryForm?.get('roomId')?.value;
    const numberofdays = Math.ceil((selectDate.toDate().getTime()-dateTo.toDate().getTime())/(1000*3600*24));
    const currentdate=moment(new Date());
    const deviation = Math.ceil((selectDate.toDate().getTime()-currentdate.toDate().getTime())/(1000*3600*24));
    // console.log('noofdays',numberofdays);
    console.log("deviation depar",deviation);
    
    
    if (!selectDate.isValid() ) {
      return { invalidDate: 'Invalid date' };
    }
    if (selectDate.isBefore(currentdate)) {
      return { pastDate: 'Check-in date cannot be in the past' };
    }
    if (selectDate.isBefore(dateTo)) {
      return { invalidDate: 'Check-out date must be after check-in date' };
    }

    if (selectDate.isAfter(datefrom)) {
      return { futureDate: `Check-out date cannot be after ${datefrom.format('YYYY-MM-DD')}` };
    }

    if (!departuredays.includes(selectedday)) {
      return { checkOutDateValidation: `Check-out date must be on ${departuredays.join(', ')}` };
    }
    if (deviation > maxDeviation) {
      return { maxDeviationViolation: `You cannot book more than ${maxDeviation} days before the departure date` };
  }
    if (numberofdays < minstay) {
      return { minStayViolation: `Stay must be at least ${minstay} days` };
    }
    if (numberofdays > maxstay) {
      return { maxStayViolation: `Stay cannot exceed ${maxstay} days` };
    }

    if (roomno) {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      for (const booking of bookings) {
        const bookingData = booking.summary;
        const bookingStart = moment(bookingData.stayDateFro);
        const bookingEnd = moment(bookingData.stayDateTo);
        const storedRoomId = bookingData.roomId;
  
        if (
          storedRoomId === roomno && ((selectDate > bookingStart && selectDate <= bookingEnd) || (selectDate > bookingEnd && dateTo < bookingStart))
        ) {
          return { roomUnavailable: 'Room is already booked for the selected departure date' };
        }
      }
    }
    return null;
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
      this.bookingForm.reset();
    } else {
      this.generateCustomerId();
    }
  }

  generateCustomerId(): void {
    const randomId = 'CUS' + Math.floor(Math.random() * 1000000).toString();
    this.bookingForm.patchValue({ customerId: randomId });
  }

  fillExistingCustomerDetails(event: any): void {
    const selectedCustomerId = event.target.value;
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

  calculateTotalPrice(): void {
    const guestCapacity = this.summaryForm.get('guestCapacity')?.value || 0;
    const pricePerPerson = this.selectedRoom.pricePerDayPerPerson;
    const arrivalDate = this.summaryForm?.get('stayDateFro')?.value
      ? new Date(this.summaryForm?.get('stayDateFro')?.value)
      : null;
    const departureDate = this.summaryForm?.get('stayDateTo')?.value
      ? new Date(this.summaryForm?.get('stayDateTo')?.value)
      : null;

    console.log('Arrival Date:', arrivalDate);
    console.log('Departure Date:', departureDate);

    let numberOfDays = 1;
    if (arrivalDate && departureDate) {
      numberOfDays =
        Math.ceil(
          (departureDate.getTime() - arrivalDate.getTime()) / (1000 * 3600 * 24)
        ) ;
    }
    this.totalPrice = guestCapacity * pricePerPerson * numberOfDays;
    console.log('total', this.totalPrice);

    this.summaryForm.patchValue({
      totalPrice: this.totalPrice,
      numberOfDays: numberOfDays,
    });
    console.log('days', numberOfDays);

    if (this.paymentMode === 'cash') {
      this.paymentForm.patchValue({ paidAmount: this.totalPrice });
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

  updateDueAmount(): void {
    const paidAmount = this.paymentForm.get('paidAmount')?.value || 0;
    this.paymentForm.patchValue({
      dueAmount: this.totalPrice - paidAmount,
    });
  }

  next(): void {
    if (this.stepIndex === 0 && this.summaryForm.invalid) {
      this.summaryForm.markAllAsTouched();
      return;
    }

    if (this.stepIndex === 1 && this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    if (this.stepIndex < 2) {
      this.stepIndex++;
    }
  }
  previousStep(): void {
    if (this.stepIndex > 0) {
      this.stepIndex--;
    }
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
      const bookingData = {
        bookingId: new Date().getTime(),
        summary: this.summaryForm.value,
        bookingDetails: this.bookingForm.value,
        payment: this.paymentForm.value,
        status: 'New',
      };
      const existingData = JSON.parse(localStorage.getItem('bookings') || '[]');
      existingData.push(bookingData);
      localStorage.setItem('bookings', JSON.stringify(existingData));
      console.log('Form submitted', this.bookingForm.value);
      console.log('Booking Summary', this.summaryForm.value);
      console.log('Payment Details', this.paymentForm.value);

      this.activeModal.close('booking confirmed');
      // alert('Booking confirmed successfully!');
      
      this.dialog.open(ConfirmComponent, {
        disableClose: true, 
        panelClass: 'custom-dialog-container'
      });
    }
  }
  
}

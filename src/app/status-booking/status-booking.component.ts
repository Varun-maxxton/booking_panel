import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Room } from '../room.interface';
import moment from 'moment';

@Component({
  selector: 'app-status-booking',
  templateUrl: './status-booking.component.html',
  styleUrl: './status-booking.component.css',
})
export class StatusBookingComponent implements OnInit {
  statuses: string[] = [
    'Confirmed',
    'Cancelled',
    'New',
    'Checked-In',
    'Checked-Out',
  ];
  selectedStatus!: string;
  @Input() roomId!: number;
  @Input() startDate!: Date;
  @Input() endDate!: Date;

  fullName!: string;
  stayDateFrom!: string;
  stayDateTo!: string;

  bookings: {
    bookingDetails: { fullName: string };
    summary: { roomId: number; stayDateFro: string; stayDateTo: string };
    status: string;
  }[] = [];

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = this.bookings.find(
      (booking) =>
        booking.summary.roomId === this.roomId &&
        new Date(this.startDate) >= new Date(booking.summary.stayDateFro) &&
        new Date(this.endDate) <= new Date(booking.summary.stayDateTo)
    );
    if (booking) {
      this.selectedStatus = booking.status;
      this.fullName = booking.bookingDetails?.fullName;
      this.stayDateFrom = moment(booking.summary.stayDateFro).format('DD-MMM-YY');
      this.stayDateTo = moment(booking.summary.stayDateTo).format('DD-MMM-YY');
      console.log('status', this.selectedStatus);
      console.log('fullname', this.fullName);
      console.log('date', this.stayDateFrom);
    }
  }
  getStatusColor(status: string) {
    switch (status) {
      case 'New':
        return 'orange';
      case 'Confirmed':
        return 'blue';
      case 'Checked-In':
        return 'green';
      case 'Checked-Out':
        return 'red';
      case 'Cancelled':
        return 'gray';
      default:
        return 'yellow';
    }
  }
  save() {
    if (this.selectedStatus === 'Cancelled') {
      this.confirmDelete();
    } else { const updatedBookings = this.bookings.map((booking) => {
      if (
        booking.summary.roomId === this.roomId &&
        new Date(this.startDate) >= new Date(booking.summary.stayDateFro) &&
        new Date(this.endDate) <= new Date(booking.summary.stayDateTo)
      ) {
        return { ...booking, status: this.selectedStatus };
      }
      return booking;
    });
    console.log('saved', updatedBookings);
    // this.getStatusColor;
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    this.activeModal.close({
      status: this.selectedStatus,
      color:this.getStatusColor(this.selectedStatus)
    });
  }
}

  deleteBooking() {
    const updatedBookings = this.bookings.filter(
      (booking) =>
        booking.summary.roomId !== this.roomId ||
        new Date(this.startDate) < new Date(booking.summary.stayDateFro) ||
        new Date(this.endDate) > new Date(booking.summary.stayDateTo)
    );
    console.log('deleted', updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    this.activeModal.close('Deleted');
  }

  confirmDelete() {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this booking?'
    );
    if (confirmDelete) {
      this.deleteBooking();
    }
  }

  dismiss() {
    this.activeModal.dismiss('Cancelled');
  }
}

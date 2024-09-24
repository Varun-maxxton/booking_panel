import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { CreatebookingmodalComponent } from '../createbookingmodal/createbookingmodal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit{
  constructor(private router: Router,private dialog: MatDialog) {}

  bookings: any[] = [];
  
  ngOnInit() {
    this.loadBookings();
  }
  
  openCreateReservationModal(): void {
    const dialogRef = this.dialog.open(CreatebookingmodalComponent, {
      width: '80%',
      backdropClass: 'mat-dialog-backdrop',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'booking confirmed') {
        this.loadBookings();
      }
    });
  }

 

  loadBookings() {
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
      this.bookings = JSON.parse(storedBookings);
      
    
      this.bookings = this.bookings.filter(booking => !booking.isDeleted);
    }
  }
  navigateToCustomer() {
    this.router.navigate(['/home']);
  }
  
  openPlanningChart(): void {
    this.router.navigate(['/planning-chart']);
  }
  updateStatus(index: number, newStatus: string): void {
    this.bookings[index].status = newStatus;
    localStorage.setItem('bookings', JSON.stringify(this.bookings));
  }
  deleteBooking(index: number) {
    if (confirm('Are you sure you want to delete this booking?')) {
      this.bookings[index].isDeleted=true;
      this.loadBookings();
    }
  }
  paidanddue(index:number):void{
    const booking=this.bookings[index];
    booking.payment.dueAmount=booking.summary.totalPrice- booking.payment.paidAmount;
    
    localStorage.setItem('bookings',JSON.stringify(this.bookings));
  }
}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { HomeComponent } from './home/home.component';
import { ReactiveFormsModule } from '@angular/forms'; 
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { DetailsService } from './details.service';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { CreatebookingmodalComponent } from './createbookingmodal/createbookingmodal.component';
// import { ResortDetailsComponent } from './resort-details/resort-details.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TableComponent } from './table/table.component';
import { PlanningchartComponent } from './planningchart/planningchart.component';
import { ReceptionComponent } from './reception/reception.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmComponent } from './confirm/confirm.component';
import { StatusBookingComponent } from './status-booking/status-booking.component';


@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    HomeComponent,
    BookingDetailsComponent,
    TableComponent,
    PlanningchartComponent,
    ReceptionComponent,
    ConfirmComponent,
    StatusBookingComponent,
    CreatebookingmodalComponent,
    // 
    // ResortDetailsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,  
    FormsModule,
    MatSnackBarModule,
    MatIconModule,
    MatStepperModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatRadioModule,
    MatButtonModule,
    NgbModule,
    // MatTooltipModule
    
  ],
  providers: [DetailsService, provideHttpClient()],
  bootstrap: [AppComponent]
})
export class AppModule { }

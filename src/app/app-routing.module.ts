import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { HomeComponent } from './home/home.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { TableComponent } from './table/table.component';
import { PlanningchartComponent } from './planningchart/planningchart.component';
import { ReceptionComponent } from './reception/reception.component';
// import { ResortDetailsComponent } from './resort-details/resort-details.component';


const routes: Routes = [
  {path:'', component:LandingComponent},
  {path:'home', component:HomeComponent},
  {path:'booking-details', component:BookingDetailsComponent},
  {path:'reception', component:ReceptionComponent},
  // {path:'planning-chart', component:PlanningchartComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  constructor(private router: Router) {}

  navigateToCustomer() {
    this.router.navigate(['/home']);
  }

  navigateToReception() {
   
    // alert("Reception area coming soon!");
    this.router.navigate(['/reception']);
  }
}

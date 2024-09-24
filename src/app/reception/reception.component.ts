import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-reception',
  templateUrl: './reception.component.html',
  styleUrl: './reception.component.css'
})
export class ReceptionComponent {
  constructor(private router: Router) {}
  currentStep: number = 2;
  isHovered1: boolean = false;
  isHovered2: boolean = false;

  selectStep(step: number) {
    this.currentStep = step;
  }

  navigateToCustomer() {
    this.router.navigate(['/home']);
  }
}

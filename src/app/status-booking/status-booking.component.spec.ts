import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBookingComponent } from './status-booking.component';

describe('StatusBookingComponent', () => {
  let component: StatusBookingComponent;
  let fixture: ComponentFixture<StatusBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatusBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

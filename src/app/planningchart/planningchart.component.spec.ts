import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningchartComponent } from './planningchart.component';

describe('PlanningchartComponent', () => {
  let component: PlanningchartComponent;
  let fixture: ComponentFixture<PlanningchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanningchartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

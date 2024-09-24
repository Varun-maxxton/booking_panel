import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatebookingmodalComponent } from './createbookingmodal.component';

describe('CreatebookingmodalComponent', () => {
  let component: CreatebookingmodalComponent;
  let fixture: ComponentFixture<CreatebookingmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatebookingmodalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatebookingmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

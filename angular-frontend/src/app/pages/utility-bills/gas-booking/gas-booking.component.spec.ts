import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GasBookingComponent } from './gas-booking.component';

describe('GasBookingComponent', () => {
  let component: GasBookingComponent;
  let fixture: ComponentFixture<GasBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GasBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GasBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

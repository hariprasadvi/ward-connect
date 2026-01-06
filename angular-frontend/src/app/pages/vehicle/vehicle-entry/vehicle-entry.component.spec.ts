import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleEntryComponent } from './vehicle-entry.component';

describe('VehicleEntryComponent', () => {
  let component: VehicleEntryComponent;
  let fixture: ComponentFixture<VehicleEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

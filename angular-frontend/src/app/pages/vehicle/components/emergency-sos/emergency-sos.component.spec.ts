import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencySosComponent } from './emergency-sos.component';

describe('EmergencySosComponent', () => {
  let component: EmergencySosComponent;
  let fixture: ComponentFixture<EmergencySosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencySosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmergencySosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

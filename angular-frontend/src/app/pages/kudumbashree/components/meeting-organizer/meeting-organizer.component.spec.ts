import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingOrganizerComponent } from './meeting-organizer.component';

describe('MeetingOrganizerComponent', () => {
  let component: MeetingOrganizerComponent;
  let fixture: ComponentFixture<MeetingOrganizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingOrganizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingOrganizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

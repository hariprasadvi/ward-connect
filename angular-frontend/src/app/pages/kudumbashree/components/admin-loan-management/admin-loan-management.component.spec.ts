import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLoanManagementComponent } from './admin-loan-management.component';

describe('AdminLoanManagementComponent', () => {
  let component: AdminLoanManagementComponent;
  let fixture: ComponentFixture<AdminLoanManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLoanManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLoanManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create a spy for the Router so we can test navigation without actually changing pages
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, BrowserAnimationsModule],
      providers: [
        { provide: Router, useValue: spy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
     // Clean up setTimeout if test doesn't let it run natively
  });

  it('should create the login component successfully', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should navigate to /login when goToMainLogin() is called manually', () => {
    fixture.detectChanges(); // Run ngOnInit
    component.goToMainLogin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should automatically redirect to main login after 3 seconds on init', fakeAsync(() => {
    fixture.detectChanges(); // Triggers ngOnInit
    
    // Simulate passage of 3000ms
    tick(3000);
    
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  }));
});

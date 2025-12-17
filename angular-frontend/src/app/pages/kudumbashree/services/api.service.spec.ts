import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

function expect(service: ApiService) {
  throw new Error('Function not implemented.');
}
function beforeEach(arg0: () => void) {
  throw new Error('Function not implemented.');
}


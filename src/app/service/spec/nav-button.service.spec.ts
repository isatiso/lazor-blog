import { TestBed, inject } from '@angular/core/testing';

import { NavButtonService } from './nav-button.service';

describe('AccountService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NavButtonService]
    });
  });

  it('should be created', inject([NavButtonService], (service: NavButtonService ) => {
    expect(service).toBeTruthy();
  }));
});

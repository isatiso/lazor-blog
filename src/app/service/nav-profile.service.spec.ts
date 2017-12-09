import { TestBed, inject } from '@angular/core/testing';

import { NavProfileService } from './nav-profile.service';

describe('NavProfileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NavProfileService]
    });
  });

  it('should be created', inject([NavProfileService], (service: NavProfileService) => {
    expect(service).toBeTruthy();
  }));
});

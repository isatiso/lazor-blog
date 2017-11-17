import { TestBed, inject } from '@angular/core/testing';

import { ScrollorService } from './scrollor.service';

describe('ScrollorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScrollorService]
    });
  });

  it('should be created', inject([ScrollorService], (service: ScrollorService) => {
    expect(service).toBeTruthy();
  }));
});

import { TestBed, inject } from '@angular/core/testing';

import { CategoryDatabaseService } from './article-database.service';

describe('CategoryDatabaseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CategoryDatabaseService]
    });
  });

  it('should be created', inject([CategoryDatabaseService], (service: CategoryDatabaseService) => {
    expect(service).toBeTruthy();
  }));
});

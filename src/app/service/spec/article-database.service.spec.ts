import { TestBed, inject } from '@angular/core/testing';

import { ArticleDatabaseService } from './article-database.service';

describe('ArticleDatabaseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ArticleDatabaseService]
    });
  });

  it('should be created', inject([ArticleDatabaseService], (service: ArticleDatabaseService) => {
    expect(service).toBeTruthy();
  }));
});

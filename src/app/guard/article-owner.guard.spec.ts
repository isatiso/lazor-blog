import { TestBed, async, inject } from '@angular/core/testing';

import { ArticleOwnerGuard } from './article-owner.guard';

describe('ArticleOwnerGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ArticleOwnerGuard]
    });
  });

  it('should ...', inject([ArticleOwnerGuard], (guard: ArticleOwnerGuard) => {
    expect(guard).toBeTruthy();
  }));
});

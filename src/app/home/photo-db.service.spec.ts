import { TestBed } from '@angular/core/testing';

import { PhotoDbService } from './photo-db.service';

describe('PhotoDbService', () => {
  let service: PhotoDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotoDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

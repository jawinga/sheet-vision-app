import { TestBed } from '@angular/core/testing';

import { BodyMergeService } from './body-merge-service';

describe('BodyMergeService', () => {
  let service: BodyMergeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BodyMergeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

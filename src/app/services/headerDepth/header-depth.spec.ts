import { TestBed } from '@angular/core/testing';

import { HeaderDepth } from './header-depth';

describe('HeaderDepth', () => {
  let service: HeaderDepth;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderDepth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

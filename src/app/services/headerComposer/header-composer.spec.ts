import { TestBed } from '@angular/core/testing';

import { HeaderComposer } from './header-composer';

describe('HeaderComposer', () => {
  let service: HeaderComposer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderComposer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

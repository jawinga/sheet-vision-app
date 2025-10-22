import { TestBed } from '@angular/core/testing';

import { Adapter } from './adapter';
describe('Adapter', () => {
  let service: Adapter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Adapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

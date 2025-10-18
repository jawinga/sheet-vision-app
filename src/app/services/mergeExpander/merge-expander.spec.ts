import { TestBed } from '@angular/core/testing';
import { MergeExpander } from './merge-expander';
describe('MergeExpander', () => {
  let service: MergeExpander;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MergeExpander);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

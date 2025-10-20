import { TestBed } from '@angular/core/testing';

import { HeaderViewModelService } from './header-view-model-service';
describe('HeaderViewModelService', () => {
  let service: HeaderViewModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderViewModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingAnimation } from './loading-animation';

describe('LoadingAnimation', () => {
  let component: LoadingAnimation;
  let fixture: ComponentFixture<LoadingAnimation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingAnimation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingAnimation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

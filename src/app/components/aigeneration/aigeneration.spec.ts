import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AIGeneration } from './aigeneration';

describe('AIGeneration', () => {
  let component: AIGeneration;
  let fixture: ComponentFixture<AIGeneration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AIGeneration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AIGeneration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

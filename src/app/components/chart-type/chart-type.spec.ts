import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartType } from './chart-type';

describe('ChartType', () => {
  let component: ChartType;
  let fixture: ComponentFixture<ChartType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

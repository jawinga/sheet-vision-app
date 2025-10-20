import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowChart } from './show-chart';

describe('ShowChart', () => {
  let component: ShowChart;
  let fixture: ComponentFixture<ShowChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

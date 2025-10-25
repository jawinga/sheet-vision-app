import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseColumn } from './choose-column';

describe('ChooseColumn', () => {
  let component: ChooseColumn;
  let fixture: ComponentFixture<ChooseColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseColumn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseColumn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolTip } from './tool-tip';

describe('ToolTip', () => {
  let component: ToolTip;
  let fixture: ComponentFixture<ToolTip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolTip]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolTip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

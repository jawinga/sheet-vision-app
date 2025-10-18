import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetButton } from './sheet-button';

describe('SheetButton', () => {
  let component: SheetButton;
  let fixture: ComponentFixture<SheetButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SheetButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SheetButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

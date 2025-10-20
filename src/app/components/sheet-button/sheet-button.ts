import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sheet-button',
  imports: [],
  templateUrl: './sheet-button.html',
  styleUrl: './sheet-button.scss',
})
export class SheetButton {
  @Input() label?: string = '';
  @Input() selected?: boolean;
  @Input() number?: number;
  @Output() select = new EventEmitter<void>();

  emitChangeSheet() {
    this.select.emit();
  }

  get displayNumber() {
    return (this.number ?? 0) + 1;
  }
}

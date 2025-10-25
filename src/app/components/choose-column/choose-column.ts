import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-choose-column',
  imports: [],
  templateUrl: './choose-column.html',
  styleUrl: './choose-column.scss',
})
export class ChooseColumn {
  @Input() columnName!: string;
  @Input() isSelected: boolean = false;
  @Output() columnSelected = new EventEmitter<string>();

  emitColumn() {
    this.columnSelected.emit(this.columnName);
  }
}

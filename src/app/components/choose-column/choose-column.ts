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
  @Input() exceedsLength: boolean = false;
  @Output() columnSelected = new EventEmitter<string>();

  emitColumn() {
    this.columnSelected.emit(this.columnName);
  }

  cutWord(word: string, maxLength = 15): string {
    return word.length >= maxLength ? word.slice(0, maxLength) + '...' : word;
  }
}

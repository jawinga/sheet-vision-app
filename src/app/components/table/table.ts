import { Component, Input, OnInit } from '@angular/core';
import { CellValue } from '../../shared/helpers/cell-types';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table {
  @Input() parseReady?: boolean;
  @Input() sheetName!: string;
  @Input() columns!: string[];
  @Input() rowCount!: number;
  @Input() rows!: Array<Record<string, CellValue>>;
  @Input() sampleRows!: Array<Record<string, CellValue>>;
  @Input() warnings!: string[];
}

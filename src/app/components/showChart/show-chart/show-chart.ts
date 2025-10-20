import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CellValue } from '../../../shared/helpers/cell-types';

enum ChartTypes {
  Bar = 'Bar',
  Pie = 'Pie',
  Scatter = 'Scatter',
  Line = 'Line',
}

export interface ChartConfig {}

@Component({
  selector: 'app-show-chart',
  imports: [],
  templateUrl: './show-chart.html',
  styleUrl: './show-chart.scss',
})
export class ShowChart {
  @Input() chartType!: ChartTypes;
  @Input() columns!: string[];
  @Input() rows!: Array<Record<string, CellValue>>;
  @Input() config!: {};
  @Output() chartTypeChange = new EventEmitter<typeof ChartTypes>();
}

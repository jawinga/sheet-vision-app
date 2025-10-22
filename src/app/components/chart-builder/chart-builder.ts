import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Target, ChartKind } from '../../shared/adapters/chart/adapter';
import { CellValue } from '../../shared/helpers/cell-types';

type BuildOk = { ok: true; target: Target };
type BuildErr = { ok: false; error: string };
type BuildResult = BuildOk | BuildErr;

@Component({
  selector: 'app-chart-builder',
  imports: [],
  templateUrl: './chart-builder.html',
  styleUrl: './chart-builder.scss',
})
export class ChartBuilder {
  @Input() columns!: string[];
  @Input() rows: Array<Record<string, CellValue>> = [];
  @Output() targetType = new EventEmitter<Target>();

  //base
  selectedChartType?: ChartKind;
  data?: Array<Record<string, unknown>>;
  legend?: boolean;
  position?: string;
  title?: string;

  //cartesian
  xKey?: string;
  yKeys?: string[];
  indexAxis?: string;

  //doughnut
  labelKey?: string;
  valueKey?: string;

  emitTarget() {
    this.targetType.emit();
  }

  // type: ChartKind;
  // data: Array<Record<string, unknown>>;
  // legend?: { show?: boolean; position?: 'top' | 'right' | 'bottom' | 'left' };
  // colorPalette?: string[];
  // title?: string;

  // changeTarget(next: ChartKind): BuildResult {
  //   const prev = this.selectedChartType;

  //   return BuildResult;
  // }
}

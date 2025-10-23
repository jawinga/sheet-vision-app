import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Target, ChartKind } from '../../shared/adapters/chart/adapter';
import { CellValue } from '../../shared/helpers/cell-types';
import { palette } from '../../shared/constants/palette';
import {
  isStringLikeNumber,
  hasValue,
} from '../../shared/helpers/cell-helpers';

type BuildOk = { ok: true; target: Target };
type BuildErr = { ok: false; error: string };
type BuildResult = BuildOk | BuildErr;

type BuilderState = {
  columns: string[];
  rows: Array<Record<string, unknown>>;

  //cartesian
  xKey?: string;
  yKeys?: string[];
  indexAxis?: 'x' | 'y';

  //doughnut

  labelKey?: string;
  valueKey?: string;

  //presentation
  legendShow?: boolean;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left';
  colorPalette?: string[];
};

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

  emitTarget() {
    this.targetType.emit();
  }

  changeTarget(chart: ChartKind, state: BuilderState): BuildResult {
    if (!state.rows?.length)
      return {
        ok: false,
        error: 'No rows found',
      };

    if (!this.rows.length) return { ok: false, error: 'No rows found' };

    //find first column

    const firstColumn = () => state.columns?.[0] ?? '';
    const firstNumeric = () =>
      this.pickFirstNumeric(state.rows, state.columns ?? []);

    if (chart === 'doughnut') {
      if (!state.labelKey) {
        return {
          ok: false,
          error: 'No label key found',
        };
      }
      if (!state.valueKey) {
        return {
          ok: false,
          error: 'No value key found',
        };
      }
    }

    state.colorPalette = palette;
    state.legendShow = true;
    state.legendPosition = 'top';

    return {
      ok: false,
      error: 'error',
    };
  }

  private isColumnNumericish(
    rows: Array<Record<string, unknown>>,
    column: string
  ): boolean {
    let ratio: number = 0;
    let numericCount: number = 0;
    let nonNumericCount: number = 0;
    const minimumObserved = 3;
    const sample = Math.min(10, rows.length);

    for (let i = 0; i < sample; i++) {
      const val = rows[i]?.[column];
      if (typeof val === 'number' && Number.isFinite(val)) {
        numericCount += 1;
      } else if (typeof val === 'string' && isStringLikeNumber(val)) {
        numericCount += 1;
      } else if (val === undefined || val === null || val === ''.trim()) {
        continue;
      } else {
        nonNumericCount += 1;
      }
    }
    const observed = numericCount + nonNumericCount;

    if (observed < minimumObserved) return false;

    ratio = numericCount / observed;
    return ratio >= 0.7;
  }

  private pickFirstNumeric(
    rows: Array<Record<string, unknown>>,
    columns: string[]
  ): string | undefined {
    for (const col of columns) {
      if (this.isColumnNumericish(rows, col)) return col;
    }
    return undefined;
  }
}

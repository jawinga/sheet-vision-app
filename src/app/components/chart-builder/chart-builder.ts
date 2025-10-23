import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  Target,
  ChartKind,
  TargetDoughnut,
} from '../../shared/adapters/chart/adapter';
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
  fill?: boolean;

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
export class ChartBuilder implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (this.columns?.length && this.rows?.length && this.selectedChart) {
      this.buildAndEmitTarget();
    }
  }

  @Input() columns!: string[];
  @Input() rows: Array<Record<string, unknown>> = [];
  @Input() selectedChart!: ChartKind;
  @Output() targetChange = new EventEmitter<Target>();

  buildAndEmitTarget() {
    const state: BuilderState = {
      columns: this.columns,
      rows: this.rows,
    };

    const result = this.changeTarget(this.selectedChart, state);

    if (result.ok) {
      this.targetChange.emit(result.target);
    } else {
      console.error('Chart build error:', result.error);
    }
  }

  changeTarget(chart: ChartKind, state: BuilderState): BuildResult {
    if (!state.rows?.length)
      return {
        ok: false,
        error: 'No rows found',
      };

    if (!state.columns?.length)
      return { ok: false, error: 'No columns found.' };

    //find first column

    const firstColumn = () => state.columns?.[0] ?? '';
    const firstNumeric = () =>
      this.pickFirstNumeric(state.rows, state.columns ?? []);

    if (chart === 'doughnut') {
      const labelKey = state.labelKey ?? state.xKey ?? firstColumn();
      const valueKey = state.valueKey ?? state.yKeys?.[0] ?? firstNumeric();

      if (!labelKey || !valueKey) {
        return { ok: false, error: 'No label key nor valuey key' };
      }

      const target: TargetDoughnut = {
        type: 'doughnut',
        data: state.rows,
        labelKey,
        valueKey,
      };

      return {
        ok: true,
        target: target,
      };
    }

    if (chart === 'area' || chart === 'bar' || chart === 'line') {
      const xKey = state.xKey ?? state.labelKey ?? firstColumn();
      const y0 = state.yKeys?.[0] ?? state.valueKey ?? firstNumeric();
      const yKeys = y0 ? [y0] : [];

      if (!xKey || yKeys.length === 0) {
        return {
          ok: false,
          error: 'Pick an X column and at least one numeric Y column.',
        };
      }

      //       type: 'bar';
      // xKey: string;
      // yKeys: [string] | string[];
      // indexAxis?: 'x' | 'y';

      const base = {
        data: state.rows,
        xKey,
        yKeys,
        legendShow: state.legendShow ?? true,
        legendPosition: state.legendPosition ?? 'top',
        colorPalette: state.colorPalette ?? palette,
      };

      switch (chart) {
        case 'bar':
          return {
            ok: true,
            target: {
              type: 'bar',
              indexAxis: state.indexAxis ?? 'x',
              ...base,
            },
          };

        case 'line':
          return {
            ok: true,
            target: {
              type: 'line',
              ...base,
            },
          };

        case 'area':
          return {
            ok: true,
            target: {
              type: 'area',
              fill: true,
              ...base,
            },
          };

        default:
          return {
            ok: true,
            target: {
              type: 'bar',
              indexAxis: state.indexAxis ?? 'x',
              ...base,
            },
          };
      }

      // xKey?: string;
      // yKeys?: string[];
      // indexAxis?: 'x' | 'y';
    }
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

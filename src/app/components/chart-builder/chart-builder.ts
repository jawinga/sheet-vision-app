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
import { palette } from '../../shared/constants/palette';
import { isColumnNumericish } from '../../shared/helpers/row-helpers';
import { redPalette } from '../../shared/constants/palette';

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
    console.log(' ChartBuilder ngOnChanges:', {
      columns: this.columns?.length,
      rows: this.rows?.length,
      selectedChart: this.selectedChart,
    });

    if (this.columns?.length && this.rows?.length && this.selectedChart) {
      console.log('All conditions met, building target');
      this.buildAndEmitTarget();
    } else {
      console.log('Conditions not met, skipping');
    }
  }

  @Input() columns!: string[];
  @Input() rows: Array<Record<string, unknown>> = [];
  @Input() selectedChart!: ChartKind;
  @Input() xColumn?: string;
  @Input() yColumn?: string;
  @Input() horizontal = false;
  @Output() targetChange = new EventEmitter<Target>();
  tension: number = 0.3;

  buildAndEmitTarget() {
    console.log('Building with:', {
      xColumn: this.xColumn,
      yColumn: this.yColumn,
      selectedChart: this.selectedChart,
      columnsAvailable: this.columns,
      rowCount: this.rows.length,
    });

    const validRows = this.rows.filter((row) => {
      if (
        this.xColumn &&
        (row[this.xColumn] === null || row[this.xColumn] === undefined)
      ) {
        return false;
      }
      if (
        this.yColumn &&
        (row[this.yColumn] === null || row[this.yColumn] === undefined)
      ) {
        return false;
      }
      return true;
    });

    const state: BuilderState = {
      columns: this.columns,
      rows: validRows,
      xKey: this.xColumn,
      yKeys: this.yColumn ? [this.yColumn] : undefined,
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
              indexAxis: this.horizontal ? 'y' : 'x',
              ...base,
            },
          };

        case 'line':
          return {
            ok: true,
            target: {
              type: 'line',
              tension: this.tension,
              fill: true,
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
              // indexAxis: state.indexAxis ?? 'x',
              indexAxis: this.horizontal ? 'y' : 'x',
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

  private pickFirstNumeric(
    rows: Array<Record<string, unknown>>,
    columns: string[]
  ): string | undefined {
    for (const col of columns) {
      if (isColumnNumericish(rows, col)) return col;
    }
    return undefined;
  }
}

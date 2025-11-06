import { Injectable } from '@angular/core';
import {
  Legend,
  plugins,
  type ChartConfiguration as ChartConfig,
  type ChartData as ChartD,
  type ChartDataset,
  type ChartOptions,
  type ChartType,
  type DefaultDataPoint,
} from 'chart.js';
import {
  palette as defaultPalette,
  redPalette,
  pointPalette,
  doughnutPalette,
} from '../../constants/palette';

export type ChartKind = 'bar' | 'doughnut' | 'line' | 'area';

type Result<T, E = string> =
  | { ok: true; value: T; error?: never }
  | { ok: false; error: E; value?: never };

type AdaptResult = Result<ChartConfig<ChartType>>;
type FunctionBarLineArea = TargetBar | TargetLine | TargetArea;

//target

export interface TargetBase {
  type: ChartKind;
  data: Array<Record<string, unknown>>;
  legend?: { show?: boolean; position?: 'top' | 'right' | 'bottom' | 'left' };
  colorPalette?: string[];
  title?: string;
}

interface TargetCartesianBase extends TargetBase {
  xKey: string;
  yKeys: string[];
  tension?: number;
  fill?: boolean;
  pointBackgroundColor?: string;
  borderWidth?: number;
  radius?: number;
}

export interface TargetBar extends TargetCartesianBase {
  type: 'bar';
  xKey: string;
  yKeys: [string] | string[];
  indexAxis?: 'x' | 'y';
  backgroundColor?: [];
}

export interface TargetLine extends TargetCartesianBase {
  type: 'line';
}

export interface TargetArea extends TargetCartesianBase {
  type: 'area';
  tension?: number;
  readonly fill: true;
}

export interface TargetDoughnut extends TargetBase {
  type: 'doughnut';
  labelKey: string;
  valueKey: string;
  backgroundColor?: [];
  cutout?: string;
  radius?: string;
}

export type Target = TargetBar | TargetDoughnut | TargetLine | TargetArea;
//adaptee shape
const configBar: ChartConfig<'bar'> = {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      {
        label: 'My first dataset',
        data: [],
        backgroundColor: [],
      },
    ],
  },
};

const configDoughnut: ChartConfig<'doughnut'> = {
  type: 'doughnut',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Label',
        data: [],
        backgroundColor: [],
        hoverOffset: 4,
      },
    ],
  },
};

@Injectable({
  providedIn: 'root',
})
export class Adapter {
  public adapt(target: Target): AdaptResult {
    if (target.type === 'doughnut')
      return this.adaptDoughnutChart(target as TargetDoughnut);
    return this.adaptBarOrLineChart(
      target as TargetBar | TargetLine | TargetArea
    );
  }

  private adaptDoughnutChart(target: TargetDoughnut): AdaptResult {
    //guards
    if (target.type !== 'doughnut') {
      return {
        ok: false,
        error: 'Wrong type of chart',
      };
    }

    if (target.labelKey.length <= 0) {
      return {
        ok: false,
        error: 'Label key too short',
      };
    }
    if (target.valueKey.length <= 0) {
      return {
        ok: false,
        error: 'Value key too short',
      };
    }

    if (!Array.isArray(target.data) || target.data.length === 0) {
      return {
        ok: false,
        error: 'Not enough data found',
      };
    }

    for (let i = 0; i < target.data.length; i++) {
      const row = target.data[i];
      const label = row[target.labelKey];
      const value = row[target.valueKey];
      if (label == null || label === '') {
        return {
          ok: false,
          error: `Row ${i + 1}: missing value for labelKey "${
            target.labelKey
          }".`,
        };
      }
      const num = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(num)) {
        return {
          ok: false,
          error: `Row ${i + 1}: "${
            target.valueKey
          }" is not a number (got "${String(value)}").`,
        };
      }
    }

    const labels = target.data.map((row) => String(row[target.labelKey]));
    const values = target.data.map((row) => Number(row[target.valueKey]));

    const shaped: ChartConfig<'doughnut', number[], string> = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: doughnutPalette,
            radius: '85%',
          } as any,
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: target.legend?.show ?? true,
            position: 'right',
          },
        },
      },
    };

    return {
      ok: true,
      value: shaped,
    };
  }

  private adaptBarOrLineChart(target: FunctionBarLineArea): AdaptResult {
    if (!Array.isArray(target.data) || target.data.length === 0)
      return { ok: false, error: 'No data rows to plot.' };

    if (!('xKey' in target) || !target.xKey)
      return { ok: false, error: 'xKey is required.' };

    if (!Array.isArray(target.yKeys) || target.yKeys.length === 0)
      return { ok: false, error: 'At least one yKey is required.' };

    for (let i = 0; i < target.data.length; i++) {
      const row = target.data[i];
      const x = row[target.xKey];
      if (x == null || x === '') {
        return {
          ok: false,
          error: `Row ${i + 1}: missing value for xKey "${target.xKey}".`,
        };
      }
      for (const yKey of target.yKeys) {
        const raw = row[yKey];
        const num = typeof raw === 'number' ? raw : Number(raw);
        if (!Number.isFinite(num)) {
          return {
            ok: false,
            error: `Row ${i + 1}: "${yKey}" is not a number (got "${String(
              raw
            )}").`,
          };
        }
      }
    }

    const labels: string[] = target.data.map((row) => String(row[target.xKey]));
    const colors = target.colorPalette?.length
      ? target.colorPalette
      : defaultPalette;
    const showLegend = target.legend?.show ?? target.yKeys.length > 1;

    if (target.type === 'line' || target.type === 'area') {
      const datasets: ChartDataset<'line', number[]>[] = target.yKeys.map(
        (yKey, i) => {
          const color = colors[i % colors.length];
          const colorDots = pointPalette[i % pointPalette.length];
          return {
            label: yKey,
            data: target.data.map((row) => Number(row[yKey])),
            borderColor: color,
            backgroundColor: color,
            pointRadius:
              target.type === 'line' || target.type === 'area'
                ? target.borderWidth ?? 6
                : 3,
            borderWidth:
              target.type === 'line' || target.type === 'area'
                ? target.borderWidth ?? 3
                : 0,
            pointBackgroundColor:
              target.type === 'line' || target.type === 'area'
                ? target.pointBackgroundColor ?? colorDots
                : '',
            tension:
              target.type === 'line' || target.type === 'area'
                ? target.tension ?? 0.3
                : 0,
            ...(target.type === 'area' ? { fill: true } : {}),
          };
        }
      );

      const shaped: ChartConfig<'line', number[], string> = {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: showLegend,
              position: target.legend?.position ?? 'top',
            },
          },
        },
      };
      return { ok: true, value: shaped };
    }

    const barDatasets: ChartDataset<'bar', number[]>[] = target.yKeys.map(
      (yKey, i) => {
        const barColors = target.data.map(
          (_, index) => redPalette[index % redPalette.length]
        );
        return {
          label: yKey,
          data: target.data.map((row) => Number(row[yKey])),
          backgroundColor: barColors,
        };
      }
    );

    const shaped: ChartConfig<'bar', number[], string> = {
      type: 'bar',
      data: { labels, datasets: barDatasets },
      options: {
        responsive: true,
        indexAxis: (target as TargetBar).indexAxis === 'y' ? 'y' : 'x',
        plugins: {
          legend: {
            display: showLegend,
            position: target.legend?.position ?? 'top',
          },
        },
      },
    };
    return { ok: true, value: shaped };
  }
}

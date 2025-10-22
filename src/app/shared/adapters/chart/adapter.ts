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
import { palette } from '../../constants/palette';

export type AdaptResult =
  | { ok: true; config: ChartConfig<'bar'> }
  | { ok: false; error: string };

//target
export interface TargetBar {
  type: 'bar';
  xKey: string;
  yKeys: [string] | string[];
  data: Array<Record<string, unknown>>;
  legend?: { show?: boolean };
  colorPalette?: string[];
  indexAxis?: 'x' | 'y';
  title?: string;
}

//adaptee shape
const config: ChartConfig<'bar'> = {
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

@Injectable({
  providedIn: 'root',
})
export class Adapter {
  private adaptBarChart(target: TargetBar): AdaptResult {
    //guards
    if (target.type !== 'bar') {
      return {
        ok: false,
        error: 'Wrong type of chart',
      };
    }

    if (target.yKeys.length <= 0) {
      return {
        ok: false,
        error: 'Found no yKeys',
      };
    }
    if (!target.xKey) {
      return {
        ok: false,
        error: 'Found no xKey',
      };
    }

    if (target.data.length === 0) {
      return {
        ok: false,
        error: 'Not enough data found',
      };
    }

    //implementation
    const labels = target.data.map((row) => String(row[target.xKey]));
    const dataset = target.yKeys.map((yKey, i) => ({
      label: yKey,
      data: target.data.map((row) => Number(row[yKey])),
      backgroundColor: palette[i % palette.length],
    }));

    const shaped: ChartConfig<'bar', number[], string> = {
      type: 'bar',
      data: {
        labels,

        datasets: dataset,
      },
      options: {
        indexAxis: target.indexAxis === 'y' ? 'y' : 'x',
        responsive: true,

        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
      },
    };

    return {
      ok: true,
      config: shaped,
    };
  }
}

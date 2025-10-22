import type {
  ChartConfiguration as ChartConfig,
  ChartData as ChartD,
  ChartDataset,
  ChartOptions,
  ChartType,
  DefaultDataPoint,
} from 'chart.js';

//adapter result
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

//adaptee
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

//adapter function

function adaptBarChart(target: TargetBar): AdaptResult {
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

  const [yKey] = target.yKeys;
  const labels = target.data.map((row) => String(row[target.xKey]));
  const values = target.data.map((row) => Number(row[yKey]));
  const backgroundColor = target.colorPalette?.[0];

  const shaped: ChartConfig<'bar', number[], string> = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: yKey,
          data: values,
          backgroundColor,
        },
      ],
    },
    options: {
      ...(target.indexAxis === 'y' ? { indexAxis: 'y' } : {}),
    },
  };

  return {
    ok: true,
    config: shaped,
  };
}

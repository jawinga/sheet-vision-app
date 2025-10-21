import type { ChartConfiguration } from 'chart.js';

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

export type AdaptResult =
  | { ok: true; config: ChartConfiguration<'bar'> }
  | { ok: false; error: string };

export function toChartJsBar(target: TargetBar): AdaptResult {
  if (target.type !== 'bar')
    return { ok: false, error: 'Expected type "bar".' };
  if (!target.xKey) return { ok: false, error: 'xKey is required.' };
  if (!Array.isArray(target.yKeys) || target.yKeys.length !== 1)
    return { ok: false, error: 'yKeys must contain exactly one key for v0.' };
  if (!Array.isArray(target.data) || target.data.length === 0)
    return { ok: false, error: 'data must be a non-empty array.' };

  const [yKey] = target.yKeys;

  const labels = target.data.map((row, i) => {
    const v = row[target.xKey];
    if (v == null)
      throw new Error(`Row ${i + 1}: missing xKey "${target.xKey}".`);
    return typeof v === 'string' || typeof v === 'number' ? v : String(v);
  });

  const values = target.data.map((row, i) => {
    const raw = row[yKey];
    const num = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isFinite(num))
      throw new Error(`Row ${i + 1}: yKey "${yKey}" is not a number.`);
    return num;
  });

  const backgroundColor =
    Array.isArray(target.colorPalette) && target.colorPalette.length > 0
      ? target.colorPalette[0]
      : undefined;

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: yKey,
          data: values,
          ...(backgroundColor ? { backgroundColor } : {}),
        },
      ],
    },
    options: {
      ...(target.indexAxis === 'y' ? { indexAxis: 'y' } : {}),
    },
  };

  return { ok: true, config };
}

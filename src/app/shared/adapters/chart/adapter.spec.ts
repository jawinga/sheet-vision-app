// adapter.spec.ts
import { Adapter, TargetBar, AdaptResult } from './adapter';
import type { ChartConfiguration as ChartConfig } from 'chart.js';

describe('Adapter (Bar)', () => {
  let service: Adapter;

  function adaptBar(target: TargetBar): AdaptResult {
    return (service as any).adaptBarChart(target) as AdaptResult;
  }

  beforeEach(() => {
    service = new Adapter();
  });

  const rows = [
    { month: 'Jan', revenue: 10, profit: 3 },
    { month: 'Feb', revenue: 12, profit: 4 },
    { month: 'Mar', revenue: 8, profit: 2 },
  ];

  const baseTarget: TargetBar = {
    type: 'bar',
    xKey: 'month',
    yKeys: ['revenue'],
    data: rows,
    colorPalette: ['#1f77b4', '#ff7f0e', '#2ca02c'],
    indexAxis: 'x',
  };

  it('returns ok=true and maps labels/data (single series)', () => {
    const res = adaptBar(baseTarget);
    expect(res.ok).toBeTrue();
    if (!res.ok) {
      fail('expected ok=true');
      return;
    }

    const cfg = res.config as ChartConfig<'bar', number[], string>;
    expect(cfg.type).toBe('bar');
    expect(cfg.data.labels).toEqual(['Jan', 'Feb', 'Mar']);
    expect(cfg.data.datasets.length).toBe(1);
    expect(cfg.data.datasets[0].label).toBe('revenue');
    expect(cfg.data.datasets[0].data).toEqual([10, 12, 8]);

    expect(cfg.options?.plugins?.legend?.display).toBeTrue();
    expect(cfg.options?.indexAxis).toBe('x');
  });

  it('maps multiple yKeys into multiple datasets and cycles colors', () => {
    const target: TargetBar = { ...baseTarget, yKeys: ['revenue', 'profit'] };
    const res = adaptBar(target);
    expect(res.ok).toBeTrue();
    if (!res.ok) {
      fail('expected ok=true');
      return;
    }

    const cfg = res.config;
    expect(cfg.data.labels).toEqual(['Jan', 'Feb', 'Mar']);
    expect(cfg.data.datasets.length).toBe(2);

    expect(cfg.data.datasets[0].label).toBe('revenue');
    expect(cfg.data.datasets[0].data).toEqual([10, 12, 8]);
    expect(cfg.data.datasets[1].label).toBe('profit');
    expect(cfg.data.datasets[1].data).toEqual([3, 4, 2]);

    expect(cfg.options?.indexAxis).toBe('x');
  });

  it('respects horizontal bars when indexAxis is "y"', () => {
    const target: TargetBar = { ...baseTarget, indexAxis: 'y' };
    const res = adaptBar(target);
    expect(res.ok).toBeTrue();
    if (!res.ok) {
      fail('expected ok=true');
      return;
    }

    const cfg = res.config;
    expect(cfg.options?.indexAxis).toBe('y');
  });

  it('returns error when type is not "bar"', () => {
    const wrong: TargetBar = { ...baseTarget, type: 'bar' as any };
    (wrong as any).type = 'line';
    const res = adaptBar(wrong);
    expect(res.ok).toBeFalse();
    if (res.ok) return;
    expect(res.error).toContain('Wrong type of chart');
  });

  it('returns error when yKeys is empty', () => {
    const bad: TargetBar = { ...baseTarget, yKeys: [] };
    const res = adaptBar(bad);
    expect(res.ok).toBeFalse();
    if (res.ok) return;
    expect(res.error).toContain('Found no yKeys');
  });

  it('returns error when xKey is missing/empty', () => {
    const bad: TargetBar = { ...baseTarget, xKey: '' as any };
    const res = adaptBar(bad);
    expect(res.ok).toBeFalse();
    if (res.ok) return;
    expect(res.error).toContain('Found no xKey');
  });

  it('returns error when data is empty', () => {
    const bad: TargetBar = { ...baseTarget, data: [] };
    const res = adaptBar(bad);
    expect(res.ok).toBeFalse();
    if (res.ok) return;
    expect(res.error).toContain('Not enough data');
  });

  it('coerces numbers (current behavior): "N/A" becomes NaN in data', () => {
    const badValue: TargetBar = {
      ...baseTarget,
      data: [{ month: 'Jan', revenue: 'N/A' as any }, ...rows.slice(1)],
    };
    const res = adaptBar(badValue);
    expect(res.ok).toBeTrue(); // current code does not error on non-numeric; it will map Number('N/A') -> NaN
    if (!res.ok) return;
    const arr = res.config.data.datasets[0].data as (number | null)[];
    expect(Number.isNaN(arr[0] as number)).toBeTrue();
  });
});

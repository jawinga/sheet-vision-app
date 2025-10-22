import {
  Adapter,
  TargetBar,
  TargetLine,
  TargetArea,
  TargetDoughnut,
} from './adapter';

describe('Adapter', () => {
  let adapter: Adapter;

  beforeEach(() => {
    adapter = new Adapter();
  });

  const rows = [
    { month: 'Jan', revenue: 100, cost: 40, category: 'A' },
    { month: 'Feb', revenue: 200, cost: 80, category: 'B' },
    { month: 'Mar', revenue: 300, cost: 120, category: 'A' },
  ];

  describe('bar (single series)', () => {
    it('maps xKey→labels and yKey→data', () => {
      const target: TargetBar = {
        type: 'bar',
        data: rows,
        xKey: 'month',
        yKeys: ['revenue'],
        indexAxis: 'x',
        legend: { show: undefined },
        colorPalette: ['#111', '#222'],
      };

      const res = adapter.adapt(target);
      expect(res.ok).toBeTrue();
      if (!res.ok) return;

      const cfg = res.value;
      expect(cfg.type).toBe('bar');
      expect(cfg.data.labels).toEqual(['Jan', 'Feb', 'Mar']);
      expect(cfg.data.datasets.length).toBe(1);
      expect(cfg.data.datasets[0].label).toBe('revenue');
      expect(cfg.data.datasets[0].data).toEqual([100, 200, 300]);
      // legend off by default for single series
      expect(cfg.options?.plugins?.legend?.display).toBeFalse();
    });
  });

  describe('bar (multi series → legend on)', () => {
    it('creates one dataset per yKey and enables legend', () => {
      const target: TargetBar = {
        type: 'bar',
        data: rows,
        xKey: 'month',
        yKeys: ['revenue', 'cost'],
        indexAxis: 'x',
        // no explicit legend.show → default behavior should be on for multi
      };

      const res = adapter.adapt(target);
      expect(res.ok).toBeTrue();
      if (!res.ok) return;

      const cfg = res.value;
      expect(cfg.data.datasets.length).toBe(2);
      expect(cfg.options?.plugins?.legend?.display).toBeTrue();
    });
  });

  describe('line vs area', () => {
    it('line returns type line with no fill', () => {
      const target: TargetLine = {
        type: 'line',
        data: rows,
        xKey: 'month',
        yKeys: ['revenue'],
      };
      const res = adapter.adapt(target);
      expect(res.ok).toBeTrue();
      if (!res.ok) return;

      const cfg = res.value;
      expect(cfg.type).toBe('line');
      // @ts-expect-no-error: dataset may not have fill on line
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((cfg.data.datasets[0] as any).fill).toBeUndefined();
    });

    it('area returns type line with fill true on datasets', () => {
      const target: TargetArea = {
        type: 'area',
        data: rows,
        xKey: 'month',
        yKeys: ['revenue', 'cost'],
        fill: true,
      };
      const res = adapter.adapt(target);
      expect(res.ok).toBeTrue();
      if (!res.ok) return;

      const cfg = res.value;
      expect(cfg.type).toBe('line'); // area is implemented as line + fill
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const ds of cfg.data.datasets as any[]) {
        expect(ds.fill).toBeTrue();
      }
    });
  });

  describe('doughnut', () => {
    it('maps labelKey/valueKey and applies colors', () => {
      const target: TargetDoughnut = {
        type: 'doughnut',
        data: rows,
        labelKey: 'category',
        valueKey: 'revenue',
        colorPalette: ['#aaa', '#bbb', '#ccc'],
        legend: { show: true, position: 'right' },
      };
      const res = adapter.adapt(target);
      expect(res.ok).toBeTrue();
      if (!res.ok) return;

      const cfg = res.value;
      expect(cfg.type).toBe('doughnut');
      expect(cfg.data.labels).toEqual(['A', 'B', 'A']);
      expect(cfg.data.datasets[0].data).toEqual([100, 200, 300]);
      // backgroundColor should be present (from palette fallback or provided)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((cfg.data.datasets[0] as any).backgroundColor).toBeTruthy();
    });
  });

  describe('errors', () => {
    it('no data rows → error', () => {
      const target: TargetLine = {
        type: 'line',
        data: [],
        xKey: 'month',
        yKeys: ['revenue'],
      };
      const res = adapter.adapt(target);
      expect(res.ok).toBeFalse();
      if (res.ok) return;
      expect(res.error).toContain('No data rows to plot');
    });

    it('missing x value → mentions row and key', () => {
      const badRows = [
        { month: 'Jan', revenue: 1 },
        { month: '', revenue: 2 },
      ];
      const target: TargetBar = {
        type: 'bar',
        data: badRows,
        xKey: 'month',
        yKeys: ['revenue'],
      };
      const res = adapter.adapt(target);
      expect(res.ok).toBeFalse();
      if (res.ok) return;
      expect(res.error).toContain('Row 2');
      expect(res.error).toContain('xKey "month"');
    });

    it('non-numeric y → mentions row and yKey', () => {
      const badRows = [{ month: 'Jan', revenue: 'N/A' }];
      const target: TargetBar = {
        type: 'bar',
        data: badRows,
        xKey: 'month',
        yKeys: ['revenue'],
      };
      const res = adapter.adapt(target);
      expect(res.ok).toBeFalse();
      if (res.ok) return;
      expect(res.error).toContain('Row 1');
      expect(res.error).toContain('"revenue" is not a number');
      expect(res.error).toContain('N/A');
    });

    it('doughnut missing label/value keys → error', () => {
      const target: TargetDoughnut = {
        type: 'doughnut',
        data: rows,
        labelKey: '',
        valueKey: '',
      };
      const res = adapter.adapt(target);
      expect(res.ok).toBeFalse();
      if (res.ok) return;
      expect(res.error).toBeTruthy();
    });
  });
});

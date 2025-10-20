type ChartTypes = 'bar' | 'pie' | 'area' | 'line';

enum Aggregate {
  sum = 'sum',
  avg = 'avg',
  count = 'count',
  min = 'min',
  max = 'max',
}

type SortDir = 'asc' | 'desc';
type SortBy = 'x' | 'y' | 'series';

interface FilterRule {
  field: string;
  op:
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'notin'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'isNull'
    | 'isNotNull';
  value?: unknown;
}

interface BaseConfigChart {
  type: ChartTypes;

  xKey?: string;
  yKeys?: string[];
  seriesKey?: string;

  aggregate?: Aggregate;
  sortBy?: SortBy;
  sortDir?: SortDir;
  filter?: FilterRule[];
  normalise100?: boolean;

  xFormat?: string;
  yFormat?: string;
  nullHandling?: 'skip' | 'zero' | 'gap';

  title?: string;
  colorPalette?: string[];
  legend?: { show?: boolean; position?: 'top' | 'right' | 'bottom' | 'left' };
  tooltip?: { show?: boolean };
  grid?: { x?: boolean; y?: boolean };
  orientation?: 'vertical' | 'horizontal';

  xScaleType?: 'linear' | 'logarithmic' | 'time' | 'category';
  yScaleType?: 'linear' | 'logarithmic' | 'time' | 'category';

  stackStrategy?: 'none' | 'stack' | 'stackNormalized';
}

interface BarChartConfig extends BaseConfigChart {
  type: 'bar';
  categoryPercentage?: number;
  barPercentage?: number;
  barThickness?: number;
}

interface LineChartConfig extends BaseConfigChart {
  type: 'line' | 'area';
  //data series
  spanGaps?: boolean;
  stepped?: boolean | 'before' | 'after' | 'middle';
  tension?: number;
  areaOpacity?: number;
  pointBackgroundColour?: string;
  pointRotation?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  pointHoverBorderWidth?: number;
  pointHoverBorderColor?: string;
  pointHoverBackgroundColor?: string;
  pointHitRadius?: number;
  pointBorderWidth?: number;
  pointBorderColor?: string;
}

interface AreaChartConfig extends LineChartConfig {
  type: 'area';
  fill: boolean;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut';

export interface ChartConfig {
  id?: string;
  datasetId: string;
  type: ChartType;
  xField: string;
  yFields: string[];
  aggregation?: 'sum' | 'avg' | 'count';
  createdAt?: Date;
}

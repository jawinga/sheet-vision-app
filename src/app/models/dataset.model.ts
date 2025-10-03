export interface Dataset {
  id?: string;
  name: string;
  columns: string[];
  rowCount: number;
  sampleRows?: any[][];
  createdAt?: Date;
}

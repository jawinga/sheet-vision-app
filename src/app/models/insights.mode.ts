export interface InsightsRequestDTO {
  fileName: string;
  sheetName: string;
  rowCount: number;
  columns: string[];
  rows: Array<Record<string, any>>;
  sampleRows: Array<Record<string, any>>;
}

export interface InsightsResponseDTO {
  success: boolean;
  error: string | null;
  trends: string | null;
  anomalies: string[] | null;
  recommendations: string | null;
}

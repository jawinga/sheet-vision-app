import { Injectable } from '@angular/core';


export interface HeaderDetectOptions {
  maxScanRows?: number;        // default: 6
  textMaxLength?: number;      // default: 24
  headerMinTextRatio?: number; // default: 0.60
  dataMinNumericRatio?: number;// default: 0.35
  minCols?: number;            // default: 3
  knownKeywords?: string[];    // default: []
  mergeWeight?: number;        // default: 1.0
  allowBannerRow?: boolean;    // default: true
  minHeaderDepth?: number;     // default: 1
  maxHeaderDepth?: number;     // default: 6
  debug?: boolean;             // default: false
}

export interface HeaderDetectDiagnostics {
  rowStats?: Array<{
    rowIndex: number;
    ratioText: number;
    ratioShortText: number;
    ratioNumber: number;
    ratioDate: number;
    ratioEmpty: number;
    headerish: boolean;
    dataish: boolean;
  }>;
  depthFromMerges?: number;
  depthFromHeuristic?: number;
  mergesConsidered?: boolean;
  warnings?: string[];
}

export type HeaderDetectReason =
  | 'OK'
  | 'EMPTY_SHEET'
  | 'TOO_NARROW'
  | 'NO_ROWS_SCANNED';

export interface HeaderDetectResult {
  valid: boolean;               
  reason: HeaderDetectReason;
  headerDepth: number;         
  diagnostics?: HeaderDetectDiagnostics;
  usedOptions?: Required<HeaderDetectOptions>;
}


@Injectable({
  providedIn: 'root'
})
export class HeaderDepth {


  private readonly defaults: Required<HeaderDetectOptions> = {

      maxScanRows: 6,
      textMaxLength: 24,
      headerMinTextRatio: 0.60,
      dataMinNumericRatio: 0.35,
      minCols: 3,
      knownKeywords: ["Total","Subtotal","Q1","Q2","Region","Country"],
      mergeWeight: 1.0,
      allowBannerRow: true,
      minHeaderDepth: 1,
      maxHeaderDepth: 6,
      debug: false,

  }


  heuristicDetectsDepth(rawAoA: (unknown | null)[][], opts?:HeaderDetectOptions ):HeaderDetectResult{


    const cfg:Required<HeaderDetectOptions> = {

      ...this.defaults,
      ...(opts ?? {})
    }


    //check if sheet is empty, early exit
      if (!Array.isArray(rawAoA) || rawAoA.length === 0) {
    return {
      valid: false,
      reason: 'EMPTY_SHEET',
      headerDepth: 0,
      usedOptions: cfg,
      diagnostics: {
        warnings: ['No rows found in sheet.'],
      },
    };
  }

  //findFirst row

  const startRow = this.findFirstNonEmptyRow(rawAoA);

  if(startRow < 0 || startRow >= rawAoA.length){

    return {
      valid: false,
      reason: 'EMPTY_SHEET',
      headerDepth: 0,
      usedOptions: cfg,
      diagnostics: {
        warnings: ['All rows are empty.'],
      },
  }
  }

    // (c) Too narrow (not enough non-empty columns in that first meaningful row)
  const firstRow = Array.isArray(rawAoA[startRow]) ? rawAoA[startRow] : [];
  const nonEmptyCols = this.countNonEmpty(firstRow);
  if (nonEmptyCols < cfg.minCols) {
    return {
      valid: false,
      reason: 'TOO_NARROW',
      headerDepth: 0,
      usedOptions: cfg,
      diagnostics: {
        warnings: [
          `Detected only ${nonEmptyCols} non-empty column(s) in first meaningful row; minCols=${cfg.minCols}.`,
        ],
      },
    };
  }

  const lastDataRow = this.findLastNonEmptyRow(rawAoA);
  const scanEnd = Math.min(startRow + cfg.maxScanRows - 1, lastDataRow);
  if (scanEnd < startRow) {
    return {
      valid: false,
      reason: 'NO_ROWS_SCANNED',
      headerDepth: 0,
      usedOptions: cfg,
      diagnostics: {
        warnings: ['No rows available in the scan window.'],
      },
    };
  }

  // STEP 1 ends here. We don’t compute depth yet.
  // Return a neutral OK with headerDepth=1 as a placeholder so you can proceed to next steps.
  return {
    valid: true,
    reason: 'OK',
    headerDepth: 1, // placeholder; will be refined in Steps 2–5
    usedOptions: cfg,
    diagnostics: {
      warnings: [],
    },
  };

}


  //helpers

  private findLastNonEmptyRow(aoa: (unknown | null)[][]): number {
  for (let i = aoa.length - 1; i >= 0; i--) {
    const row = aoa[i];
    if (Array.isArray(row) && row.some((c) => this.hasValue(c))) return i;
  }
  return -1;
}

  private findFirstNonEmptyRow(aoa:unknown[][]):number{

    for (let i = 0; i < aoa.length; i++) {
      const row = aoa[i];

    if (Array.isArray(row) && row.some((c) => this.hasValue(c))) return i;
   
    }

    return -1

  }

  private hasValue(v:unknown):boolean{

      if(v === undefined || v === '' ) return false;

    if (typeof v === 'string') return v.trim().length > 0;

    return true;

  }

  private countNonEmpty(row: (unknown | null)[]): number {
  return row.reduce((acc, c) => acc + (this.hasValue(c) ? 1 : 0), 0);
}


  
}

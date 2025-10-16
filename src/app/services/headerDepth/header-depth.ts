import { Injectable } from '@angular/core';
import { keywords } from '../../shared/constants/keywords';

export interface HeaderDetectOptions {
  maxScanRows?: number;        // default: 6
  textMaxLength?: number;      // default: 24
  headerMinTextRatio?: number; // default: 0.60 (soft bias)
  dataMinNumericRatio?: number;// default: 0.35 (soft bias)
  minCols?: number;            // default: 3
  knownKeywords?: string[];    // default: []
  mergeWeight?: number;        // default: 1.0 (reserved for merges integration)
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
    headerScore: number;
    dataScore: number;
    headerish: boolean;
    dataish: boolean;
  }>;
  depthFromMerges?: number;
  depthFromHeuristic?: number;
  mergesConsidered?: boolean;
  warnings?: string[];
}

export interface PreliminaryHeaderDetectDiagnosis {
  empty: boolean;
  numberish: boolean;
  dateish: boolean;
  shortLabel: boolean;
  longLabel: boolean;
  keywords: boolean;
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

@Injectable({ providedIn: 'root' })
export class HeaderDepth {
  private readonly defaults: Required<HeaderDetectOptions> = {
    maxScanRows: 6,
    textMaxLength: 24,
    headerMinTextRatio: 0.60,
    dataMinNumericRatio: 0.35,
    minCols: 3,
    knownKeywords: keywords,
    mergeWeight: 1.0,
    allowBannerRow: true,
    minHeaderDepth: 1,
    maxHeaderDepth: 6,
    debug: false,
  };

  heuristicDetectsDepth(rawAoA: (unknown | null)[][], opts?: HeaderDetectOptions): HeaderDetectResult {
    const cfg: Required<HeaderDetectOptions> = { ...this.defaults, ...(opts ?? {}) };

    // quick exits
    if (!Array.isArray(rawAoA) || rawAoA.length === 0) {
      return {
        valid: false,
        reason: 'EMPTY_SHEET',
        headerDepth: 0,
        usedOptions: cfg,
        diagnostics: { warnings: ['No rows found in sheet.'] },
      };
    }

    const startRow = this.findFirstNonEmptyRow(rawAoA);
    if (startRow < 0 || startRow >= rawAoA.length) {
      return {
        valid: false,
        reason: 'EMPTY_SHEET',
        headerDepth: 0,
        usedOptions: cfg,
        diagnostics: { warnings: ['All rows are empty.'] },
      };
    }

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
        diagnostics: { warnings: ['No rows available in the scan window.'] },
      };
    }

    const rowStats: NonNullable<HeaderDetectDiagnostics['rowStats']> = [];

    for (let r = startRow; r <= scanEnd; r++) {
      const row = rawAoA[r];
      if (!Array.isArray(row) || !row.some(c => this.hasValue(c))) continue;

      const total = row.length || 1;

      let nTextShort = 0, nTextLong = 0, nNumber = 0, nDate = 0, nEmpty = 0, nKeyWords = 0;

      const cellDiagnosis: PreliminaryHeaderDetectDiagnosis[] =
        row.map(c => this.diagnoseCell(c, cfg.textMaxLength));

      for (const d of cellDiagnosis) {
        if (d.shortLabel) nTextShort++;
        if (d.longLabel)  nTextLong++;
        if (d.numberish)  nNumber++;
        if (d.dateish)    nDate++;
        if (d.empty)      nEmpty++;
        if (d.keywords)   nKeyWords++;
      }

      const ratioShortLabel = nTextShort / total;
      const ratioLongLabel  = nTextLong  / total;
      const ratioNumber     = nNumber    / total;
      const ratioDate       = nDate      / total;
      const ratioEmpty      = nEmpty     / total;
      const ratioKeywords   = nKeyWords  / total;
      const ratioText       = Math.max(0, 1 - ratioNumber - ratioDate - ratioEmpty);

      // base scores
      let headerScore = this.clamp01(
        0.45 * ratioShortLabel +
        0.15 * ratioText +
        0.10 * ratioKeywords +
        0.10 * (1 - ratioEmpty) -
        0.15 * ratioNumber -
        0.10 * ratioDate -
        0.10 * ratioLongLabel
      );

      let dataScore = this.clamp01(
        0.45 * ratioNumber +
        0.25 * ratioDate +
        0.20 * (1 - ratioEmpty) -
        0.20 * ratioShortLabel
      );

      // optional soft biases based on config thresholds
      if (ratioShortLabel < cfg.headerMinTextRatio) {
        headerScore = this.clamp01(headerScore - 0.05);
      }
      if (ratioNumber < cfg.dataMinNumericRatio) {
        dataScore = this.clamp01(dataScore - 0.05);
      }

      const headerish = headerScore >= 0.60 && dataScore <= 0.40;
      const dataish   = dataScore  >= 0.60;

      if (cfg.debug) {
      
        console.log(
          `r${r}: H=${headerScore.toFixed(2)} D=${dataScore.toFixed(2)} | ` +
          `short=${(ratioShortLabel*100|0)}% num=${(ratioNumber*100|0)}% ` +
          `date=${(ratioDate*100|0)}% empty=${(ratioEmpty*100|0)}%`
        );
      }

      rowStats.push({
        rowIndex: r,
        ratioText,
        ratioShortText: ratioShortLabel,
        ratioNumber,
        ratioDate,
        ratioEmpty,
        headerScore,
        dataScore,
        headerish,
        dataish,
      });
    }

    const statAt = (row: number) => rowStats.find(s => s.rowIndex === row);

    let firstHeaderRow = startRow;
    const first = statAt(startRow);

    if (first && !first.headerish && cfg.allowBannerRow) {
      const isClose = first.headerScore >= (0.60 - 0.05) && first.dataScore <= 0.60;
      if (isClose) firstHeaderRow = startRow + 1;
    }

    let depth = 0;
    for (let r = firstHeaderRow; r <= scanEnd; r++) {
      const st = statAt(r);
      if (!st || !st.headerish) break;
      depth++;
      if (depth >= cfg.maxHeaderDepth) break;
    }

    if (depth < cfg.minHeaderDepth) depth = cfg.minHeaderDepth;
    if (depth > cfg.maxHeaderDepth) depth = cfg.maxHeaderDepth;

    return {
      valid: true,
      reason: 'OK',
      headerDepth: depth,
      usedOptions: cfg,
      diagnostics: {
        rowStats,
        depthFromHeuristic: depth,
        mergesConsidered: false,
        warnings: depth === cfg.minHeaderDepth
          ? ['Header depth fell back to minimum (few header-like rows detected).']
          : [],
      },
    };
  }

  // helpers

  private findLastNonEmptyRow(aoa: (unknown | null)[][]): number {
    for (let i = aoa.length - 1; i >= 0; i--) {
      const row = aoa[i];
      if (Array.isArray(row) && row.some(c => this.hasValue(c))) return i;
    }
    return -1;
  }

  private findFirstNonEmptyRow(aoa: unknown[][]): number {
    for (let i = 0; i < aoa.length; i++) {
      const row = aoa[i];
      if (Array.isArray(row) && row.some(c => this.hasValue(c))) return i;
    }
    return -1;
  }

  private hasValue(v: unknown): boolean {
    if (v === undefined || v === null || v === '') return false;
    if (typeof v === 'string') return v.trim().length > 0;
    return true;
  }

  private countNonEmpty(row: (unknown | null)[]): number {
    return row.reduce((acc: number, c) => acc + (this.hasValue(c) ? 1 : 0), 0);
  }

  private clamp01(x: number): number {
    return Math.max(0, Math.min(1, x));
  }

  private isStringLikeNumber(str: string): boolean {
    const s = str.trim();
    if (!s) return false;
    if (!/^[+-]?\d+(\.\d+)?$/.test(s)) return false;
    const n = Number(s);
    return Number.isFinite(n);
  }

  private isStringLikeDate(str: string): boolean {
    const trimmed = str.trim();
    if (trimmed.length < 4 || trimmed.length > 20) return false;

    const iso = /^\d{4}-\d{1,2}(-\d{1,2})?$/;             // 2024-01 or 2024-01-10
    const slashes = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/; // 10/01/2024 or 10-01-24
    const textual = /^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}$/; // 10 Jan 2024

    if (iso.test(trimmed) || slashes.test(trimmed) || textual.test(trimmed)) return true;

    const parsed = Date.parse(trimmed);
    return Number.isFinite(parsed);
  }

  private containsKeyword(cell: string, keywords: string[]): boolean {
    const normalised = cell.trim().toLowerCase();
    return keywords.some(k => normalised === k.trim().toLowerCase());
  }

  private diagnoseCell(cell: unknown, textMaxLength: number): PreliminaryHeaderDetectDiagnosis {
    const diag: PreliminaryHeaderDetectDiagnosis = {
      empty: false,
      numberish: false,
      dateish: false,
      shortLabel: false,
      longLabel: false,
      keywords: false,
    };

    // empty
    if (cell === null || cell === undefined || (typeof cell === 'string' && cell.trim() === '')) {
      diag.empty = true;
      return diag;
    }

    // numberish
    if (typeof cell === 'number' || (typeof cell === 'string' && this.isStringLikeNumber(cell))) {
      diag.numberish = true;
      return diag;
    }

    // dateish
    if (cell instanceof Date || (typeof cell === 'string' && this.isStringLikeDate(cell))) {
      diag.dateish = true;
      return diag;
    }

    // strings: length & keywords
    if (typeof cell === 'string') {
      const s = cell.trim();
      if (s.length > textMaxLength) {
        diag.longLabel = true;
      } else {
        diag.shortLabel = true;
      }
      if (this.containsKeyword(s, this.defaults.knownKeywords)) {
        diag.keywords = true;
      }
      return diag;
    }

    // everything else (booleans, objects) => neither empty/number/date; treat as label-ish short by default
    diag.shortLabel = true;
    return diag;
  }
}
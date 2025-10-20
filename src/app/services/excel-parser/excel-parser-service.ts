import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { HeaderDepth } from '../headerDepth/header-depth';
import { CellValue } from '../../shared/helpers/cell-types';

import { hasValue, normalizeCell } from '../../shared/helpers/cell-helpers';
import { findFirstNonEmptyRow } from '../../shared/helpers/row-helpers';
import { HeaderComposer } from '../headerComposer/header-composer';

export interface ParseOptions {
  sheetName?: string;
  headerRowIndex?: number;
  sampleLimit?: number;
  maxRows?: number;
  headerDepth?: number;
  expandMerges?: boolean;
}

export interface ParseResult {
  sheetName: string;
  sheetNames: string[];
  columns: string[];
  rowCount: number;
  rows: Array<Record<string, CellValue>>;
  sampleRows: Array<Record<string, CellValue>>;
  mergeRanges?: Array<{
    s: { r: number; c: number };
    e: { r: number; c: number };
  }>;
  headerRows?: CellValue[][];
  startRow?: number;
  headerDepth?: number;
  warnings: string[];
}

type HeaderCellVM = {
  text: string;
  rowSpan: number;
  colSpan: number;
  hidden: boolean;
};

type HeaderVM = HeaderCellVM[][];

@Injectable({
  providedIn: 'root',
})
export class ExcelParserService {
  constructor(
    private headerDepthService: HeaderDepth,
    private headerComposer: HeaderComposer
  ) {}

  async parseExcel(file: File, opts: ParseOptions = {}): Promise<ParseResult> {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array', cellDates: true });
    const sheetName = opts.sheetName ?? wb.SheetNames[0];
    const sheetNames = wb.SheetNames;
    const ws = wb.Sheets[sheetName];

    if (!ws) throw new Error(`Sheet ${sheetName} not found`);

    const mergeRangesOriginal = (ws['!merges'] ?? []).map((m) => ({
      s: { ...m.s },
      e: { ...m.e },
    }));

    const localWarnings: string[] = [];

    if (opts.expandMerges !== false) {
      const stats = this.expandMergesInWorksheet(ws);

      if (stats.merges > 0) {
        localWarnings.push(
          `Expanded ${stats.merges} merged range(s); filled ${stats.filled} cell(s).`
        );
      }
    }

    const aoa: CellValue[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: true,
      defval: null,
      blankrows: false,
    });

    const {
      startRow,
      headerDepth,
      warnings: detectWarnings,
    } = this.resolveHeaderConfig(aoa, opts, this.headerDepthService);

    const safeDepth = Math.max(1, headerDepth);
    const headerRows = aoa.slice(startRow, startRow + safeDepth);
    const { headers, warnings: composeWarnings } = this.headerComposer.compose(
      headerRows,
      {
        joiner: '_',
        fallbackPrefix: 'col',
      }
    );

    const firstDataRow = startRow + safeDepth;

    let dataAoA = aoa
      .slice(firstDataRow)
      .filter((r) => Array.isArray(r) && r.some((cell) => hasValue(cell)));

    if (typeof opts.maxRows === 'number' && opts.maxRows > 0) {
      dataAoA = dataAoA.slice(0, opts.maxRows);
    }

    const rows = dataAoA.map((r) => {
      const obj: Record<string, CellValue> = {};
      headers.forEach((h, i) => {
        obj[h] = normalizeCell(r[i]);
      });
      return obj;
    });

    const sampleLimit = opts.sampleLimit ?? 10;

    const warnings = [...localWarnings, ...detectWarnings, ...composeWarnings];
    return {
      sheetName,
      sheetNames,
      columns: headers,
      rowCount: rows.length,
      rows,
      sampleRows: rows.slice(0, sampleLimit),
      mergeRanges: mergeRangesOriginal,
      headerRows,
      startRow,
      headerDepth,
      warnings,
    };
  }

  //helpers

  private resolveHeaderConfig(
    aoa: CellValue[][],
    opts: ParseOptions,
    headerDepthService: HeaderDepth
  ): {
    startRow: number;
    headerDepth: number;
    warnings: string[];
  } {
    const warnings: string[] = [];

    //explicit override (user provides row index and header depth)

    if (
      typeof opts.headerRowIndex === 'number' &&
      typeof opts.headerDepth === 'number'
    ) {
      return {
        startRow: opts.headerRowIndex,
        headerDepth: opts.headerDepth,
        warnings: [
          'User override: both headerRowIndex and headerDepth provided. Auto-detect skipped.',
        ],
      };
    }

    //user only provides header depth

    if (opts.headerDepth && typeof opts.headerRowIndex !== 'number') {
      const startRow = findFirstNonEmptyRow(aoa);

      return {
        startRow,
        headerDepth: opts.headerDepth,
        warnings: [
          'User override: fixed headerDepth used, startRow auto-detected.',
        ],
      };
    }

    //nothing provided-full detection

    const detect = headerDepthService.heuristicDetectsDepth(aoa);

    if (detect.valid) {
      const startRow = findFirstNonEmptyRow(aoa);

      return {
        startRow,
        headerDepth: detect.headerDepth,
        warnings: detect.diagnostics?.warnings ?? [],
      };
    } else {
      warnings.push(
        `Detector failed (${detect.reason}); defaulting to first non-empty row + depth = 1.`
      );
      return {
        startRow: findFirstNonEmptyRow(aoa),
        headerDepth: 1,
        warnings,
      };
    }
  }

  // private mergeData<T>(rawData: (T | null)[]): T[] {
  //   let lastValue: T | null = null;

  //   return rawData.map((value) => {
  //     if (value !== null && value !== undefined) {
  //       lastValue = value;
  //     }
  //     return lastValue as T;
  //   });
  // }

  private expandMergesInWorksheet(ws: XLSX.WorkSheet): {
    merges: number;
    filled: number;
  } {
    const merges = ws['!merges'];
    if (!Array.isArray(merges) || merges.length === 0)
      return { merges: 0, filled: 0 };

    let filled = 0;

    for (const m of merges) {
      const topLeftRef = XLSX.utils.encode_cell(m.s);
      const topLeftCell = ws[topLeftRef];
      if (!topLeftCell || !('v' in topLeftCell)) continue;

      for (let r = m.s.r; r <= m.e.r; r++) {
        for (let c = m.s.c; c <= m.e.c; c++) {
          const ref = XLSX.utils.encode_cell({ r, c });
          const tgt = ws[ref] as any;
          const isTrulyEmpty = !tgt || !('v' in tgt);
          if (!isTrulyEmpty) continue;

          const { t, v, z, w, s } = topLeftCell;
          ws[ref] = s ? { t, v, z, w, s } : { t, v, z, w };
          filled++;
        }
      }
    }
    return { merges: merges.length, filled };
  }
}

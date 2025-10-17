import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { HeaderDepth } from '../headerDepth/header-depth';
import { CellValue } from '../../shared/helpers/cell-types';

import {
  hasValue,
  cleanAndUniqHeaders,
  normalizeCell,
} from '../../shared/helpers/cell-helpers';
import { findFirstNonEmptyRow } from '../../shared/helpers/row-helpers';

export interface ParseOptions {
  sheetName?: string; //default first
  headerRowIndex?: number;
  sampleLimit?: number;
  maxRows?: number;
  headerDepth?: number;
}

export interface ParseResult {
  sheetName: string;
  columns: string[];
  rowCount: number;
  rows: Array<Record<string, CellValue>>;
  sampleRows: Array<Record<string, CellValue>>;
  warnings: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ExcelParserService {
  constructor(private headerDepthService: HeaderDepth) {}

  async parseExcel(file: File, opts: ParseOptions = {}): Promise<ParseResult> {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array', cellDates: true });

    const sheetName = opts.sheetName ?? wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    if (!ws) throw new Error(`Sheet ${sheetName} not found`);

    const aoa: any[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: true,
      defval: null,
      blankrows: false,
    }) as any[][];

    const {
      startRow,
      headerDepth,
      warnings: detectWarnings,
    } = this.resolveHeaderConfig(aoa, opts, this.headerDepthService);

    const rawHeaderRow = Array.isArray(aoa[startRow]) ? aoa[startRow] : [];
    const rawHeaders = rawHeaderRow.map((c) => (c ?? '').toString().trim());
    const { headers, warnings: headerCleanWarnings } =
      cleanAndUniqHeaders(rawHeaders);

    const firstDataRow = startRow + headerDepth;

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

    const warnings = [...detectWarnings, ...headerCleanWarnings];

    return {
      sheetName,
      columns: headers,
      rowCount: rows.length,
      rows,
      sampleRows: rows.slice(0, sampleLimit),
      warnings,
    };
  }

  //helpers

  private resolveHeaderConfig(
    aoa: (CellValue | null)[][],
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

  private mergeData<T>(rawData: (T | null)[]): T[] {
    let lastValue: T | null = null;

    return rawData.map((value) => {
      if (value !== null && value !== undefined) {
        lastValue = value;
      }
      return lastValue as T;
    });
  }
}

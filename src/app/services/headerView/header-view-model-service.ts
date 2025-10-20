import { Injectable } from '@angular/core';
import type * as XLSX from 'xlsx';
import { CellValue } from '../../shared/helpers/cell-types';

export interface HeaderCellVM {
  text: string;
  rowspan: number;
  colspan: number;
  hidden: boolean;
}

export type HeaderVMRow = HeaderCellVM[];
export type HeaderVM = HeaderVMRow[];

export interface HeaderVMOptions {
  merges?: XLSX.Range[];
  forwardFillVertical?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HeaderViewModelService {
  buildHeaderVM(
    headerRows: CellValue[][],
    opts: HeaderVMOptions & {
      merges?: Array<{
        s: { r: number; c: number };
        e: { r: number; c: number };
      }>;
      headerTop?: number;
    } = {}
  ): HeaderVM {
    const normalized = this.normalizeRect(headerRows);

    const ffRows: string[][] = normalized.map((row) => {
      const asText = row.map((v) => this.toText(v));
      return this.forwardFillRow(asText);
    });

    let vm: HeaderVM = ffRows.map((row) =>
      row.map((text) => ({
        text,
        rowspan: 1,
        colspan: 1,
        hidden: false,
      }))
    );

    if (opts.merges && opts.merges.length) {
      vm = this.applyNativeMerges(vm, opts.merges, opts.headerTop ?? 0);
    }

    vm = this.applyHorizontalSpans(vm);
    vm = this.applyVerticalSpans(vm);

    return vm;
  }

  private applyVerticalSpans(vm: HeaderVM): HeaderVM {
    const rows = vm.length;
    const cols = rows ? vm[0].length : 0;

    for (let c = 0; c < cols; c++) {
      let r = 0;
      while (r < rows) {
        const cell = vm[r][c];

        // Skip hidden or empty unless it's the start of a vertical block
        if (!cell || cell.hidden) {
          r++;
          continue;
        }

        const text = cell.text;
        if (!text) {
          r++;
          continue;
        }

        let span = 1;
        let k = r + 1;

        // 👇 Modified: treat blank cells as continuations of the same header
        while (k < rows) {
          const next = vm[k][c];
          if (!next || next.hidden) break;

          // If next cell is empty OR same text, include it in the rowspan
          if (!next.text || next.text === text) {
            span++;
            k++;
          } else break;
        }

        cell.rowspan = span;
        if (span > 1) {
          for (let i = r + 1; i < r + span; i++) {
            vm[i][c].hidden = true;
          }
        }

        r += span;
      }
    }

    return vm;
  }

  private applyHorizontalSpans(vm: HeaderVM): HeaderVM {
    for (const row of vm) {
      let c = 0;
      while (c < row.length) {
        const cell = row[c];

        if (cell.hidden) {
          c++;
          continue;
        }

        const text = cell.text;
        if (!text) {
          c++;
          continue;
        }

        let span = 1;
        let k = c + 1;
        while (k < row.length) {
          const next = row[k];
          if (next.hidden || !next.text || next.text !== text) break;
          span++;
          k++;
        }

        cell.colspan = span;
        if (span > 1) {
          for (let j = c + 1; j < c + span; j++) {
            row[j].hidden = true;
          }
        }

        c += span;
      }
    }
    return vm;
  }

  private normalizeRect(rows: CellValue[][]): CellValue[][] {
    const width = rows.reduce((m, r) => Math.max(m, r.length), 0);
    return rows.map((r) =>
      r.length === width
        ? r.slice()
        : [...r, ...Array(width - r.length).fill('')]
    );
  }

  private toText(v: CellValue): string {
    if (v === null || v === undefined) return '';
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    return String(v).trim();
  }

  private applyNativeMerges(
    vm: HeaderVM,
    merges: Array<{ s: { r: number; c: number }; e: { r: number; c: number } }>,
    headerTop: number
  ): HeaderVM {
    const H = vm.length;
    const W = H ? vm[0].length : 0;
    const headerBottom = headerTop + H - 1;

    for (const m of merges) {
      if (m.e.r < headerTop || m.s.r > headerBottom) continue;

      const localR0 = Math.max(0, m.s.r - headerTop);
      const localR1 = Math.min(H - 1, m.e.r - headerTop);
      const localC0 = Math.max(0, m.s.c);
      const localC1 = Math.min(W - 1, m.e.c);

      // Sanity check:
      if (localR0 > localR1 || localC0 > localC1) continue;

      const topCell = vm[localR0]?.[localC0];
      if (!topCell || topCell.hidden) continue;

      const rspan = localR1 - localR0 + 1;
      const cspan = localC1 - localC0 + 1;
      topCell.rowspan = Math.max(topCell.rowspan, rspan);
      topCell.colspan = Math.max(topCell.colspan, cspan);

      for (let r = localR0; r <= localR1; r++) {
        for (let c = localC0; c <= localC1; c++) {
          if (r === localR0 && c === localC0) continue;
          vm[r][c].hidden = true;
        }
      }
    }

    return vm;
  }

  private ffillRow<T>(row: T[], toText: (v: T) => string): T[] {
    const out = row.slice();
    let lastIdx = -1;
    for (let c = 0; c < out.length; c++) {
      const txt = toText(out[c]);
      if (txt) lastIdx = c;
      else if (lastIdx >= 0) out[c] = out[lastIdx];
    }
    return out;
  }

  private forwardFillRow(row: string[]): string[] {
    let last = '';
    return row.map((s) => {
      const t = (s ?? '').trim();
      if (t) last = t;
      return t || last; // fill empty with last seen to the left
    });
  }
}

import { Injectable } from '@angular/core';
import {
  hasValue,
  cleanAndUniqHeaders,
} from '../../shared/helpers/cell-helpers';
import { CellValue } from '../../shared/helpers/cell-types';

export interface ComposeOptions {
  joiner?: string; //joining labels
  fallbackPrefix?: string; //empty columns
}

export interface ComposeResult {
  headers: string[];
  warnings: string[];
}

// When you’re ready, say “next step” and we’ll add the clean + dedupe pass right after this loop, reusing your parser’s logic so naming rules stay consistent across the app.

@Injectable({
  providedIn: 'root',
})
export class HeaderComposer {
  compose(headerRows: CellValue[][], opts: ComposeOptions = {}): ComposeResult {
    const joiner = opts.joiner ?? '_';
    const fallbackPrefix = opts.fallbackPrefix ?? 'col';

    //guard
    if (!Array.isArray(headerRows) || headerRows.length === 0) {
      return { headers: [], warnings: ['No header rows found'] };
    }

    const normalised: CellValue[][] = headerRows.map((row) =>
      Array.isArray(row) ? row : []
    );

    const filledRows: CellValue[][] = normalised.map((row) =>
      this.forwardFillRow(row)
    );

    const maxCols = this.findMax(filledRows);

    const shapedRows = filledRows.map((r) =>
      r.length === maxCols ? r : [...r, ...Array(maxCols - r.length).fill('')]
    );

    const verticalFilled = this.forwardFillDown(shapedRows);

    // VERTICAL
    const { headers: verticalRaw, warnings: vWarn } = this.collapseColumns(
      verticalFilled,
      joiner,
      fallbackPrefix
    );

    // // HORIZONTAL (left→right across a row) — only if you want it:
    // const transposed = this.transpose(shapedRows);
    // const { headers: horizontalRaw, warnings: hWarn } = this.collapseColumns(
    //   transposed,
    //   opts.joiner ?? '_',
    //   opts.fallbackPrefix ?? 'col'
    // );

    // const cleanedHorizontal = cleanAndUniqHeaders(horizontalRaw);
    const cleanedVertical = cleanAndUniqHeaders(verticalRaw);

    return {
      headers: cleanedVertical.headers,
      warnings: [...vWarn, ...cleanedVertical.warnings],
    };
  }

  //example ["Q1", "", "Q2"] -- >  "Q1", "Q1", "Q2"
  private forwardFillRow(row: CellValue[]): CellValue[] {
    let last: CellValue = null;

    return row.map((v) => {
      if (hasValue(v)) {
        last = v;
        return v;
      }

      return last;
    });
  }

  private forwardFillDown(rows: CellValue[][]): CellValue[][] {
    const h = rows.length;
    const w = this.findMax(rows);

    const out = rows.map((r) => r.slice());
    const lastSeen: CellValue[] = new Array(w).fill(null);

    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const val = out[r][c];

        if (hasValue(val)) {
          lastSeen[c] = val;
        } else {
          out[r][c] = lastSeen[c];
        }
      }
    }

    return out;
  }

  private findMax(rows: CellValue[][]): number {
    let max = 0;

    rows.forEach((r) => {
      if (Array.isArray(r) && r.length > max) {
        max = r.length;
      }
    });

    return max;
  }

  private collapseColumns(
    rows: CellValue[][],
    joiner = '_',
    fallbackPrefix = 'col'
  ): { headers: string[]; warnings: string[] } {
    const warnings: string[] = [];
    const headers: string[] = [];
    const maxCols = this.findMax(rows);

    for (let c = 0; c < maxCols; c++) {
      const parts: string[] = [];

      for (const row of rows) {
        const raw = row[c];
        const s = (raw ?? '').toString().trim();
        if (s) parts.push(s);
      }

      if (parts.length === 0) {
        const label = `${fallbackPrefix}_${c + 1}`;
        headers.push(label);
        warnings.push(`Empty header column at index ${c} → using "${label}".`);
      } else {
        headers.push(parts.join(joiner));
      }
    }

    return { headers, warnings };
  }
}

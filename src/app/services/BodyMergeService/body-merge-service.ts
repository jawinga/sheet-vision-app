// body-merge.service.ts
import { Injectable } from '@angular/core';

export interface MergeCellMeta {
  text: string;
  rowspan: number;
  hidden: boolean;
}

@Injectable({ providedIn: 'root' })
export class BodyMergeService {
  computeRowSpans(
    rows: Array<Record<string, unknown>>,
    key: string
  ): MergeCellMeta[] {
    const meta: MergeCellMeta[] = rows.map(() => ({
      text: '',
      rowspan: 1,
      hidden: false,
    }));
    if (!rows.length) return meta;

    let i = 0;
    while (i < rows.length) {
      const first = rows[i]?.[key];
      const text = first == null ? '' : String(first);
      let span = 1;
      let j = i + 1;

      while (j < rows.length) {
        const nextText = rows[j]?.[key] == null ? '' : String(rows[j][key]);
        if (nextText !== text) break;
        span++;
        j++;
      }

      meta[i] = { text, rowspan: span, hidden: false };
      for (let k = i + 1; k < i + span; k++) {
        meta[k] = { text, rowspan: 1, hidden: true };
      }

      i = i + span;
    }

    return meta;
  }
}

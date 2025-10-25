import { hasValue } from './cell-helpers';
import { CellValue } from './cell-types';
import { isStringLikeNumber } from './cell-helpers';

export function findFirstNonEmptyRow(aoa: CellValue[][]): number {
  for (let i = 0; i < aoa.length; i++) {
    const row = aoa[i];
    if (Array.isArray(row) && row.some((c) => hasValue(c))) return i;
  }
  return -1;
}

export function findLastNonEmptyRow(aoa: (CellValue | null)[][]): number {
  for (let i = aoa.length - 1; i >= 0; i--) {
    const row = aoa[i];
    if (Array.isArray(row) && row.some((c) => hasValue(c))) return i;
  }
  return -1;
}

export function isColumnNumericish(
  rows: Array<Record<string, unknown>>,
  column: string
): boolean {
  let ratio: number = 0;
  let numericCount: number = 0;
  let nonNumericCount: number = 0;
  const minimumObserved = 3;
  const sample = Math.min(10, rows.length);

  for (let i = 0; i < sample; i++) {
    const val = rows[i]?.[column];
    if (typeof val === 'number' && Number.isFinite(val)) {
      numericCount += 1;
    } else if (typeof val === 'string' && isStringLikeNumber(val)) {
      numericCount += 1;
    } else if (val === undefined || val === null || val === ''.trim()) {
      continue;
    } else {
      nonNumericCount += 1;
    }
  }
  const observed = numericCount + nonNumericCount;

  if (observed < minimumObserved) return false;

  ratio = numericCount / observed;
  return ratio >= 0.7;
}

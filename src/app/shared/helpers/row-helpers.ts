import { hasValue } from './cell-helpers';

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

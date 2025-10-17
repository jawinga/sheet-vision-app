
export function containsKeyword(cell: string, keywords: string[]): boolean {
    const normalised = cell.trim().toLowerCase();
    return keywords.some(k => normalised === k.trim().toLowerCase());
  }


  export function isStringLikeDate(str: string): boolean {
    const trimmed = str.trim();
    if (trimmed.length < 4 || trimmed.length > 20) return false;

    const iso = /^\d{4}-\d{1,2}(-\d{1,2})?$/;             // 2024-01 or 2024-01-10
    const slashes = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/; // 10/01/2024 or 10-01-24
    const textual = /^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}$/; // 10 Jan 2024

    if (iso.test(trimmed) || slashes.test(trimmed) || textual.test(trimmed)) return true;

    const parsed = Date.parse(trimmed);
    return Number.isFinite(parsed);
  }  


  export function isStringLikeNumber(str: string): boolean {
    const s = str.trim();
    if (!s) return false;
    if (!/^[+-]?\d+(\.\d+)?$/.test(s)) return false;
    const n = Number(s);
    return Number.isFinite(n);
  }  

    export function hasValue(v: unknown): boolean {
    if (v === undefined || v === null || v === '') return false;
    if (typeof v === 'string') return v.trim().length > 0;
    return true;
  }

 
export function cleanAndUniqHeaders(raw:string[]){

    const seen = new Map<string, number>();
    const warnings: string[] = [];

    const headers = raw.map((h, i)=>{


      let cleanup = h
        .replace(/\r?\n/g, ' ')
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^\w]/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();


      if (!cleanup) {
      cleanup = `col_${i + 1}`; // fallback for empty headers
      warnings.push(`Empty header at column ${i + 1} renamed to "${cleanup}"`);
    }

      if(seen.has(cleanup)){

        const count = (seen.get(cleanup) ?? 1) + 1;
        seen.set(cleanup, count);

        const alt = `${cleanup}_${count}`;

        warnings.push(`Duplicate header "${h}" renamed to "${alt}"`);

        return alt;

      }else{

        seen.set(cleanup, 1);
        return cleanup;

      }

    });

    return {headers, warnings};

  }  


  export function normalizeCell(v:unknown){

    if(v === '' || v === undefined) return null;

    if(v instanceof Date) return v.toISOString();

    if (typeof v === 'number' && !isFinite(v)) {
      return null;
    }

    if(typeof v === 'number' && isNaN(v)){
      return null;
    }

    return v;

  }  
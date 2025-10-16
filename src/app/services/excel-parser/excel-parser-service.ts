import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { HeaderDepth } from '../headerDepth/header-depth';

export interface ParseOptions{
  sheetName?:string; //default first
  headerRowIndex?: number;
  sampleLimit?: number;
  maxRows?:number;
  headerDepth?:number;
}

export interface ParseResult{

  sheetName: string;
  columns: string[];
  rowCount: number;
  rows: Array<Record<string, unknown>>;   
  sampleRows: Array<Record<string, unknown>>;
  warnings: string[];   
  
}


@Injectable({
  providedIn: 'root'
})
export class ExcelParserService  {

  
  async parseExcel(file:File, opts: ParseOptions = {}): Promise<ParseResult>{
   
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, {type: 'array', cellDates: true});

    const sheetName = opts.sheetName ?? wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    if(!ws) throw new Error(`Sheet ${sheetName} not found`);

    const aoa: any[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,          
      raw: true,
      defval: null,
      blankrows: false
    }) as any[][];

    const headerRowIndex = typeof opts.headerRowIndex === 'number' ? opts.headerRowIndex : this.findFirstNonEmptyRow(aoa);

    const rawHeaderRow = Array.isArray(aoa[headerRowIndex]) ? aoa[headerRowIndex] : [];
    const rawHeaders = rawHeaderRow.map(c => (c ?? '').toString().trim());
    const { headers, warnings } = this.cleanAndUniqHeaders(rawHeaders);

    let dataAoA = aoa.slice(headerRowIndex + 1).filter((r)=> Array.isArray(r) && r.some(cell=>this.hasValue(cell)));

    if(typeof opts.maxRows === 'number' && opts.maxRows > 0){
      dataAoA = dataAoA.slice(0, opts.maxRows);
    }


    const rows = dataAoA.map((r)=>{

      const obj: Record<string, unknown> = {};
      headers.forEach((h, i)=>{
        obj[h] = this.normalizeCell(r[i]);
      });
      return obj;
    })

    const sampleLimit = opts.sampleLimit ?? 10;
    return {

      sheetName,
      columns: headers,
      rowCount: rows.length,
      rows,
      sampleRows: rows.slice(0, sampleLimit),
      warnings

    };

  }




  //helpers



  private resolveHeaderConfig(
  aoa: (unknown | null)[][],
  opts: ParseOptions,
  headerDepthService: HeaderDepth
): {
  startRow: number;
  headerDepth: number;
  warnings: string[];
} {

  const warnings: string[] = [];

  //explicit override (user provides row index and header depth)

  if(typeof opts.headerRowIndex === 'number' && typeof opts.headerDepth === 'number'){

    return{

      startRow: opts.headerRowIndex,
      headerDepth: opts.headerDepth,
      warnings: ['User override: both headerRowIndex and headerDepth provided. Auto-detect skipped.'],

    }
  }

  //user provided only header row

  if(typeof opts.headerRowIndex === 'number' && typeof opts.headerDepth === 'number'){

    const detect = headerDepthService.heuristicDetectsDepth(aoa);

    if(detect.valid){
      return{
        startRow: opts.headerRowIndex,
        headerDepth: detect.headerDepth,
        warnings: detect.diagnostics?.warnings ?? [],
      }
    } else{
      warnings.push(`Detector failed (${detect.reason}), defaulting to headerDepth = 1.`);

      return{
        startRow: opts.headerRowIndex,
        headerDepth: 1,
        warnings,
      }


    }
    
  }

  //user only provides header depth

  if(opts.headerDepth && typeof opts.headerRowIndex !== 'number'){

    const startRow = this.findFirstNonEmptyRow(aoa);

    return{

      startRow,
      headerDepth: opts.headerDepth,
      warnings: ['User override: fixed headerDepth used, startRow auto-detected.'],
    }
  }

  //nothing provided-full detection

  const detect = headerDepthService.heuristicDetectsDepth(aoa);

  if(detect.valid){

    const startRow = this.findFirstNonEmptyRow(aoa);

    return{

      startRow,
      headerDepth: detect.headerDepth,
      warnings: detect.diagnostics?.warnings ?? [],

    }

  }else{

    warnings.push(`Detector failed (${detect.reason}); defaulting to first non-empty row + depth = 1.`);
    return {
      startRow: this.findFirstNonEmptyRow(aoa),
      headerDepth: 1,
      warnings,
    };

  }







  }

  private findFirstNonEmptyRow(aoa: any[][]):number{

    const index = aoa.findIndex(r=>Array.isArray(r) && r.some(c=>this.hasValue(c)));
    return index >= 0 ? index : 0;

  }

  private hasValue(v:unknown):boolean{

    if(v === null || v === undefined) return false;
    if(typeof v === 'string') return v.trim().length > 0;
    return true

  }

  private normalizeCell(v:unknown){

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

  private cleanAndUniqHeaders(raw:string[]){

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

  private mergeData<T>(rawData: (T | null)[]): T[] {
  let lastValue: T | null = null;

  return rawData.map(value => {
    if (value !== null && value !== undefined) {
      lastValue = value;
    }
    return lastValue as T;
  });
}
}


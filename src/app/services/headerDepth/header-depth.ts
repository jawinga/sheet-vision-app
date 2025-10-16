import { Injectable } from '@angular/core';
import { of } from 'rxjs';



export interface HeaderDetectOptions {
  maxScanRows?: number;        // default: 6
  textMaxLength?: number;      // default: 24
  headerMinTextRatio?: number; // default: 0.60
  dataMinNumericRatio?: number;// default: 0.35
  minCols?: number;            // default: 3
  knownKeywords?: string[];    // default: []
  mergeWeight?: number;        // default: 1.0
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
    headerish: boolean;
    dataish: boolean;
  }>;
  depthFromMerges?: number;
  depthFromHeuristic?: number;
  mergesConsidered?: boolean;
  warnings?: string[];
}

export interface PreliminaryHeaderDetectDiagnosis{

  empty: boolean;
  numberish: boolean;
  dateish:boolean;
  shortLabel:boolean;
  longLabel: boolean;

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


@Injectable({
  providedIn: 'root'
})
export class HeaderDepth {


  private readonly defaults: Required<HeaderDetectOptions> = {

      maxScanRows: 6,
      textMaxLength: 24,
      headerMinTextRatio: 0.60,
      dataMinNumericRatio: 0.35,
      minCols: 3,
      knownKeywords: [
  // ─── Totals / Summaries ───────────────────────────────
  "Total", "Subtotal", "Suma", "Balance", "Importe", "Cantidad", "Monto",
  "Ganancia", "Pérdida", "Margen", "Promedio", "Media", "Mediana",
  "Desviación", "Varianza", "Conteo", "Cantidad", "Unidades", "Precio",
  "Valor", "Tasa", "Impuesto", "IVA", "Descuento", "Comisión", "Ingreso",
  "Egreso", "Beneficio", "Costo", "Coste",

  // ─── Time / Periods ───────────────────────────────
  "Date", "Fecha", "Mes", "Año", "Trimestre", "Q1", "Q2", "Q3", "Q4",
  "Semana", "Día", "Periodo", "Período", "Fiscal", "Temporada", "Semestre",
  "Inicio", "Fin", "Fecha de Inicio", "Fecha de Fin", "Hora", "Tiempo",
  "Actualización", "Modificado", "Creado", "Registro", "Timestamp",

  // ─── Geography / Locations ───────────────────────────────
  "Región", "Region", "País", "Country", "Provincia", "State", "Ciudad",
  "City", "Población", "Comunidad", "Código Postal", "Postal", "Dirección",
  "Address", "Localidad", "Zona", "Área", "Territorio", "Latitud", "Longitud",
  "Coordenadas", "Ubicación", "Location",

  // ─── Business / Sales / Marketing ───────────────────────────────
  "Cliente", "Customer", "Proveedor", "Supplier", "Vendedor", "Vendor",
  "Socio", "Partner", "Empleado", "Employee", "Departamento", "Department",
  "División", "Segmento", "Categoría", "Canal", "Marca", "Producto", "Item",
  "Artículo", "Servicio", "Pedido", "Order", "Factura", "Invoice",
  "Recibo", "Receipt", "Contrato", "Agreement", "Proyecto", "Campaña",
  "Oportunidad", "Lead", "Oferta", "Demanda", "Ventas", "Compras",

  // ─── Identifiers / Metadata ───────────────────────────────
  "ID", "Código", "Code", "Referencia", "Reference", "Número", "No.", "Index",
  "Clave", "Key", "UUID", "Serie", "Lote", "Batch", "Registro", "Entry",
  "Fila", "Línea", "Row", "Linea",

  // ─── Status / Flags ───────────────────────────────
  "Estado", "Status", "Activo", "Inactivo", "Habilitado", "Deshabilitado",
  "Pendiente", "Aprobado", "Rechazado", "Completado", "Cancelado",
  "Abierto", "Cerrado", "Válido", "Inválido", "Confirmado", "Borrador",

  // ─── Finance / Accounting ───────────────────────────────
  "Cuenta", "Account", "Débito", "Crédito", "Banco", "Cash", "Pago", "Payment",
  "Transacción", "Transaction", "Gasto", "Expense", "Presupuesto", "Budget",
  "Pronóstico", "Forecast", "Capital", "Equidad", "Activo", "Pasivo",
  "Moneda", "Currency", "Tipo de Cambio", "Exchange Rate",

  // ─── HR / People ───────────────────────────────
  "Nombre", "Name", "Apellido", "First Name", "Last Name", "Nombre Completo",
  "Full Name", "Iniciales", "Sexo", "Género", "Edad", "Años", "Empleado ID",
  "Trabajo", "Puesto", "Cargo", "Rol", "Equipo", "Manager", "Supervisor",
  "Fecha de Contratación", "Fecha de Despido", "Salario", "Sueldo", "Wage",

  // ─── Technical / System ───────────────────────────────
  "IP", "Servidor", "Host", "Dominio", "Domain", "Email", "Correo",
  "Teléfono", "Contacto", "Usuario", "User", "Contraseña", "Password",
  "Acceso", "Permiso", "Token", "Sesión", "Error", "Código", "Versión",
  "Sistema", "Dispositivo", "Equipo", "Aplicación",

  // ─── Education / Academic ───────────────────────────────
  "Estudiante", "Alumno", "Teacher", "Profesor", "Curso", "Materia", "Asignatura",
  "Nota", "Calificación", "Puntaje", "Examen", "Prueba", "Créditos",
  "Nivel", "Año", "Semestre", "Escuela", "Colegio", "Universidad", "Programa",

  // ─── Miscellaneous / Labels ───────────────────────────────
  "Descripción", "Description", "Detalles", "Notas", "Observaciones",
  "Comentarios", "Remarks", "Tipo", "Category", "Grupo", "Etiqueta", "Label",
  "Título", "Title", "Resumen", "Documento", "Adjunto", "Archivo",
  "Enlace", "Link", "Prioridad", "Rango", "Etapa", "Fase", "Estado Civil",
  "Comentarios", "Motivo", "Detalle",

  // ─── Logistics / Supply Chain ───────────────────────────────
  "Envío", "Shipment", "Entrega", "Delivery", "Guía", "Tracking", "Almacén",
  "Warehouse", "Inventario", "Stock", "Proveedor", "Transportista", "Carrier",
  "Ruta", "Arrival", "Salida", "Llegada", "Cantidad", "Precio Unitario",
  "Peso", "Volumen", "Dimensión", "Contenedor", "Bulto",

  // ─── Healthcare ───────────────────────────────
  "Paciente", "Doctor", "Hospital", "Diagnóstico", "Tratamiento",
  "Medicamento", "Prescripción", "Dosis", "Alergia", "Condición", "Procedimiento",
  "Fecha de Nacimiento", "Birthdate",

  // ─── Science / Environment ───────────────────────────────
  "Temperatura", "Presión", "Humedad", "Altitud", "Velocidad", "Distancia",
  "Tiempo", "Voltaje", "Corriente", "Energía", "Potencia", "Masa", "Densidad",
  "Tasa", "Porcentaje", "Ratio",

  // ─── Common abbreviations ───────────────────────────────
  "FY", "ID#", "No", "Yr", "Mo", "Wk", "Hr", "Min", "Sec",
  "Año Fiscal", "Semana", "Mes", "Trimestre", "Horas", "Minutos", "Segundos"
],      mergeWeight: 1.0,
      allowBannerRow: true,
      minHeaderDepth: 1,
      maxHeaderDepth: 6,
      debug: false,

  }


  heuristicDetectsDepth(rawAoA: (unknown | null)[][], opts?:HeaderDetectOptions ):HeaderDetectResult{


    const cfg:Required<HeaderDetectOptions> = {

      ...this.defaults,
      ...(opts ?? {})
    }


    //check if sheet is empty, early exit
      if (!Array.isArray(rawAoA) || rawAoA.length === 0) {
    return {
      valid: false,
      reason: 'EMPTY_SHEET',
      headerDepth: 0,
      usedOptions: cfg,
      diagnostics: {
        warnings: ['No rows found in sheet.'],
      },
    };
  }

  //findFirst row

  const startRow = this.findFirstNonEmptyRow(rawAoA);

  if(startRow < 0 || startRow >= rawAoA.length){

    return {
      valid: false,
      reason: 'EMPTY_SHEET',
      headerDepth: 0,
      usedOptions: cfg,
      diagnostics: {
        warnings: ['All rows are empty.'],
      },
  }
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
      diagnostics: {
        warnings: ['No rows available in the scan window.'],
      },
    };
  }

  const cellDiag: PreliminaryHeaderDetectDiagnosis = {
  empty: false,
  numberish: false,
  dateish: false,
  shortLabel: false,
  longLabel: false

};

  for (let r = startRow; r <= lastDataRow; r++) {

    const row = rawAoA[r];

    const total = row.length || 1;

    let nTextShort = 0, nTextLong = 0, nNumber = 0, nDate = 0, nEmpty = 0, nKeyWords = 0;

    if(!Array.isArray(row) || !row.some(c=>this.hasValue(c))){
      continue;
    }

    const cellDiagnosis: PreliminaryHeaderDetectDiagnosis[] = 
    row.map((c)=>this.diagnoseCell(c, cfg.textMaxLength));

    for(const d of cellDiagnosis){

      if(d.shortLabel) nTextShort++;
      if(d.longLabel) ++nTextLong;
      if(d.numberish) nNumber++;
      if(d.dateish) nDate++;
      if(d.empty) nEmpty++;
    }

    const ratioShortLabel = nTextShort / total;
    const ratioLongLabel = nTextLong / total;
    const ratioNumber = nNumber / total;
    const ratioDate = nDate / total;
    const ratioEmpty = nEmpty / total;

    const ratioText = Math.max(0, 1 - ratioNumber - ratioDate - ratioEmpty);

    const headerScore = this.clamp01(
        0.45 * ratioShortLabel +
        0.15 * ratioText +
        0.10 * (1 - ratioEmpty) -
        0.15 * ratioNumber -
        0.10 * ratioDate -
        0.10 * ratioLongLabel
    );

    const dataScore = this.clamp01(
        0.45 * ratioNumber +
        0.25 * ratioDate +
        0.20 * (1 - ratioEmpty) -
        0.20 * ratioShortLabel
    );

    const headerish = headerScore >= 0.6 && dataScore <= 0.4;
    const dataish = dataScore  >= 0.6;

  }


  // Return a neutral OK with headerDepth=1 as a placeholder so you can proceed to next steps.
  return {
    valid: true,
    reason: 'OK',
    headerDepth: 1,
    usedOptions: cfg,
    diagnostics: {
      warnings: [],
    },
  };

}


  //helpers

  private findLastNonEmptyRow(aoa: (unknown | null)[][]): number {
  for (let i = aoa.length - 1; i >= 0; i--) {
    const row = aoa[i];
    if (Array.isArray(row) && row.some((c) => this.hasValue(c))) return i;
  }
  return -1;
}

  private findFirstNonEmptyRow(aoa:unknown[][]):number{

    for (let i = 0; i < aoa.length; i++) {
      const row = aoa[i];

    if (Array.isArray(row) && row.some((c) => this.hasValue(c))) return i;
   
    }

    return -1

  }

  private hasValue(v:unknown):boolean{

      if(v === undefined || v === '' ) return false;

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

  private isStringLikeDate(str:string):boolean{

    const trimmed = str.trim();

    if(trimmed.length < 4 || trimmed.length > 20) return false;

    const iso = /^\d{4}-\d{1,2}(-\d{1,2})?$/;             // 2024-01-10
    const slashes = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/; // 10/01/2024 or 10-01-24
    const textual = /^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}$/; // 10 Jan 2024

    if (iso.test(str) || slashes.test(str) || textual.test(str)) return true;
    
    const parsed = Date.parse(trimmed);
    return Number.isFinite(parsed);

  }

  private containsKeyword(cell: string, keywords: Array[]):boolean{



    



  }

//prelimary cell helper

private diagnoseCell(cell:unknown, textMaxLength: number):PreliminaryHeaderDetectDiagnosis{

  let diagnosisConfig : PreliminaryHeaderDetectDiagnosis = {
    empty : false,
    numberish : false,
    dateish : false,
    shortLabel : false,
    longLabel : false,
  }

  if(cell === null || cell === undefined || (typeof cell === 'string' && (cell === '' || cell.trim() === ''))){

    diagnosisConfig.empty = true;

    return diagnosisConfig;

    
  }

   if(typeof cell === 'number' || typeof cell === 'string' && (this.isStringLikeNumber(cell))){

    diagnosisConfig.numberish = true;


  }

  if(cell instanceof Date || typeof cell === 'string' && (this.isStringLikeDate(cell))){

    diagnosisConfig.dateish = true;

  }

  if(typeof cell === 'string' && (cell.trim().length > textMaxLength)){

    diagnosisConfig.longLabel = true;

    return diagnosisConfig;


  }

  if(typeof cell === 'string' && (cell.trim().length < textMaxLength)){

    diagnosisConfig.shortLabel = true;

    return diagnosisConfig;

  }

  if(typeof cell === 'string' && (this.contains) )

  return(

    diagnosisConfig

  );



  }

 

 
  

}



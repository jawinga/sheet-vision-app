import { Component, EventEmitter, Output } from '@angular/core';
import { LucideAngularModule, CloudUpload, RotateCcw } from 'lucide-angular';
import { Cta } from '../cta/cta';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { FileService } from '../../services/file/file-service';
import { LoadingAnimation } from '../loading-animation/loading-animation';
import { FileValidationService } from '../../services/validation/file-validation-service';
import { Table } from '../table/table';
import { SheetButton } from '../sheet-button/sheet-button';
import {
  ExcelParserService,
  ParseOptions,
  ParseResult,
} from '../../services/excel-parser/excel-parser-service';
import { CellValue } from '../../shared/helpers/cell-types';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [
    LucideAngularModule,
    Cta,
    CommonModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    LoadingAnimation,
    Table,
    SheetButton,
  ],
  templateUrl: './upload-file.html',
  styleUrl: './upload-file.scss',
})
export class UploadFile {
  constructor(
    private fileService: FileService,
    private fileValidationService: FileValidationService,
    private excelParseService: ExcelParserService
  ) {}

  @Output() columnsChange = new EventEmitter<string[]>();
  @Output() rowsChange = new EventEmitter<Array<Record<string, unknown>>>();
  @Output() uploadStatusChange = new EventEmitter<UploadStatus>();
  @Output() parseResultChange = new EventEmitter<ParseResult>();
  @Output() fileName = new EventEmitter<string>();

  sheetName: string = '';
  sheetNames: string[] = [];
  selectedSheetName: string = '';
  lastFile: File | null = null;
  columns: string[] = [];
  rowCount: number = 0;
  rows: Array<Record<string, CellValue>> = [];
  sampleRows: Array<Record<string, CellValue>> = [];
  warnings: string[] = [];
  name?: string;
  type?: string;
  window = window;
  readonly CloudUpload = CloudUpload;
  readonly Retry = RotateCcw;
  uploadState: 'idle' | 'uploading' | 'success' | 'error' = 'idle';
  parseState: 'idle' | 'parseLoading' | 'parsed' | 'parseError' = 'idle';
  selectedFile?: File | null = null;
  lastParseResult?: ParseResult;
  showTable: boolean = false;

  onSelectSheet(name: string) {
    if (!this.lastFile) return;
    this.parseState = 'parseLoading';
    this.selectedSheetName = name;
    this.startParse(this.lastFile, { sheetName: name });
  }

  onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    const resultValid = this.fileValidationService.validate(file);

    if (!file) {
      this.uploadState = 'error';
      this.uploadStatusChange.emit(this.uploadState);

      return;
    }

    if (!resultValid) {
      this.uploadState = 'error';
      this.uploadStatusChange.emit(this.uploadState);

      return;
    }

    this.selectedFile = file;
    this.lastFile = file;

    this.startParse(file);
  }

  startUpload(file: File) {
    this.uploadState = 'uploading';
    this.uploadStatusChange.emit(this.uploadState);

    this.fileService.upload(file).subscribe({
      next: () => {
        this.uploadState = 'success';
        this.uploadStatusChange.emit(this.uploadState);
      },
      error: () => {
        this.uploadState = 'error';
        this.uploadStatusChange.emit(this.uploadState);
      },
    });
  }

  isDragOver = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const file = event.dataTransfer?.files[0] || null;
    if (!file) return;
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (file.type && !allowed.includes(file.type)) {
      this.uploadState = 'error';
      this.uploadStatusChange.emit(this.uploadState);

      return;
    }

    this.selectedFile = file;
    this.lastFile = file;
    this.startParse(file);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
  }

  getFileNameWithoutExtension(file: File): string {
    const name = file.name;
    const lastDotIndex = name.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return name;
    }

    const finalName = name.substring(0, lastDotIndex);
    this.fileName.emit(finalName);

    return finalName;
  }

  getFileTypeWithoutName(file: File): string {
    const name = file.name;
    const lastDotIndex = name.lastIndexOf('.');

    if (lastDotIndex === -1) {
      return '';
    }

    return name.substring(lastDotIndex + 1);
  }

  startParse(file: File, opts?: ParseOptions) {
    this.parseState = 'parseLoading';
    this.excelParseService
      .parseExcel(file, opts)
      .then((result) => {
        this.lastParseResult = result;
        this.parseState = 'parsed';
        console.log('File parsed successfully');
        console.log('Sheet name ' + result.sheetName);
        this.sheetName = result.sheetName;
        console.log('Sheet name ' + result.sheetNames);
        this.sheetNames = result.sheetNames;
        this.selectedSheetName = result.sheetName;
        console.log('Detected headers: ' + result.columns);
        this.columns = result.columns;
        console.log('Row count: ' + result.rowCount);
        this.rowCount = result.rowCount;
        console.table(result.sampleRows);
        this.sampleRows = result.sampleRows;
        console.table(result.rows);
        this.rows = result.rows;
        console.log('Warnings: ' + result.warnings);
        this.warnings = result.warnings;
        this.startUpload(file);
        this.columnsChange.emit(this.columns);
        this.rowsChange.emit(this.rows);
        this.parseResultChange.emit(result);
      })
      .catch((err) => {
        this.parseState = 'parseError';
        this.uploadState = 'idle';
        console.log('Error: ', err);
      });
  }

  sendUploadStatustoDash(): void {
    this.uploadStatusChange.emit(this.uploadState);
  }
}

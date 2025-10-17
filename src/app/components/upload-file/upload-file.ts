import { Component, Input } from '@angular/core';
import { LucideAngularModule, CloudUpload, RotateCcw } from 'lucide-angular';
import { Cta } from '../cta/cta';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { FileService } from '../../services/file/file-service';
import { LoadingAnimation } from '../loading-animation/loading-animation';
import { FileValidationService } from '../../services/validation/file-validation-service';
import { Table } from '../table/table';
import {
  ExcelParserService,
  ParseResult,
} from '../../services/excel-parser/excel-parser-service';
import { CellValue } from '../../shared/helpers/cell-types';

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

  sheetName: string = '';
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

  onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    const resultValid = this.fileValidationService.validate(file);

    if (!file) {
      this.uploadState = 'error';
      return;
    }

    if (!resultValid) {
      this.uploadState = 'error';
      return;
    }

    this.selectedFile = file;

    this.startParse(file);
  }

  startUpload(file: File) {
    this.uploadState = 'uploading';

    this.fileService.upload(file).subscribe({
      next: () => {
        this.uploadState = 'success';
      },
      error: () => {
        this.uploadState = 'error';
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
      return;
    }

    this.selectedFile = file;
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

    return name.substring(0, lastDotIndex);
  }

  getFileTypeWithoutName(file: File): string {
    const name = file.name;
    const lastDotIndex = name.lastIndexOf('.');

    if (lastDotIndex === -1) {
      return '';
    }

    return name.substring(lastDotIndex + 1);
  }

  startParse(file: File) {
    this.parseState = 'parseLoading';
    this.excelParseService
      .parseExcel(file, {})
      .then((result) => {
        this.lastParseResult = result;
        this.parseState = 'parsed';
        console.log('File parsed successfully');
        console.log('Sheet name ' + result.sheetName);
        this.sheetName = result.sheetName;
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
      })
      .catch((err) => {
        this.parseState = 'parseError';
        this.uploadState = 'idle';
        console.log('Error: ', err);
      });
  }
}

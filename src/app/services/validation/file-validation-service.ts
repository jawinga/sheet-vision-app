import { Injectable } from '@angular/core';
import { CellValue } from '../../shared/helpers/cell-types';

interface FileValidationResult {
  valid: boolean;
  reason?: 'type' | 'size' | 'empty';
}

interface FileValidationOptions {
  maxBytes?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class FileValidationService {
  private readonly defaults: Required<FileValidationOptions> = {
    maxBytes: 5 * 1024 * 1024, // 5 MB
    allowedTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ],
    allowedExtensions: ['.xlsx', '.xls', '.csv'],
  };

  validate(
    file: File | null,
    opts?: FileValidationOptions
  ): FileValidationResult {
    const config: Required<FileValidationOptions> = {
      ...this.defaults,
      ...(opts ?? {}),
    };

    if (!file) return { valid: false, reason: 'empty' };

    if (file.size <= 0) return { valid: false, reason: 'size' };

    if (file.size > config.maxBytes) return { valid: false, reason: 'size' };

    if (
      file.type &&
      !config.allowedTypes.includes(file.type.trim().toLowerCase())
    ) {
      return { valid: false, reason: 'type' };
    }

    const ext = this.getFileExtension(file.name).toLowerCase();

    if (!config.allowedExtensions.includes(ext)) {
      return { valid: false, reason: 'type' };
    }

    return { valid: true };
  }

  private getFileExtension(name: string): string {
    const dot = name.lastIndexOf('.');
    if (dot < 0) return '';
    return name.slice(dot).toLowerCase();
  }
}

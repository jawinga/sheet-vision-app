import { Component, Input } from '@angular/core';
import { LucideAngularModule, CloudUpload } from 'lucide-angular';
import { Cta } from '../cta/cta';
import { CommonModule } from '@angular/common';
import {ProgressSpinnerMode, MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSliderModule} from '@angular/material/slider';
import { FileService } from '../../services/file-service';
@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [LucideAngularModule, Cta, CommonModule, MatProgressSpinnerModule, MatSliderModule],
  templateUrl: './upload-file.html',
  styleUrl: './upload-file.scss',
})
export class UploadFile {

  uploadState: 'idle' | 'uploading' | 'success' | 'error' = 'idle';

  selectedFile?: File | null = null;

  spinnerMode: ProgressSpinnerMode = 'determinate';


  constructor(private fileService: FileService) {}

  readonly CloudUpload = CloudUpload;

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

  onFileSelect(e:Event){

    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if(!file) return;
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (file.type && !allowed.includes(file.type)) {
        this.uploadState = 'error';
          return;
    }

    this.selectedFile = file;
    this.startUpload(file);


  }

  startUpload(file:File) {
  this.uploadState = 'uploading'; 

  this.fileService.upload(file).subscribe({ 
    next: () => {
      this.uploadState = 'success';  
    },
    error: () => {
      this.uploadState = 'error';    
    },
    complete: () => {
      this.uploadState = 'idle';     
    }
  });
}

  @Input() name?: string;
  @Input() type?: string;
  @Input() size: number = 0;
}

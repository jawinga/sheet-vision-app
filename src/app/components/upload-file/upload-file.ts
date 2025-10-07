import { Component, Input } from '@angular/core';
import { LucideAngularModule, CloudUpload, RotateCcw } from 'lucide-angular';
import { Cta } from '../cta/cta';
import { CommonModule } from '@angular/common';
import {ProgressSpinnerMode, MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSliderModule} from '@angular/material/slider';
import { FileService } from '../../services/file-service';
import { LoadingAnimation } from "../loading-animation/loading-animation";
@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [LucideAngularModule, Cta, CommonModule, MatProgressSpinnerModule, MatSliderModule, LoadingAnimation],
  templateUrl: './upload-file.html',
  styleUrl: './upload-file.scss',
})
export class UploadFile {

  constructor(private fileService: FileService) {}

  name?: string;
  type?: string;
  window = window;
  readonly CloudUpload = CloudUpload;
  readonly Retry = RotateCcw; 
  uploadState: 'idle' | 'uploading' | 'success' | 'error' = 'idle';
  selectedFile?: File | null = null;


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

    this.name = this.getFileNameWithoutExtension(file) || 'No title file found';
    this.type = file.type || 'Unknown';

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
    }
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

getFileTypeWithoutName(file:File):string{

  const name = file.name;
  const lastDotIndex = name.lastIndexOf('.');

   if (lastDotIndex === -1) {
    return ''; 
  }

  return name.substring(lastDotIndex + 1);

}

}


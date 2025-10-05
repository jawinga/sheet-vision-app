import { Component } from '@angular/core';
import { LucideAngularModule, CloudUpload } from 'lucide-angular';
import { Cta } from '../cta/cta';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [LucideAngularModule, Cta, CommonModule],
  templateUrl: './upload-file.html',
  styleUrl: './upload-file.scss',
})
export class UploadFile {
  readonly CloudUpload = CloudUpload;
}

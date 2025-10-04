import { Component } from '@angular/core';
import { LucideAngularModule, CloudUpload } from 'lucide-angular';

@Component({
  selector: 'app-upload-file',
  imports: [LucideAngularModule],
  templateUrl: './upload-file.html',
  styleUrl: './upload-file.scss',
})
export class UploadFile {
  readonly CloudUpload = CloudUpload;
}

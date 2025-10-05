import { Component } from '@angular/core';
import { UploadFile } from '../../components/upload-file/upload-file';

@Component({
  selector: 'app-dashboard',
  imports: [UploadFile],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}

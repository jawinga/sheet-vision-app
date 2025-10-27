import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  CloudUpload,
  Download,
} from 'lucide-angular';

type IconVariant = 'plus' | 'trash' | 'upload' | 'download';
type ColorVariant = 'accent' | 'accent-hover';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [MatButtonModule, LucideAngularModule, CommonModule],
  templateUrl: './cta.html',
  styleUrl: './cta.scss',
})
export class Cta {
  @Input() label = '';
  @Input() icon?: IconVariant;
  @Input() color: ColorVariant = 'accent';

  private readonly IconMap = {
    plus: Plus,
    trash: Trash2,
    upload: CloudUpload,
    download: Download,
  };
  get iconImg() {
    return this.icon ? this.IconMap[this.icon] : undefined;
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { LucideAngularModule, Plus, Trash2 } from 'lucide-angular';

type IconVariant = 'plus' | 'trash';
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
  @Input() icon: IconVariant = 'plus';
  @Input() color: ColorVariant = 'accent';

  private readonly IconMap = { plus: Plus, trash: Trash2 };
  get iconImg() {
    return this.IconMap[this.icon];
  }
}

import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { LucideAngularModule, Plus, Trash2 } from 'lucide-angular';

type IconVariant = 'plus' | 'trash';

@Component({
  selector: 'app-cta',
  imports: [MatButtonModule, LucideAngularModule],
  standalone: true,
  templateUrl: './cta.html',
  styleUrl: './cta.scss',
})
export class Cta {
  @Input() label = '';
  @Input() icon: IconVariant = 'plus';
  readonly Plus = Plus;
  readonly Trash = Trash2;

  readonly IconMap = {
    plus: Plus,
    trash: Trash2,
  };

  get iconImg() {
    return this.IconMap[this.icon];
  }
}

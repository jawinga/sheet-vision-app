import { Component, HostListener, Input } from '@angular/core';
import { LucideAngularModule, Info } from 'lucide-angular';

@Component({
  selector: 'app-tool-tip',
  imports: [LucideAngularModule],
  templateUrl: './tool-tip.html',
  styleUrl: './tool-tip.scss',
})
export class ToolTip {
  readonly Info = Info;
  @Input() text: string = '';
  @Input() trigger: any = Info;

  isVisible = false;

  @HostListener('mouseenter') onMouseEnter() {
    this.isVisible = true;
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.isVisible = false;
  }
}

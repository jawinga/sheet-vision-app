import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button'; // For icon button, but since it's module, already in MatButtonModule
import { RouterModule } from '@angular/router';
import { Cta } from '../cta/cta';
import { LucideAngularModule, User } from 'lucide-angular';
import { IconEyeComponent } from '../../icon/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    LucideAngularModule,
    MatButtonModule,
    MatToolbarModule,
    RouterModule,
    IconEyeComponent,
    Cta,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  readonly User = User;

  appIcon: string = 'eye'; // Placeholder for app icon (e.g., 'eye' for vision theme; replace with actual Lucide icon name or path)
  ctaIcon: string = 'plus'; // Placeholder for CTA icon (e.g., 'plus' for create new; replace as needed)
  ctaLabel: string = 'Create Insight'; // Placeholder for CTA label (replace with actual label)
  profileIcon: string = 'user'; // Placeholder for profile icon
}

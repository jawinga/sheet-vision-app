import { Component } from '@angular/core';
import { LoadingAnimation } from '../loading-animation/loading-animation';

@Component({
  selector: 'app-aigeneration',
  imports: [LoadingAnimation],
  templateUrl: './aigeneration.html',
  styleUrl: './aigeneration.scss',
})
export class AIGeneration {
  generated: boolean = false;
  generating: boolean = true;
}

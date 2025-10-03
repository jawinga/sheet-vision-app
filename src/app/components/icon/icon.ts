import { Component } from '@angular/core';

@Component({
  selector: 'app-icon',
  imports: [],
  template: `
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  `,
  styles: [
    ':host { display: inline-flex; } svg { width: 20px; height: 20px; }',
  ],
})
export class Icon {}

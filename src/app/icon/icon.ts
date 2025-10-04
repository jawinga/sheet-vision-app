import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

type EyeVariant = 'plain' | 'insight';

@Component({
  selector: 'app-icon-eye',
  standalone: true,
  imports: [NgIf],
  template: `
    <svg
      class="eye-svg"
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      [attr.stroke]="color"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      role="img"
      [attr.aria-label]="variant === 'insight' ? 'Insight eye' : 'Eye'"
      focusable="false"
    >
      <defs>
        <!-- Soft duotone gradient for the eye contour -->
        <linearGradient
          id="eyeContour"
          x1="0"
          y1="12"
          x2="24"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop [attr.stop-color]="mix(color, '#000', 0.25)"></stop>
          <stop offset="1" [attr.stop-color]="mix(color, '#fff', 0.1)"></stop>
        </linearGradient>

        <!-- Radial gradient for iris fill (subtle) -->
        <radialGradient id="irisFill" cx="50%" cy="45%" r="60%">
          <stop
            [attr.stop-color]="mix(color, '#ffffff', 0.55)"
            offset="0"
          ></stop>
          <stop
            [attr.stop-color]="mix(color, '#000000', 0.35)"
            offset="1"
          ></stop>
        </radialGradient>

        <!-- Mask to keep bars inside iris -->
        <mask id="irisMask">
          <rect x="0" y="0" width="24" height="24" fill="black"></rect>
          <circle cx="12" cy="12" r="3" fill="white"></circle>
        </mask>

        <!-- Optional glow for accent bars -->
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur"></feGaussianBlur>
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Outer eye (duotone stroke) -->
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
        [attr.stroke]="'url(#eyeContour)'"
      />

      <!-- Iris (filled softly) -->
      <circle
        cx="12"
        cy="12"
        r="3"
        [attr.fill]="duotone ? 'url(#irisFill)' : 'none'"
      ></circle>

      <!-- Insight bars (masked inside iris) -->
      <g *ngIf="variant === 'insight'" mask="url(#irisMask)">
        <g
          [attr.filter]="animated ? 'url(#softGlow)' : null"
          [attr.transform]="
            animated ? 'translate(9.6, 9.2)' : 'translate(9.6, 9.2)'
          "
          [attr.fill]="accentColor"
          [attr.stroke]="accentColor"
        >
          <rect
            x="0"
            y="2.8"
            width="1.2"
            height="2.0"
            rx="0.6"
            [attr.opacity]="0.9"
          >
            <animate
              *ngIf="animated"
              attributeName="height"
              values="2;2.6;2"
              dur="1.6s"
              repeatCount="indefinite"
            />
          </rect>

          <rect
            x="2.0"
            y="1.4"
            width="1.2"
            height="3.4"
            rx="0.6"
            [attr.opacity]="0.9"
          >
            <animate
              *ngIf="animated"
              attributeName="height"
              values="3.4;4.0;3.4"
              dur="1.6s"
              begin="0.15s"
              repeatCount="indefinite"
            />
          </rect>

          <rect
            x="4.0"
            y="0.2"
            width="1.2"
            height="4.6"
            rx="0.6"
            [attr.opacity]="0.9"
          >
            <animate
              *ngIf="animated"
              attributeName="height"
              values="4.6;5.4;4.6"
              dur="1.6s"
              begin="0.3s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        <!-- Subtle highlight -->
        <path
          d="M10.7 10.2c.55-.45 1.35-.65 1.95-.35"
          [attr.stroke]="mix(color, '#ffffff', 0.6)"
          opacity=".35"
        />
      </g>
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
      }
      .eye-svg {
        display: block;
      }
    `,
  ],
})
export class IconEyeComponent {
  /** Size in px */
  @Input() size = 24;
  /** 'plain' or 'insight' */
  @Input() variant: EyeVariant = 'insight';
  /** Stroke (and base) color, uses currentColor by default */
  @Input() color: string = 'currentColor';
  /** Accent color for bars */
  @Input() accentColor: string = '#ef233c'; // your palette accent
  /** Stroke width */
  @Input() strokeWidth: number = 2;
  /** Duotone iris fill */
  @Input() duotone = true;
  /** Animate the bars slightly */
  @Input() animated = false;

  /**
   * Simple color mixer (approx): returns a hex that is a mix between c1 and c2.
   * ratio = 0..1 (0 = c1, 1 = c2)
   */
  mix(c1: string, c2: string, ratio: number): string {
    const p = (h: string) => parseInt(h, 16);
    const h = (n: number) => n.toString(16).padStart(2, '0');

    const n1 = this.norm(c1),
      n2 = this.norm(c2);
    const r = Math.round(
      p(n1.slice(1, 3)) * (1 - ratio) + p(n2.slice(1, 3)) * ratio
    );
    const g = Math.round(
      p(n1.slice(3, 5)) * (1 - ratio) + p(n2.slice(3, 5)) * ratio
    );
    const b = Math.round(
      p(n1.slice(5, 7)) * (1 - ratio) + p(n2.slice(5, 7)) * ratio
    );
    return `#${h(r)}${h(g)}${h(b)}`;
  }
  private norm(hex: string): string {
    // handle shorthand like #abc
    if (hex.length === 4) {
      const r = hex[1],
        g = hex[2],
        b = hex[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return hex;
  }
}

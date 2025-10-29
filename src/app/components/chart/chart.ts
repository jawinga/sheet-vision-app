import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import type { Chart as ChartJS, ChartConfiguration } from 'chart.js';
import { Target } from '../../shared/adapters/chart/adapter';
import { Adapter } from '../../shared/adapters/chart/adapter';
import { Cta } from '../cta/cta';

@Component({
  selector: 'app-chart',
  imports: [Cta],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class Chart implements AfterViewInit, OnChanges, OnDestroy {
  constructor(private adapter: Adapter) {}

  private chartInstance?: ChartJS;
  private ChartCtor?: typeof import('chart.js').Chart;
  private chartReady = false;

  @ViewChild('chart') chartElement!: ElementRef<HTMLCanvasElement>;
  @Input() target!: Target;

  async ngAfterViewInit(): Promise<void> {
    // Lazy import Chart.js only when the view exists
    const chart = await import('chart.js');

    const {
      Chart,
      // scales
      CategoryScale,
      LinearScale,
      // elements
      BarElement,
      LineElement,
      PointElement,
      ArcElement,
      // controllers
      BarController,
      LineController,
      DoughnutController,
      // plugins
      Filler,
      Tooltip,
      Legend,
      Colors,
    } = chart;

    // Register ONLY what you actually use
    Chart.register(
      CategoryScale,
      LinearScale,
      BarElement,
      LineElement,
      PointElement,
      ArcElement,
      BarController,
      LineController,
      DoughnutController,
      Filler,
      Tooltip,
      Legend,
      Colors
    );

    this.ChartCtor = Chart;
    this.chartReady = true;

    if (this.target) this.renderChart();
  }

  ngOnChanges(_: SimpleChanges): void {
    if (this.chartReady) this.renderChart();
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private renderChart() {
    if (!this.target || !this.ChartCtor) return;

    const adapterResult = this.adapter.adapt(this.target);
    if (!adapterResult.ok) {
      console.warn('Failed to adapt:', adapterResult.error);
      return;
    }

    this.destroyChart();
    this.chartInstance = new this.ChartCtor(
      this.chartElement.nativeElement,
      adapterResult.value as ChartConfiguration
    );
  }

  private destroyChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = undefined;
    }
  }

  exportAsPNG() {
    if (!this.chartInstance) return;
    const canvas = this.chartInstance.canvas;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = url;
    link.click();
  }
}

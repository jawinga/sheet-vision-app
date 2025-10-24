import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart as ChartJS, ChartConfiguration } from 'chart.js/auto';
import { Target } from '../../shared/adapters/chart/adapter';
import { Adapter } from '../../shared/adapters/chart/adapter';

@Component({
  selector: 'app-chart',
  imports: [],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class Chart implements AfterViewInit, OnChanges {
  constructor(private adapter: Adapter) {}
  private chartInstance?: ChartJS;
  // myChart = new Chart(canvasElement, chartConfig);

  @ViewChild('chart') chartElement!: ElementRef;
  @Input() target!: Target;
  viewReady!: boolean;

  ngAfterViewInit(): void {
    this.viewReady = true;
    console.log('View ready, target is:', this.target);

    if (this.target) {
      console.log('Target exists, rendering immediately');
      this.renderChart();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('Chart ngOnChanges fired!', changes);
    console.log('viewReady:', this.viewReady, 'target:', this.target);
    if (this.viewReady) {
      this.renderChart();
    }
  }

  private renderChart() {
    if (!this.target) {
      return;
    }

    const adapterResult = this.adapter.adapt(this.target);

    if (!adapterResult.ok) {
      console.log('Failed to adapt: ', adapterResult.error);
      return;
    }

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new ChartJS(
      this.chartElement.nativeElement as HTMLCanvasElement,
      adapterResult.value
    );
  }
}

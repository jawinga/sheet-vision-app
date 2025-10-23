import { Component, Input, EventEmitter, Output } from '@angular/core';
import {
  LucideAngularModule,
  ChartColumnDecreasing,
  ChartScatter,
  ChartPie,
  ChartArea,
  ChartCandlestick,
  CheckCheck,
} from 'lucide-angular';
import { ChartKind } from '../../shared/adapters/chart/adapter';
import { NgClass } from '@angular/common';

type IconVariant = 'chart1' | 'chart2' | 'chart3' | 'chart4' | 'chart5';

@Component({
  selector: 'app-chart-type',
  imports: [LucideAngularModule, NgClass],
  templateUrl: './chart-type.html',
  standalone: true,
  styleUrl: './chart-type.scss',
})
export class ChartType {
  private readonly IconMap = {
    chart1: ChartColumnDecreasing,
    chart2: ChartScatter,
    chart3: ChartPie,
    chart4: ChartArea,
    chart5: ChartCandlestick,
  };

  private readonly Charts = {
    bar: 'bar',
    area: 'area',
    line: 'line',
    doughnut: 'doughnut',
  };

  @Input() icon: IconVariant = 'chart1';
  @Input() chartName: string = 'chart';
  @Input() chartType!: ChartKind;
  @Input() isSelected: boolean = false;
  @Output() targetChange = new EventEmitter<ChartKind>();
  readonly check = CheckCheck;

  emitSelectedChart() {
    const chartType = this.chartType;
    this.targetChange.emit(chartType);
  }

  get iconImg() {
    return this.icon ? this.IconMap[this.icon] : undefined;
  }

  get chartKind() {
    return this.chartType;
  }
}

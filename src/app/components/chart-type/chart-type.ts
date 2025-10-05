import { Component, Input } from '@angular/core';
import {
  LucideAngularModule,
  ChartColumnDecreasing,
  ChartScatter,
  ChartPie,
  ChartArea,
  ChartCandlestick,
} from 'lucide-angular';

type IconVariant = 'chart1' | 'chart2' | 'chart3' | 'chart4' | 'chart5';

@Component({
  selector: 'app-chart-type',
  imports: [LucideAngularModule],
  templateUrl: './chart-type.html',
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

  @Input() icon: IconVariant = 'chart1';
  @Input() chartName: string = 'chart';
  get iconImg() {
    return this.icon ? this.IconMap[this.icon] : undefined;
  }
}

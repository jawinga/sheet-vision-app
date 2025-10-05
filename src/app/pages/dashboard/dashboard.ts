import { Component } from '@angular/core';
import { UploadFile } from '../../components/upload-file/upload-file';
import { ChartType } from '../../components/chart-type/chart-type';
import { LucideAngularModule, Sparkles } from 'lucide-angular';
import { AIGeneration } from '../../components/aigeneration/aigeneration';

@Component({
  selector: 'app-dashboard',
  imports: [UploadFile, ChartType, LucideAngularModule, AIGeneration],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  readonly Sparkles = Sparkles;

  chartVariants = [
    { icon: 'chart1', name: 'Bar Chart' },
    { icon: 'chart2', name: 'Scatter Plot' },
    { icon: 'chart3', name: 'Pie Chart' },
    { icon: 'chart4', name: 'Area Chart' },
    { icon: 'chart5', name: 'Candlestick' },
  ] as const;
}

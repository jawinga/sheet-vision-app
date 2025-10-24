import { Component, Input } from '@angular/core';
import { UploadFile } from '../../components/upload-file/upload-file';
import { ChartType } from '../../components/chart-type/chart-type';
import { LucideAngularModule, Sparkles } from 'lucide-angular';
import { AIGeneration } from '../../components/aigeneration/aigeneration';
import { ChartKind, Target } from '../../shared/adapters/chart/adapter';
import { ChartBuilder } from '../../components/chart-builder/chart-builder';
import { Chart } from '../../components/chart/chart';

@Component({
  selector: 'app-dashboard',
  imports: [
    UploadFile,
    ChartType,
    LucideAngularModule,
    AIGeneration,
    ChartBuilder,
    Chart,
  ],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  chartVariants = [
    { icon: 'chart1', name: 'Bar', type: 'bar' },
    { icon: 'chart2', name: 'Area', type: 'area' },
    { icon: 'chart3', name: 'Line', type: 'line' },
    { icon: 'chart4', name: 'Doughnut', type: 'doughnut' },
  ] as const;
  readonly Sparkles = Sparkles;
  selectedChart!: ChartKind;
  columns!: string[];
  rows!: Array<Record<string, unknown>>;
  target!: Target;

  handleUploadData(columns: string[], rows: Array<Record<string, unknown>>) {
    this.columns = columns;
  }

  handleColumnsChange(columns: string[]) {
    this.columns = columns;
  }

  handleRowsChange(rows: Array<Record<string, unknown>>) {
    this.rows = rows;
  }

  handleTargetChange(target: Target) {
    console.log('Dashboard received target:', target);
    this.target = target;
    console.log('Dashboard.target is now:', this.target);
  }

  onChartTypeClicked(kind: ChartKind) {
    this.selectedChart = kind;
  }

  get hasData(): boolean {
    return this.columns?.length > 0 && this.rows?.length > 0;
  }

  get hasTarget(): boolean {
    const result = !!this.target;
    console.log(
      'hasTarget getter called, result:',
      result,
      'target:',
      this.target
    );
    return result;
  }

  get hasSelectedChart(): boolean {
    return !!this.selectedChart;
  }
}

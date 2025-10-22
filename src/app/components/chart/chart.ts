import { Component, Input } from '@angular/core';
import { Chart as ChartJS } from 'chart.js/auto';
import { Adapter, Target } from '../../shared/adapters/chart/adapter';

@Component({
  selector: 'app-chart',
  imports: [],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class Chart {
  @Input() target!: Target;
}

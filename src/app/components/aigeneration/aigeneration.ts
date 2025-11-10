import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { ParseResult } from '../../services/excel-parser/excel-parser-service';
import { LoadingAnimation } from '../loading-animation/loading-animation';
import { InsightsService } from '../../services/insights/insights-service';
import {
  InsightsRequestDTO,
  InsightsResponseDTO,
} from '../../models/insights.mode';
import { Cta } from '../cta/cta';

@Component({
  selector: 'app-aigeneration',
  imports: [LoadingAnimation, Cta],
  templateUrl: './aigeneration.html',
  styleUrl: './aigeneration.scss',
})
export class AIGeneration implements OnInit, OnChanges {
  constructor(
    private insightsService: InsightsService,
    private cdr: ChangeDetectorRef
  ) {}

  request: InsightsRequestDTO | null = null;
  generated: boolean = false;
  generating: boolean = false;
  trends: string | null = null;
  anomalies: string[] | null = null;
  recommendations: string | null = null;
  error: string | null = null;

  @Input() parseResult: ParseResult | null = null;
  @Input() fileName: string = '';

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges fired!', {
      parseResult: this.parseResult,
      fileName: this.fileName,
    });

    if (this.parseResult && this.fileName) {
      console.log('Building request...');
      this.request = {
        fileName: this.fileName,
        sheetName: this.parseResult.sheetName,
        rowCount: this.parseResult.rowCount,
        columns: this.parseResult.columns,
        rows: this.parseResult.rows,
        sampleRows: this.parseResult.sampleRows,
      };
      this.generated = true;
      console.log('Request built:', this.request);
    } else {
      console.log('Missing:', {
        parseResult: !!this.parseResult,
        fileName: this.fileName,
      });
      this.generated = false;
    }
  }

  onGetInsights() {
    console.log('onGetInsights called');
    console.log('generated:', this.generated);
    console.log('request:', this.request);
    if (!this.generated || !this.request) return;

    this.generating = true;
    this.error = null;

    this.insightsService.getInsights(this.request).subscribe({
      next: (response: InsightsResponseDTO) => {
        if (response.success) {
          this.trends = response.trends;
          this.anomalies = response.anomalies;
          this.recommendations = response.recommendations;
          this.cdr.detectChanges();
        } else {
          this.error = response.error;
        }
        this.generating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to generate AI insights: ' + err.message;
        this.generating = false;
        this.cdr.detectChanges();
      },
    });
  }
}

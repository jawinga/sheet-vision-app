import {
  Component,
  HostListener,
  Output,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { UploadFile } from '../../components/upload-file/upload-file';
import { ChartType } from '../../components/chart-type/chart-type';
import { LucideAngularModule, Sparkles, Info } from 'lucide-angular';
import { AIGeneration } from '../../components/aigeneration/aigeneration';
import { ChartKind, Target } from '../../shared/adapters/chart/adapter';
import { ChartBuilder } from '../../components/chart-builder/chart-builder';
import { Chart } from '../../components/chart/chart';
import { ChooseColumn } from '../../components/choose-column/choose-column';
import { isColumnNumericish } from '../../shared/helpers/row-helpers';
import { FormsModule } from '@angular/forms';
import { ToolTip } from '../../components/tool-tip/tool-tip';
import _ from 'lodash';
import { ParseResult } from '../../services/excel-parser/excel-parser-service';
import { SheetButton } from '../../components/sheet-button/sheet-button';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

@Component({
  selector: 'app-dashboard',
  imports: [
    UploadFile,
    ChartType,
    LucideAngularModule,
    AIGeneration,
    ChartBuilder,
    Chart,
    ChooseColumn,
    FormsModule,
    ToolTip,
    SheetButton,
  ],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  chartVariants = [
    { icon: 'chart1', name: 'Bar', type: 'bar' },
    { icon: 'chart2', name: 'Area', type: 'area' },
    { icon: 'chart3', name: 'Line', type: 'line' },
    { icon: 'chart4', name: 'Doughnut', type: 'doughnut' },
  ] as const;

  aggregationType: 'sum' | 'avg' | 'count' = 'avg';

  constructor(private cdr: ChangeDetectorRef) {}

  readonly Sparkles = Sparkles;
  readonly Info = Info;
  selectedChart!: ChartKind;
  columns!: string[];
  rows!: Array<Record<string, unknown>>;
  target!: Target;
  selectedXColumn!: string;
  selectedYColumn!: string;
  groupDuplicates: boolean = false;
  processedColumns: string[] = [];
  processedRows: Array<Record<string, unknown>> = [];
  uploadState!: UploadState;
  isHorizontal = false;
  parseResult: ParseResult | null = null;
  fileName: string = '';
  sheetNames: string[] = [];
  selectedSheetName: string = '';
  chartResetTrigger: number = 0;

  @ViewChild('uploadFileComponent') uploadFileComponent!: UploadFile;

  @Output() horizontal = new EventEmitter<boolean>();

  @HostListener('mouseover') onMouseEnter() {}

  aggregateValues(
    rows: Array<Record<string, unknown>>,
    column: string,
    type: 'sum' | 'avg' | 'count'
  ) {
    switch (type) {
      case 'sum':
        return _.sumBy(rows, column);
      case 'count':
        return rows.length;

      case 'avg':
        return _.meanBy(rows, column);
    }
  }

  aggregateData(): Array<Record<string, unknown>> {
    console.log('aggregateData called', {
      xColumn: this.selectedXColumn,
      yColumn: this.selectedYColumn,
      aggregationType: this.aggregationType,
    });

    const grouped = _.groupBy(this.rows, this.selectedXColumn);
    console.log('Grouped:', grouped);

    const aggregated = _.map(grouped, (groupRows, xValue) => {
      return {
        [this.selectedXColumn]: xValue,
        [this.selectedYColumn]: this.aggregateValues(
          groupRows,
          this.selectedYColumn,
          this.aggregationType
        ),
      };
    });

    console.log('Aggregated:', aggregated);
    return aggregated;
  }

  handleXColumnSelected(columnName: string) {
    this.selectedXColumn = columnName;
    this.updateChartData();
  }

  private updateChartData() {
    console.log('updateChartData called', {
      groupDuplicates: this.groupDuplicates,
      columnsLength: this.columns?.length,
      rowsLength: this.rows?.length,
    });

    if (!this.columns?.length || !this.rows?.length) {
      this.processedColumns = [];
      this.processedRows = [];
      return;
    }

    if (!this.groupDuplicates) {
      console.log('NOT grouping - using raw data');
      this.processedColumns = this.columns;
      this.processedRows = this.rows;
      return;
    }

    console.log('GROUPING - aggregating data');
    this.processedColumns = [this.selectedXColumn, this.selectedYColumn];
    this.processedRows = this.aggregateData();

    console.log('Aggregated result:', {
      columns: this.processedColumns,
      rows: this.processedRows,
    });
  }
  handleYColumnSelected(columnName: string) {
    this.selectedYColumn = columnName;
    this.updateChartData();
  }

  handleUploadData(columns: string[], rows: Array<Record<string, unknown>>) {
    this.columns = columns;
  }

  handleColumnsChange(columns: string[]) {
    this.columns = columns;
    this.updateChartData();
  }

  handleRowsChange(rows: Array<Record<string, unknown>>) {
    this.rows = rows;
    this.updateChartData();
    this.cdr.markForCheck();
  }

  handleTargetChange(target: Target) {
    console.log('Dashboard received target:', target);
    this.target = target;
    console.log('Dashboard.target is now:', this.target);
  }

  handleUploadStatus(uploadState: UploadState): void {
    this.uploadState = uploadState;
  }

  handleParseResult(parseResult: ParseResult) {
    console.log('handleParseResult called:', parseResult);
    this.parseResult = parseResult;
    this.columns = parseResult.columns;
    this.rows = parseResult.rows;
    this.cdr.markForCheck();

    console.log(
      'hasData should be:',
      this.columns?.length > 0 && this.rows?.length > 0
    );
    console.log('columns:', this.columns);
    console.log('rows:', this.rows?.length);
  }

  handleFileName(fileName: string) {
    this.fileName = fileName;
    this.cdr.markForCheck();
  }

  handleSheetNamesChange(sheetNames: string[]) {
    this.sheetNames = sheetNames;
    this.cdr.markForCheck();
  }

  onSelectedSheet(sheetName: string) {
    this.selectedSheetName = sheetName;
    this.chartResetTrigger++;

    this.selectedXColumn = '';
    this.selectedYColumn = '';

    this.uploadFileComponent?.onSelectSheet(sheetName);

    setTimeout(() => {
      if (this.columns?.length > 0) {
        this.selectedXColumn = this.columns[0];
        if (this.numericColumns?.length > 0) {
          this.selectedYColumn = this.numericColumns[0];
        }
      }
    }, 100);

    this.cdr.markForCheck();
  }

  toggleOrientation() {
    this.horizontal.emit(this.isHorizontal);
  }

  onChartTypeClicked(kind: ChartKind) {
    this.selectedChart = kind;
  }

  onGroupDuplicatesChange() {
    if (!this.selectedXColumn && this.columns?.length > 0) {
      this.selectedXColumn = this.columns[0];
    }

    if (!this.selectedYColumn && this.numericColumns?.length > 0) {
      this.selectedYColumn = this.numericColumns[0];
    }

    console.log('onGroupDuplicatesChange called');
    console.log('groupDuplicates:', this.groupDuplicates);
    console.log('selectedXColumn:', this.selectedXColumn);
    console.log('selectedYColumn:', this.selectedYColumn);
    this.updateChartData();
    this.cdr.markForCheck();
  }

  onAggregationTypeChange() {
    this.updateChartData();
  }

  // aggregateData(): Array<Record<string, unknown>> {
  //   if (!this.groupDuplicates) return this.rows;
  // }

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

  get hasSelectedY(): boolean {
    return this.selectedYColumn?.length > 0;
  }

  get dataForChart(): Array<Record<string, unknown>> {
    if (!this.groupDuplicates) {
      return this.rows;
    }
    return this.aggregateData();
  }

  get hasSelectedX(): boolean {
    return this.selectedXColumn?.length > 0;
  }

  get numericColumns(): string[] {
    if (!this.columns || !this.rows) {
      return [];
    }

    return this.columns.filter((col) => isColumnNumericish(this.rows, col));
  }

  get columnsForChart(): string[] {
    if (!this.groupDuplicates) {
      return this.columns;
    }
    return [this.selectedXColumn, this.selectedYColumn];
  }
}

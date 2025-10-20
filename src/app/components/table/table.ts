import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CellValue } from '../../shared/helpers/cell-types';
import {
  HeaderViewModelService,
  HeaderVM,
} from '../../services/headerView/header-view-model-service';
import { CommonModule } from '@angular/common';
import {
  BodyMergeService,
  MergeCellMeta,
} from '../../services/BodyMergeService/body-merge-service';

@Component({
  selector: 'app-table',
  imports: [CommonModule],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table implements OnChanges {
  constructor(
    private headerVMService: HeaderViewModelService,
    private bodyMerge: BodyMergeService
  ) {}

  @Input() parseReady?: boolean;
  @Input() sheetName!: string;
  @Input() columns!: string[];
  @Input() rowCount!: number;
  @Input() rows!: Array<Record<string, CellValue>>;
  @Input() sampleRows!: Array<Record<string, CellValue>>;
  @Input() warnings!: string[];

  @Input() headerRows!: CellValue[][];
  @Input() mergeRanges!: Array<{
    s: { r: number; c: number };
    e: { r: number; c: number };
  }>;
  @Input() startRow!: number;
  @Input() headerDepth!: number;

  headerVM?: HeaderVM;

  bodyMergeKey?: string;
  bodyMergeMeta: MergeCellMeta[] = [];

  ngOnChanges(_: SimpleChanges) {
    if (this.headerRows?.length) {
      this.headerVM = this.headerVMService.buildHeaderVM(this.headerRows, {
        merges: this.mergeRanges ?? [],
        headerTop: this.startRow ?? 0,
      });
    }

    this.bodyMergeKey = this.columns?.[0];
    if (this.bodyMergeKey && Array.isArray(this.sampleRows)) {
      this.bodyMergeMeta = this.bodyMerge.computeRowSpans(
        this.sampleRows,
        this.bodyMergeKey
      );
    } else {
      this.bodyMergeMeta = [];
    }
  }
}

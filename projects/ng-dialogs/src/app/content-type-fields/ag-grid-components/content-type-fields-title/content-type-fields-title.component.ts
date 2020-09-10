import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';

@Component({
  selector: 'app-content-type-fields-title',
  templateUrl: './content-type-fields-title.component.html',
  styleUrls: ['./content-type-fields-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentTypeFieldsTitleComponent implements ICellRendererAngularComp {
  icon: string;

  agInit(params: ICellRendererParams) {
    const value: boolean = params.value;
    this.icon = value ? 'star' : 'star_border';
  }

  refresh(params?: any): boolean {
    return true;
  }
}

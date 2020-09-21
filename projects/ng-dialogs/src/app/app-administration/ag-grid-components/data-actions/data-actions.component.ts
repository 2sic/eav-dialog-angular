import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentType } from '../../models/content-type.model';
import { DataActionsParams } from './data-actions.models';

@Component({
  selector: 'app-data-actions',
  templateUrl: './data-actions.component.html',
  styleUrls: ['./data-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataActionsComponent implements ICellRendererAngularComp {
  contentType: ContentType;
  showPermissions: boolean;
  private params: DataActionsParams;

  agInit(params: DataActionsParams) {
    this.params = params;
    this.contentType = this.params.data;
    const showPermissions = this.params.showPermissionsGetter();
    this.showPermissions = showPermissions && this.isGuid(this.contentType.StaticName);
  }

  refresh(params?: any): boolean {
    return true;
  }

  createOrEditMetadata() {
    this.params.onCreateOrEditMetadata(this.contentType);
  }

  openExport() {
    this.params.onOpenExport(this.contentType);
  }

  openImport() {
    this.params.onOpenImport(this.contentType);
  }

  openPermissions() {
    this.params.onOpenPermissions(this.contentType);
  }

  deleteContentType() {
    this.params.onDelete(this.contentType);
  }

  private isGuid(txtToTest: string) {
    const patt = new RegExp(/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i);
    return patt.test(txtToTest);
  }
}

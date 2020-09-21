import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Context } from '../../shared/services/context';
import { ContentInfo } from '../models/content-info.model';
import { webApiAppPartsRoot } from './import-app-parts.service';

@Injectable()
export class ExportAppPartsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getContentInfo(scope: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiAppPartsRoot + 'Get'), {
      params: { appid: this.context.appId.toString(), zoneId: this.context.zoneId.toString(), scope },
    }) as Observable<ContentInfo>;
  }

  exportParts(contentTypeIds: number[], entityIds: number[], templateIds: number[]) {
    const url = this.dnnContext.$2sxc.http.apiUrl(webApiAppPartsRoot + 'Export')
      + '?appId=' + this.context.appId.toString()
      + '&zoneId=' + this.context.zoneId.toString()
      + '&contentTypeIdsString=' + contentTypeIds.join(';')
      + '&entityIdsString=' + entityIds.join(';')
      + '&templateIdsString=' + templateIds.join(';');

    window.open(url, '_self', '');
  }
}

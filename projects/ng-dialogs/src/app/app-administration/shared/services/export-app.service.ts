import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../../shared/context/context';
import { AppInfo } from '../models/app-info.model';

@Injectable()
export class ExportAppService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAppInfo() {
    return <Observable<AppInfo>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/ImportExport/GetAppInfo'), {
      params: { appid: this.context.appId.toString(), zoneId: this.context.zoneId.toString() },
    });
  }

  exportApp(includeContentGroups: boolean, resetAppGuid: boolean) {
    const url = this.dnnContext.$2sxc.http.apiUrl('app-sys/ImportExport/ExportApp')
      + '?appId=' + this.context.appId
      + '&zoneId=' + this.context.zoneId
      + '&includeContentGroups=' + includeContentGroups
      + '&resetAppGuid=' + resetAppGuid;

    window.open(url, '_self', '');
  }

  exportForVersionControl(includeContentGroups: boolean, resetAppGuid: boolean) {
    return <Observable<boolean>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/ImportExport/ExportForVersionControl'), {
      params: {
        appid: this.context.appId.toString(),
        zoneId: this.context.zoneId.toString(),
        includeContentGroups: includeContentGroups.toString(),
        resetAppGuid: resetAppGuid.toString(),
      },
    });
  }
}

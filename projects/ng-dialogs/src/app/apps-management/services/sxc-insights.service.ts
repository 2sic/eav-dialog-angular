import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

const webApiLogRoot = 'sys/log/';

@Injectable()
export class SxcInsightsService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  activatePageLog(duration: number) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiLogRoot + 'EnableDebug'), {
      params: { duration: duration.toString() }
    }) as Observable<string>;
  }
}

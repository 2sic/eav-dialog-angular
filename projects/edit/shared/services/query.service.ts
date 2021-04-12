import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';
import { QueryStreams } from '../../eav-material-controls/input-types/entity/entity-query/entity-query.models';

@Injectable()
export class QueryService {
  constructor(private http: HttpClient, private dnnContext: DnnContext, private context: Context) { }

  getAvailableEntities(queryUrl: string, includeGuid: boolean, params: string, entitiesFilter?: string[]): Observable<QueryStreams> {
    const allParams = `includeGuid=${includeGuid}` + `&appId=${this.context.appId}` + (params ? `&${params}` : '');
    return this.http.post<QueryStreams>(
      this.dnnContext.$2sxc.http.apiUrl(`app/auto/query/${queryUrl}?${allParams}`),
      { Guids: entitiesFilter },
    );
  }
}

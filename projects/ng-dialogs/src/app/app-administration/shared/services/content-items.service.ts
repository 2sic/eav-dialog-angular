import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../../shared/context/context';
import { ContentItem } from '../models/content-item.model';
import { Field } from '../models/field.model';
import { toBase64 } from '../../../shared/helpers/fileToBase64.helper';

@Injectable()
export class ContentItemsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAll(contentTypeStaticName: string) {
    return <Observable<ContentItem[]>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/entities/GetAllOfTypeForAdmin'), {
      params: { appId: this.context.appId.toString(), contentType: contentTypeStaticName }
    });
  }

  getColumns(contentTypeStaticName: string) {
    return <Observable<Field[]>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/getfields'), {
      params: { appId: this.context.appId.toString(), staticName: contentTypeStaticName }
    });
  }

  async importItem(file: File) {
    return <Observable<boolean>>this.http.post(this.dnnContext.$2sxc.http.apiUrl('eav/contentimport/import'), {
      AppId: this.context.appId.toString(),
      ContentBase64: await toBase64(file),
    });
  }
}

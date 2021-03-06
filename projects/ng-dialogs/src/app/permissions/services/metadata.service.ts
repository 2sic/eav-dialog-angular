import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Context } from '../../shared/services/context';

const webApiRoot = 'admin/metadata/get';

@Injectable()
export class MetadataService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  /**
   * Fetches metadata for given key in metadata content type
   * @param typeId metadataOf something. For more info checkout out eavConstants file
   * @param keyType e.g. for keyType === guid, key === contentTypeStaticName
   * @param key key of content type for which we search for permissions. Key is connected with keyType
   * @param contentTypeName name of content type where permissions are stored
   */
  getMetadata<T>(typeId: number, keyType: string, key: string, contentTypeName: string) {
    return this.http.get<T>(this.dnnContext.$2sxc.http.apiUrl(webApiRoot), {
      params: {
        appId: this.context.appId.toString(),
        targetType: typeId.toString(),
        keyType,
        key,
        contentType: contentTypeName,
      },
    });
  }
}

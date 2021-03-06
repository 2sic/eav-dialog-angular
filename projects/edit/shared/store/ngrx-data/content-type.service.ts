import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { EavContentType } from '../../models/eav';
import { ContentType1 } from '../../models/json-format-v1';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class ContentTypeService extends BaseDataService<EavContentType> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('ContentType', serviceElementsFactory);
  }

  addContentTypes(contentTypes1: ContentType1[]): void {
    const contentTypes = contentTypes1.map(contentType1 => EavContentType.convert(contentType1));
    this.addManyToCache(contentTypes);
  }

  getContentType(id: string): EavContentType {
    return this.cache$.value.find(contentType => contentType.Id === id);
  }

  getContentType$(id: string): Observable<EavContentType> {
    return this.cache$.pipe(
      map(contentTypes => contentTypes.find(contentType => contentType.Id === id)),
      distinctUntilChanged(),
    );
  }
}

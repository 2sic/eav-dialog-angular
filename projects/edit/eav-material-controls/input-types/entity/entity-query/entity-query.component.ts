import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { FieldMask } from '../../../../shared/helpers';
import { EntityInfo } from '../../../../shared/models';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService, QueryService } from '../../../../shared/services';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { EntityDefaultComponent } from '../entity-default/entity-default.component';
import { EntityQueryLogic } from './entity-query-logic';
import { QueryEntity } from './entity-query.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-query',
  templateUrl: '../entity-default/entity-default.component.html',
  styleUrls: ['../entity-default/entity-default.component.scss'],
})
@ComponentMetadata({})
export class EntityQueryComponent extends EntityDefaultComponent implements OnInit, OnDestroy {
  useQuery = true;
  private paramsMask: FieldMask;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    snackBar: MatSnackBar,
    private queryService: QueryService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService, entityService, translate, editRoutingService, snackBar);
    EntityQueryLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();

    this.subscription.add(
      this.settings$.subscribe(settings => {
        this.paramsMask?.destroy();
        this.paramsMask = new FieldMask(
          settings.UrlParameters,
          this.group.controls,
          this.fetchAvailableEntities.bind(this),
          null,
          this.eavService.eavConfig,
        );
      })
    );

    this.fetchAvailableEntities();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /** Override function in superclass */
  fetchAvailableEntities() {
    const settings = this.settings$.value;
    if (!settings.Query) {
      alert(`No query defined for ${this.config.fieldName} - can't load entities`);
      return;
    }

    const streamName = settings.StreamName;
    const queryUrl = settings.Query.includes('/') ? settings.Query : `${settings.Query}/${streamName}`;
    const params = this.paramsMask.resolve();

    this.queryService.getAvailableEntities(queryUrl, true, params).subscribe({
      next: (data) => {
        if (!data) {
          this.error$.next(this.translate.instant('Fields.EntityQuery.QueryError'));
          return;
        }
        if (!data[streamName]) {
          this.error$.next(this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + streamName);
          return;
        }
        const items: EntityInfo[] = data[streamName].map(this.queryEntityMapping.bind(this));
        this.config.entityCache$.next(items);
      },
      error: (error) => {
        console.error(error);
        console.error(`${this.translate.instant('Fields.EntityQuery.QueryError')} - ${error.data}`);
      }
    });
  }

  /** Overridden in subclass */
  queryEntityMapping(entity: QueryEntity) {
    const entityInfo: EntityInfo = {
      Id: entity.Id,
      Value: entity.Guid,
      Text: entity.Title,
    };
    return entityInfo;
  }
}

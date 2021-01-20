import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { EntityInfo } from '../../../../shared/models';
import { EavService } from '../../../../shared/services/eav.service';
import { EditRoutingService } from '../../../../shared/services/edit-routing.service';
import { EntityService } from '../../../../shared/services/entity.service';
import { QueryService } from '../../../../shared/services/query.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { EntityQueryComponent } from '../../entity/entity-query/entity-query.component';
import { QueryEntity } from '../../entity/entity-query/entity-query.models';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown-query',
  templateUrl: '../../entity/entity-default/entity-default.component.html',
  styleUrls: ['../../entity/entity-default/entity-default.component.scss'],
})
@InputType({})
export class StringDropdownQueryComponent extends EntityQueryComponent implements OnInit, OnDestroy {
  settingsLogic = new StringDropdownQueryLogic();

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    snackBar: MatSnackBar,
    queryService: QueryService,
  ) {
    super(eavService, validationMessagesService, entityService, translate, editRoutingService, snackBar, queryService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /** Override function in superclass */
  queryEntityMapping(entity: QueryEntity) {
    const settings = this.settings$.value;
    const entityInfo: EntityInfo = {
      Id: entity.Id,
      Value: entity[settings.Value],
      Text: entity[settings.Label],
    };
    return entityInfo;
  }
}

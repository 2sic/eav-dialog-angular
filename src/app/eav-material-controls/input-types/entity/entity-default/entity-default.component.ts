import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription, merge, fromEvent } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialog } from '@angular/material';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { EavService } from '../../../../shared/services/eav.service';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { EntityService } from '../../../../shared/services/entity.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { MultiItemEditFormComponent } from '../../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.component';
import { EavAdminUiService } from '../../../../shared/services/eav-admin-ui.service';
import { FieldMaskService } from '../../../../shared/services/field-mask.service';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-default',
  templateUrl: './entity-default.component.html',
  styleUrls: ['./entity-default.component.css'],
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class EntityDefaultComponent implements Field, OnInit, OnDestroy, AfterViewInit {
  @ViewChild('autocompleteInput') input;

  @Input() config: FieldConfig;
  group: FormGroup;

  chosenEntities: string[];
  // options: Item[];
  selectEntities: Observable<EntityInfo[]> = null;
  // entities = [];
  private contentType: FieldMaskService;

  private availableEntities: EntityInfo[] = [];
  private entityTextDefault = 'Item not found'; // $translate.instant("FieldType.Entity.EntityNotFound");
  private subscriptions: Subscription[] = [];
  private eavConfig: EavConfiguration;

  get allowMultiValue() {
    return this.config.settings.AllowMultiValue || false;
  }

  get entityType() {
    return this.config.settings.EntityType || '';
  }

  get enableAddExisting() {
    return this.config.settings.EnableAddExisting || false;
  }

  get enableCreate() {
    return this.config.settings.EnableCreate || false;
  }

  get enableEdit() {
    return this.config.settings.EnableEdit || false;
  }

  get enableRemove() {
    return this.config.settings.EnableRemove || false;
  }

  get enableDelete() {
    return this.config.settings.EnableDelete || false;
  }

  get disabled() {
    return this.group.controls[this.config.name].disabled;
  }

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  getErrorMessage() {
    return this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config, true);
  }

  constructor(private entityService: EntityService,
    private eavService: EavService,
    private eavAdminUiService: EavAdminUiService,
    private validationMessagesService: ValidationMessagesService,
    private dialog: MatDialog) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {

    // Initialize entities
    const sourceMask = this.entityType || null;
    // this will contain the auto-resolve type (based on other contentType-field)
    this.contentType = new FieldMaskService(sourceMask, this.maybeReload, null, null);
    // don't get it, it must be blank to start with, so it will be loaded at least 1x lastContentType = contentType.resolve();
    console.log('contentType', this.contentType);

    console.log('[create]  ngOnInit EntityDefaultComponent', this.group.value);
    this.setChosenEntities();

    this.setAvailableEntities();
  }

  ngAfterViewInit() {
    this.setSelectEntitiesObservables();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  maybeReload() {
    console.log('call maybeReload');
  }

  optionSelected(event) {
    this.addEntity(event.option.value);
    this.input.nativeElement.value = null;
  }

  getEntityText = (value): string => {
    if (value === null) {
      return 'empty slot';
    }
    const entities = this.availableEntities.filter(f => f.Value === value);
    if (entities.length > 0) {
      return entities.length > 0 ? entities[0].Text :
        this.entityTextDefault ? this.entityTextDefault : value;
    }

    return value;
  }

  getEntityId = (value): string => {
    if (value === null) {
      return 'empty slot';
    }
    const entities = this.availableEntities.filter(f => f.Value === value);
    if (entities.length > 0) {
      return entities.length > 0 ? entities[0].Id : value;
    }

    return value;
  }

  /**
   * Determine is entityID in chosenEntities
   */
  isInChosenEntities = (value): boolean => {
    if (this.chosenEntities.find(e => e === value)) {
      return true;
    }

    return false;
  }

  /**
   * add entity to form
   * @param value
   */
  addEntity(value: string) {
    if (value) {
      // this.selectedValue = null;
      const entityValues: string[] = [...this.group.controls[this.config.name].value];
      entityValues.push(value);
      this.group.controls[this.config.name].patchValue(entityValues);
    }
  }

  /**
   *  open edit eav item dialog for item
   * @param value
   */
  edit(value: string) {
    const dialogRef = this.eavAdminUiService.openItemEditWithEntityId(this.dialog, this.getEntityId(value), MultiItemEditFormComponent);
  }

  /**
   * remove entity value from form
   * @param value
   */
  removeSlot(item: string, index: number) {
    const entityValues: string[] = [...this.group.controls[this.config.name].value];
    entityValues.splice(index, 1);
    // this.group.patchValue({ [this.config.name]: entityValues.filter(entity => entity !== value) });
    this.group.controls[this.config.name].patchValue(entityValues);
  }

  /**
   * delete entity
   * @param value
   */
  deleteItemInSlot(item: string, index: number) {
    if (this.entityType === '') {
      alert('delete not possible - no type specified in entity field configuration');
      return;
    }

    const entities: EntityInfo[] = this.availableEntities.filter(f => f.Value === item);
    const id = entities[0].Id;
    const text = entities[0].Text;
    // TODO:contentType.resolve()
    const contentTypeTemp = this.entityType; // contentType.resolve()
    // Then delete entity item:
    this.entityService.delete(this.eavConfig.appId, contentTypeTemp, id, false).subscribe(result => {
      if (result === null || result.status >= 200 && result.status < 300) {
        // TODO: make message
        this.removeSlot(item, index);
      } else {
        // TODO: message success
        this.entityService.delete(this.eavConfig.appId, contentTypeTemp, id, true).subscribe(items => {
          this.removeSlot(item, index);
          // TODO: refresh avalable entities
        });
      }
    });
  }

  levelUp(value: string, index: number) {
    const entityValues: string[] = [...this.group.controls[this.config.name].value];
    entityValues.splice(index, 1);
    entityValues.splice(index - 1, 0, ...[value]);
    this.group.controls[this.config.name].patchValue(entityValues);
  }

  levelDown(value: string, index: number) {
    const entityValues: string[] = [...this.group.controls[this.config.name].value];
    entityValues.splice(index, 1);
    entityValues.splice(index + 1, 0, ...[value]);
    this.group.controls[this.config.name].patchValue(entityValues);
  }

  openNewEntityDialog() {
    console.log('TODO openNewEntityDialog');

    // open the dialog for a new item
    // TODO: finisih this when web services are completed
    // eavAdminDialogs.openItemNew(contentType.resolve(), reloadAfterAdd);
  }

  /**
   * set initial value and subscribe to form value changes
   */
  private setChosenEntities() {
    this.chosenEntities = this.group.controls[this.config.name].value || [];

    this.subscriptions.push(
      this.group.controls[this.config.name].valueChanges.subscribe((item) => {
        this.updateChosenEntities(item);
      })
    );

    this.subscriptions.push(
      this.eavService.formSetValueChange$.subscribe((item) => {
        this.updateChosenEntities(this.group.controls[this.config.name].value);
      })
    );
  }

  private updateChosenEntities(values: string[]) {
    if (this.chosenEntities !== values) {
      this.chosenEntities = values;
    }
  }

  /**
   * TODO: select all entities from app
   */
  private setAvailableEntities() {
    // TODO:
    // const ctName = this.contentType.resolve(); // always get the latest definition, possibly from another drop-down
    // TEMP: harcoded
    const ctName = this.entityType;

    // check if we should get all or only the selected ones...
    // if we can't add, then we only need one...
    let itemFilter = null;
    try {
      itemFilter = this.enableAddExisting
        ? null
        : this.group.controls[this.config.name].value;
    } catch (err) { }

    this.entityService.getAvailableEntities(this.eavConfig.appId, itemFilter, ctName).subscribe(items => {
      this.availableEntities = [...items];
    });
  }

  /**
   * selectEntities observe events from input autocomplete field
   */
  private setSelectEntitiesObservables() {
    if (this.input && this.selectEntities === null) {
      const eventNames = ['keyup', 'click'];
      // Merge all observables into one single stream:
      const eventStreams = eventNames.map((eventName) => {
        // return Observable.fromEvent(this.input.nativeElement, eventName);
        return fromEvent(this.input.nativeElement, eventName);
      });

      const allEvents$ = merge(...eventStreams);

      this.selectEntities = allEvents$
        .pipe(map((value: any) => this.filter(value.target.value)));
      // .do(value => console.log('test selectEntities', value));
    }

    // clear this.selectEntities if input don't exist
    // this can happen when not allowMultiValue
    if (!this.input) {
      this.selectEntities = null;
    }
  }

  private filter(val: string): EntityInfo[] {
    if (val === '') {
      return this.availableEntities;
    }

    return this.availableEntities.filter(option =>
      option.Text ?
        option.Text.toLowerCase().indexOf(val.toLowerCase()) === 0
        : option.Value.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

}

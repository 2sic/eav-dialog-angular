import {
  Component, OnInit, Input,
  DoCheck, OnDestroy,
  AfterViewInit, ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/fromEvent';
import { map } from 'rxjs/operators';
import { merge } from 'rxjs/observable/merge';
import { of } from 'rxjs/observable/of';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { EavEntity, Item } from '../../../../shared/models/eav';
import { EavType } from '../../../../shared/models/eav/eav-type';
import { ItemService } from '../../../../shared/services/item.service';
import { ContentTypeService } from '../../../../shared/services/content-type.service';

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
  selectEntities: Observable<Item[]> = null;

  private availableEntities: Item[] = [];
  private entityTextDefault = 'Item not found'; // $translate.instant("FieldType.Entity.EntityNotFound");
  private subscriptions: Subscription[] = [];

  get allowMultiValue() {
    return this.config.settings.AllowMultiValue ? this.config.settings.AllowMultiValue.values[0].value : false;
  }

  get entityType() {
    return this.config.settings.EntityType ? this.config.settings.EntityType.values[0].value : '';
  }

  get enableAddExisting() {
    return this.config.settings.EnableAddExisting ? this.config.settings.EnableAddExisting.values[0].value : false;
  }

  get enableCreate() {
    return this.config.settings.EnableCreate ? this.config.settings.EnableCreate.values[0].value : false;
  }

  get enableEdit() {
    return this.config.settings.EnableEdit ? this.config.settings.EnableEdit.values[0].value : false;
  }

  get enableRemove() {
    return this.config.settings.EnableRemove ? this.config.settings.EnableRemove.values[0].value : false;
  }

  get enableDelete() {
    return this.config.settings.EnableDelete ? this.config.settings.EnableDelete.values[0].value : false;
  }

  constructor(private itemService: ItemService, private contenttypeService: ContentTypeService) {
  }

  // ngDoCheck() {
  //   console.log('DoCheck', this.config.label);
  //   // console.log('this.chosenEntities: ', [... this.group.controls[this.config.name].value]);
  // }

  ngOnInit() {
    this.setChosenEntities();

    this.setAvailableEntities();
  }

  ngAfterViewInit() {
    this.setSelectEntitiesObservables();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  optionSelected(event) {
    console.log('optionSelected:', event);
    this.addEntity(event.option.value);
    this.input.nativeElement.value = null;
  }

  // TODO: to many detect changes ???
  getEntityText = (entityId): string => {
    // console.log('getEntityText', entityId);
    if (entityId === null) {
      return 'empty slot';
    }
    const entities = this.availableEntities.filter(f => f.entity.guid === entityId);
    if (entities.length > 0) {
      // TODO: Need read which attribut is title !!! Harcoded 'name' for now.
      if (entities[0].entity.attributes['Name']) {
        return entities.length > 0 ? entities[0].entity.attributes['Name'].values[0].value :
          this.entityTextDefault ? this.entityTextDefault : entityId;
      }
    }

    return entityId;
  }

  /**
   * Determine is entityID in chosenEntities
   */
  isInChosenEntities = (entityID): boolean => {
    if (this.chosenEntities.find(id => id === entityID)) {
      return true;
    }

    return false;
  }

  /**
   * set initial value and subscribe to form value changes
   */
  private setChosenEntities() {
    this.chosenEntities = this.group.controls[this.config.name].value;
    this.subscriptions.push(
      this.group.valueChanges.subscribe((item) => {
        if (this.chosenEntities !== item[this.config.name]) {
          this.chosenEntities = item[this.config.name];
        }
      })
    );
  }

  /**
   * TODO: select all entities from app
   */
  private setAvailableEntities() {
    // Temp
    // TODO: need write right service - this is only for testing
    this.subscriptions.push(
      this.itemService.selectAllItems().subscribe(items => {
        this.availableEntities = [...items];
      })
    );

    // TODO: availableEntities can be title, guid and id only - map observables to that
    // this.contenttypeService.getTitleAttribute(this.config.type)
  }

  /**
   * selectEntities observe events from input autocomplete field
   */
  private setSelectEntitiesObservables() {
    if (this.input && this.selectEntities === null) {
      const eventNames = ['keyup', 'click'];
      // Merge all observables into one single stream:
      const eventStreams = eventNames.map((eventName) => {
        return Observable.fromEvent(this.input.nativeElement, eventName);
      });

      const allEvents$ = merge(...eventStreams);

      this.selectEntities = allEvents$
        .map((value: any) => this.filter(value.target.value));
      // .do(value => console.log('test selectEntities', value));
    }

    // clear this.selectEntities if input don't exist
    // this can happen when not allowMultiValue
    if (!this.input) {
      this.selectEntities = null;
    }
  }

  // TODO: change temp harcoded name
  private filter(val: string): Item[] {
    if (val === '') {
      return this.availableEntities;
    }

    return this.availableEntities.filter(option =>
      option.entity.attributes['Name'] ?
        option.entity.attributes['Name'].values[0].value.toLowerCase().indexOf(val.toLowerCase()) === 0
        : option.entity.guid.toLowerCase().indexOf(val.toLowerCase()) === 0);
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
      this.group.patchValue({ [this.config.name]: entityValues });
    }
  }

  /**
   *  open edit eav item dialog for item
   * @param value
   */
  editEntity(value: string) {
    console.log('TODO editEntity', value);
  }

  /**
   * remove entity value from form
   * @param value
   */
  removeEntity(value: string) {
    const entityValues: string[] = [...this.group.controls[this.config.name].value];
    this.group.patchValue({ [this.config.name]: entityValues.filter(entity => entity !== value) });

    this.setSelectEntitiesObservables();
  }

  /**
   * delete entity
   * @param value
   */
  deleteEntity(value: string) {
    console.log('TODO deleteEntity', value);
  }

  openNewEntityDialog() {
    console.log('TODO openNewEntityDialog');
  }
}

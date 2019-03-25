import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { FieldExternal } from '../../../../eav-dynamic-form/model/field-external';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { EavService } from '../../../../shared/services/eav.service';
import { AdamConfig } from '../../../../shared/models/adam/adam-config';
import { DnnBridgeService } from '../../../../shared/services/dnn-bridge.service';
import { MatDialog } from '@angular/material';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'external',
  templateUrl: './external.component.html',
  styleUrls: ['./external.component.scss']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper', 'app-expandable-wrapper', 'app-dropzone-wrapper', 'app-adam-attach-wrapper'],
})
export class ExternalComponent implements FieldExternal, OnInit {
  @ViewChild('container') elReference: ElementRef;
  @Input() config: FieldConfigSet;
  group: FormGroup;
  @Input()
  set factory(value: any) {
    if (value) {
      this.renderExternalComponent(value);
      this.subscribeFormChange(value);
      this.externalFactory = value;
    }
  }

  private subscriptions: Subscription[] = [];
  private eavConfig: EavConfiguration;

  loaded = true;
  externalFactory: any;
  updateTriggeredByControl = false;

  get inputInvalid() {
    return this.group.controls[this.config.field.name].invalid;
  }

  get id() {
    return `${this.config.entity.entityId}${this.config.field.index}`;
  }

  constructor(private validationMessagesService: ValidationMessagesService,
    private eavService: EavService,
    private translate: TranslateService,
    private dnnBridgeService: DnnBridgeService,
    private dialog: MatDialog) {
    this.eavConfig = eavService.getEavConfiguration();
  }

  /**
   * This is host methods which the external control sees
   */
  private externalInputTypeHost = {
    update: (value: string) => this.update(value),
    setInitValues: (value: string) => this.setInitValues(),
    // toggleAdam: (value1, value2) => this.toggleAdam(value1, value2),
    // adamModeImage: () => (this.config && this.config.currentFieldConfig.adam)
    // ? this.config.currentFieldConfig.adam.showImagesOnly
    // : null,
    attachAdam: () => this.attachAdam(),
    openDnnDialog: (oldValue: any, params: any, callback: any, dialog: MatDialog) => this.openDnnDialog(oldValue, params, callback, dialog),
    getUrlOfIdDnnDialog: (value: string, callback: any) => this.getUrlOfIdDnnDialog(value, callback)
  };

  ngOnInit() { }

  private renderExternalComponent(factory: any) {
    factory.initialize(this.externalInputTypeHost, this.config, this.group, this.translate, this.id);
    factory.render(this.elReference.nativeElement);

    // factory.writeValue(this.elReference.nativeElement, this.group.controls[this.config.currentFieldConfig.name].value);
    // this.setExternalControlValues(factory, this.group.controls[this.config.currentFieldConfig.name].value);

    this.suscribeValueChanges(factory);
    // this.subscribeToCurrentLanguageFromStore(factory);
    this.loaded = false;
  }

  private update(value: string) {
    // TODO: validate value
    this.group.controls[this.config.field.name].patchValue(value);
    this.setDirty();
    this.updateTriggeredByControl = true;
  }

  openDnnDialog(oldValue: any, params: any, callback: any, dialog1: MatDialog) {
    console.log('openDnnDialog');
    this.dnnBridgeService.open(
      oldValue,
      params,
      callback,
      this.dialog);
  }

  getUrlOfIdDnnDialog(value: string, urlCallback: any) {
    console.log('getUrlOfIdDnnDialog');
    // handle short-ID links like file:17
    const urlFromId$ = this.dnnBridgeService.getUrlOfId(this.eavConfig.appId,
      value,
      this.config.entity.header.contentTypeName,
      this.config.entity.header.guid,
      this.config.field.name);

    if (urlFromId$) {
      // this.subscriptions.push(
      urlFromId$.subscribe((data) => {
        if (data) {
          urlCallback(data);
        }
      });
      // );
    } else {
      urlCallback(value);
    }
  }

  /**
   * Set initial values when external component is initialized
   */
  private setInitValues() {
    this.setExternalControlValues(this.externalFactory, this.group.controls[this.config.field.name].value);
    this.setExternalControlOptions(this.externalFactory);
  }

  private attachAdam() {
    // TODO:
    // If adam registered then attach Adam
    console.log('setInitValues');
    if (this.config.field.adam) {
      console.log('adam is registered - adam attached updateCallback', this.externalFactory);
      // set update callback = external method setAdamValue

      // callbacks - functions called from adam

      this.config.field.adam.updateCallback = (value) =>
        this.externalFactory.adamSetValue
          ? this.externalFactory.adamSetValue(value)
          : alert('adam attached but adamSetValue method not exist');

      this.config.field.adam.afterUploadCallback = (value) =>
        this.externalFactory.adamAfterUpload
          ? this.externalFactory.adamAfterUpload(value)
          : alert('adam attached but adamAfterUpload method not exist');

      // return value from form
      this.config.field.adam.getValueCallback = () => this.group.controls[this.config.field.name].value;

      return {
        toggleAdam: (value1: any, value2: any) => this.config.field.adam.toggle(value1),
        setAdamConfig: (adamConfig: AdamConfig) => this.config.field.adam.setConfig(adamConfig),
        adamModeImage: () => (this.config && this.config.field.adam)
          ? this.config.field.adam.showImagesOnly
          : null,
      };
    }
  }

  /**
   * subscribe to form value changes for this field
   */
  private suscribeValueChanges(factory: any) {
    this.subscriptions.push(
      this.group.controls[this.config.field.name].valueChanges.subscribe((item) => {
        this.setExternalControlValues(factory, item);
        this.setExternalControlOptions(factory);
      })
    );
  }

  /**
   * This is subscribe for all setforms - even if is not changing value.
   * @param factory
   */
  private subscribeFormChange(factory: any) {
    this.subscriptions.push(
      this.eavService.formSetValueChange$.subscribe((item) => {
        if (!this.updateTriggeredByControl) {
          this.setExternalControlValues(factory, item[this.config.field.name]);
          this.setExternalControlOptions(factory);
        }
        this.updateTriggeredByControl = false;
      })
    );
  }

  private setDirty() {
    this.group.controls[this.config.field.name].markAsDirty();
  }



  /**
   * write value from the form into the view in external component
   * @param factory
   * @param value
   */
  private setExternalControlValues(factory: any, value: string) {
    // if container have value
    if (this.elReference.nativeElement.innerHTML) {
      if (value) {
        factory.setValue(this.elReference.nativeElement, value);
      }
    }
  }

  /**
   * refresh only exteranl component options
   * @param factory
   */
  private setExternalControlOptions(factory: any) {
    // if container have value
    if (this.elReference.nativeElement.innerHTML) {
      factory.setOptions(this.elReference.nativeElement, this.group.controls[this.config.field.name].disabled);
      // this.setAdamOptions();
    }
  }



  // private setAdamOptions() {
  //   // set Adam disabled state
  //   if (this.config.currentFieldConfig.adam) {
  //     this.config.currentFieldConfig.adam.disabled = this.group.controls[this.config.currentFieldConfig.name].disabled;
  //   }
  // }
}

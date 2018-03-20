import { Component, OnInit, ViewChild, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-default',
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class StringDefaultComponent implements Field {
  @Input() config: FieldConfig;
  group: FormGroup;

  constructor() { }

  get rowCount() {
    return this.config.settings.RowCount ? this.config.settings.RowCount.values[0].value : 1;
  }

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  getErrorMessage() {
    console.log('Pozvano');
    return this.group.controls[this.config.name].hasError('required') ? 'You must enter a value' :
      '';
  }
}

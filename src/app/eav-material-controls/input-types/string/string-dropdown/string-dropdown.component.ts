import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown',
  templateUrl: './string-dropdown.component.html',
  styleUrls: ['./string-dropdown.component.scss']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class StringDropdownComponent implements Field, OnInit {
  config: FieldConfigSet;
  group: FormGroup;

  freeTextMode = false;
  selectOptions = [];

  private _selectOptions: string[] = [];
  private _oldOptions: string[] = [];

  get enableTextEntry() {
    return this.config.currentFieldConfig.settings.EnableTextEntry || false;
  }

  get notes() {
    return this.config.currentFieldConfig.settings.Notes || '';
  }

  get inputInvalid() {
    return this.group.controls[this.config.currentFieldConfig.name].invalid;
  }

  get value() {
    return this.group.controls[this.config.currentFieldConfig.name].value;
  }

  constructor(private validationMessagesService: ValidationMessagesService) { }

  ngOnInit() {
    this.selectOptions = this.setOptionsFromDropdownValues();
    this.freeTextMode = this.setFreeTextMode();
  }

  freeTextModeChange(event) {
    this.freeTextMode = !this.freeTextMode;
    // Stops dropdown from opening
    event.stopPropagation();
  }

  private setFreeTextMode() {
    if (this.value) {
      const isInSelectOptions: boolean = this.selectOptions.find(s => s.value === this.value);
      if (!isInSelectOptions && this.enableTextEntry) {
        return true;
      }
    }
    return false;
  }

  /**
  * Read settings Dropdown values
  */
  private setOptionsFromDropdownValues(): any {
    let options = [];
    if (this.config.currentFieldConfig.settings.DropdownValues) {
      const dropdownValues = this.config.currentFieldConfig.settings.DropdownValues;
      options = dropdownValues.replace(/\r/g, '').split('\n');
      options = options.map(e => {
        const s = e.split(':');
        const maybeWantedEmptyVal = s[1];
        const key = s.shift(); // take first, shrink the array
        const val = s.join(':');
        return {
          label: key,
          value: (val) ? val : key
        };
      });
    }
    return options;
  }



}

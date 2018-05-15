import { Component, EventEmitter, Input, OnChanges, OnInit, Output, OnDestroy, ViewChild, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormGroupDirective } from '@angular/forms';

import { FieldConfig } from '../../model/field-config';
import { Subscription } from 'rxjs/Subscription';

@Component({
  exportAs: 'appEavForm',
  templateUrl: './eav-form.component.html',
  selector: 'app-eav-form',
  styleUrls: ['./eav-form.component.css']
})
export class EavFormComponent implements OnChanges, OnInit, OnDestroy {
  @ViewChild('dynamicForm') dynamicForm: FormGroupDirective;

  @Input()
  config: FieldConfig[] = [];

  @Output()
  submit: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  formValueChange: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup = new FormGroup({});

  private subscriptions: Subscription[] = [];
  // get controls() { return this.config.filter(({ type }) => type !== 'button'); }
  // get controls() { return this.config }
  get changes() { return this.form.valueChanges; }
  get valid() { return this.form.valid; }
  get value() { return this.form.value; }

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    console.log('OnInit EavFormComponent');
    // let group = this.formBuilder.group({});
    this.createControlsInFormGroup(this.config);

    this.subscriptions.push(
      this.form.valueChanges.subscribe(val => {
        // if (this.form.valid) {

        // this.formErrors = this.FormService.validateForm(this.form, this.formErrors, true);

        this.formValueChange.emit(val);
        // }
      }));
  }

  ngOnChanges() {
    // console.log('ngOnChanges EavFormComponent');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  /**
   * Create form from configuration
   * @param fieldConfigArray
   */
  private createControlsInFormGroup(fieldConfigArray: FieldConfig[]) {
    // const group = this.formBuilder.group({});
    fieldConfigArray.forEach(fieldConfig => {
      if (fieldConfig.fieldGroup) {
        this.createControlsInFormGroup(fieldConfig.fieldGroup);
      } else {
        this.form.addControl(fieldConfig.name, this.createControl(fieldConfig));
      }
    }
    );

    return this.form;
  }

  /**
   *  Create form control
   * @param config
   */
  private createControl(config: FieldConfig) {
    const { disabled, validation, value } = config;
    return this.formBuilder.control({ disabled, value }, validation);
  }

  // handleSubmit(event: Event) {
  //   console.log('Submit');
  //   event.preventDefault();
  //   event.stopPropagation();
  //   this.submit.emit(this.value);
  // }

  save(event) {
    console.log('form save', event);
    // Use this to emit value out
    this.submit.emit(this.value);
  }

  submitOutside() {
    this.dynamicForm.ngSubmit.emit(this.value);
  }

  setDisabled(name: string, disable: boolean, emitEvent: boolean) {
    if (this.form.controls[name]) {
      // const method = disable ? 'disable' : 'enable';
      // this.form.controls[name][method]();

      if (disable) {
        this.form.controls[name].disable({ emitEvent: emitEvent });
      } else {
        this.form.controls[name].enable({ emitEvent: emitEvent });
      }

      return;
    }

    this.config = this.config.map((item) => {
      if (item.name === name) {
        item.disabled = disable;
      }
      return item;
    });
  }

  /**
   * Set form control value
   * @param name
   * @param value
   * @param emitEvent If emitEvent is true, this change will cause a valueChanges event on the FormControl
   * to be emitted. This defaults to true (as it falls through to updateValueAndValidity).
   */
  setValue(name: string, value: any, emitEvent: boolean) {
    if (value !== this.form.controls[name].value) {
      console.log('CHANGE' + name + ' from value: ' + this.form.controls[name].value + ' to ' + value);
      this.form.controls[name].setValue(value, { emitEvent: emitEvent });
    }
  }

  /**
   * Patch values to formGroup. It accepts an object with control names as keys, and will do it's best to
   * match the values to the correct controls in the group.
   * @param values
   * @param emitEvent If emitEvent is true, this change will cause a valueChanges event on the FormGroup
   * to be emitted. This defaults to true (as it falls through to updateValueAndValidity).
   */
  patchValue(values: { [key: string]: any }, emitEvent: boolean) {
    // if (this.valueIsChanged(values)) {
    // console.log('value patchValue');
    this.form.patchValue(values, { emitEvent: emitEvent });
    // }
  }

  /**
   * Check is value in form changed
   *
  */
  public valueIsChanged = (values: { [key: string]: any }) => {
    let valueIsChanged = false;
    console.log('[Test Disabled] VALUECHANGED values', values);
    console.log('[Test Disabled] VALUECHANGED form values', this.form.value);
    Object.keys(this.form.value).forEach(valueKey => {
      if (this.form.value[valueKey] !== values[valueKey]) {
        valueIsChanged = true;
      }
    });

    console.log('[Test Disabled] VALUECHANGED', valueIsChanged);
    return valueIsChanged;
  }
}
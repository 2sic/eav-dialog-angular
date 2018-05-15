import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, ValidationErrors } from '@angular/forms';
import {
  MatFormFieldModule,
  MatButtonModule,
  MatCheckboxModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCardModule,
  MatIconModule,
  MatGridListModule,
  MatAutocompleteModule,
  MatListModule,
  MatMenuModule,
  MatTooltipModule,
  MatTabsModule,
} from '@angular/material';
import {
  CollapsibleWrapperComponent,
  // FormFieldWrapperComponent
} from './wrappers';
import {
  StringDefaultComponent,
  StringUrlPathComponent,
  StringDropdownComponent,
  StringDropdownQueryComponent,
  StringFontIconPickerComponent,
  BooleanDefaultComponent,
  DatetimeDefaultComponent,
  EmptyDefaultComponent,
  NumberDefaultComponent,
  EntityDefaultComponent,
  HyperlinkDefaultComponent,
  ExternalComponent
} from './input-types';
import { InputTypesConstants } from '../shared/constants';
import { CustomValidators } from './validators/custom-validators';
import { ValidationMessagesService } from './validators/validation-messages-service';
import { TextEntryWrapperComponent } from './wrappers/text-entry-wrapper/text-entry-wrapper.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { Field } from '../eav-dynamic-form/model/field';
import { FieldParentWrapperComponent } from './wrappers/field-parent-wrapper/field-parent-wrapper.component';
import { EavLocalizationComponent } from './wrappers/eav-localization-wrapper/eav-localization-wrapper.component';
import { FileTypeService } from '../shared/services/file-type.service';
import { EavLanguageSwitcherComponent } from './localization/eav-language-switcher/eav-language-switcher.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    // wrappers
    CollapsibleWrapperComponent,
    // FormFieldWrapperComponent,
    // types
    StringDefaultComponent,
    // FormFieldWrapperComponent,
    StringUrlPathComponent,
    StringDropdownComponent,
    StringDropdownQueryComponent,
    StringFontIconPickerComponent,
    BooleanDefaultComponent,
    TextEntryWrapperComponent,
    DatetimeDefaultComponent,
    EmptyDefaultComponent,
    NumberDefaultComponent,
    EavLocalizationComponent,
    FieldParentWrapperComponent,
    EntityDefaultComponent,
    HyperlinkDefaultComponent,
    EavLanguageSwitcherComponent,
    ExternalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    MatGridListModule,
    MatAutocompleteModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatTabsModule,
    TranslateModule.forChild()
  ],
  entryComponents: [
    StringDefaultComponent,
    StringUrlPathComponent,
    StringDropdownComponent,
    StringDropdownQueryComponent,
    StringFontIconPickerComponent,
    BooleanDefaultComponent,
    TextEntryWrapperComponent,
    DatetimeDefaultComponent,
    EmptyDefaultComponent,
    NumberDefaultComponent,
    EavLocalizationComponent,
    FieldParentWrapperComponent,
    CollapsibleWrapperComponent,
    EntityDefaultComponent,
    HyperlinkDefaultComponent,
    ExternalComponent
  ],
  exports: [EavLanguageSwitcherComponent],
  providers: [FileTypeService, ValidationMessagesService]
})
export class EavMaterialControlsModule { }
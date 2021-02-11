import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { EavService } from '.';
import { FieldSettings } from '../../../edit-types';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { FieldConfigAngular, FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { FieldHelper } from '../../eav-item-dialog/item-edit-form/field-helper';
import { ValidationHelper } from '../../eav-material-controls/validators/validation-helper';
import { InputFieldHelper } from '../helpers/input-field-helper';
import { LocalizationHelper } from '../helpers/localization-helper';
import { CalculatedInputType, FormulaFieldSettings } from '../models';
import { EavContentTypeAttribute, EavEntityAttributes, EavItem } from '../models/eav';
import { ContentTypeService } from '../store/ngrx-data/content-type.service';
import { InputTypeService } from '../store/ngrx-data/input-type.service';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';

@Injectable()
export class FieldsSettingsService {

  constructor() { }

  public buildFieldConfig(
    attribute: EavContentTypeAttribute,
    index: number,
    calculatedInputType: CalculatedInputType,
    contentTypeSettings: EavEntityAttributes,
    isParentGroup: boolean,
    currentLanguage: string,
    defaultLanguage: string,
    item: EavItem,
    inputTypeService: InputTypeService,
    itemService: ItemService,
    formId: number,
    languageInstanceService: LanguageInstanceService,
    contentTypeService: ContentTypeService,
    eavService: EavService,
  ): FieldConfigAngular {
    let fieldConfig: FieldConfigAngular;
    let settingsTranslated: FieldSettings;
    let fullSettings: EavEntityAttributes;
    const isEmptyInputType = (calculatedInputType.inputType === InputTypeConstants.EmptyDefault);

    if (attribute) {
      settingsTranslated = LocalizationHelper.translateSettings(attribute.Settings, currentLanguage, defaultLanguage);
      fullSettings = attribute.Settings;
    } else if (isEmptyInputType && contentTypeSettings) {
      settingsTranslated = LocalizationHelper.translateSettings(contentTypeSettings, currentLanguage, defaultLanguage);
      fullSettings = contentTypeSettings;
    }

    // these settings are recalculated in translate-group-menu translateAllConfiguration
    const name = attribute ? attribute.Name : 'Edit Item';
    const label = attribute ? InputFieldHelper.getFieldLabel(attribute, settingsTranslated) : 'Edit Item';
    let inputTypeSettings: InputType;
    const disableI18n = LocalizationHelper.isI18nDisabled(inputTypeService, calculatedInputType, fullSettings);
    inputTypeService.getInputTypeById(calculatedInputType.inputType).pipe(take(1)).subscribe(type => {
      inputTypeSettings = type;
    });
    const wrappers = InputFieldHelper.setWrappers(calculatedInputType, settingsTranslated, inputTypeSettings);
    const isLastInGroup = false; // calculated later in calculateFieldPositionInGroup
    const fieldHelper = new FieldHelper(
      name,
      item.Entity.Guid,
      formId,
      isParentGroup,
      itemService,
      languageInstanceService,
      contentTypeService,
      inputTypeService,
      eavService,
    );

    if (isEmptyInputType) {
      fieldConfig = {
        _fieldGroup: [], // empty specific
        settings: settingsTranslated,
        fullSettings,
        wrappers,
        isExternal: calculatedInputType.isExternal,
        disableI18n,
        isLastInGroup,
        name,
        label,
        inputType: calculatedInputType.inputType,
      } as FieldConfigAngular;
    } else {
      const validation = ValidationHelper.getValidators(settingsTranslated);
      const required = ValidationHelper.isRequired(settingsTranslated);
      const initialValue = LocalizationHelper.translate(currentLanguage, defaultLanguage, item.Entity.Attributes[name], null);
      const disabled = settingsTranslated.Disabled;

      fieldConfig = {
        _fieldGroup: null,
        initialValue, // other fields specific
        validation, // other fields specific
        settings: settingsTranslated,
        fullSettings,
        wrappers,
        focused$: new BehaviorSubject(false),
        isExternal: calculatedInputType.isExternal,
        disableI18n,
        isLastInGroup,
        name,
        index, // other fields specific
        label,
        placeholder: settingsTranslated.Placeholder, // other fields specific
        inputType: calculatedInputType.inputType,
        type: attribute.Type, // other fields specific
        required, // other fields specific
        disabled, // other fields specific
        fieldHelper,
      };
    }
    return fieldConfig;
  }

  /** Translate field configuration (labels, validation, ...) */
  public translateSettingsAndValidation(
    config: FieldConfigSet,
    currentLanguage: string,
    defaultLanguage: string,
    formulaSettings?: FormulaFieldSettings,
  ): void {
    const fieldSettings = LocalizationHelper.translateSettings(config.field.fullSettings, currentLanguage, defaultLanguage);
    if (formulaSettings?.hidden) {
      fieldSettings.VisibleInEditUI = false;
    }
    if (formulaSettings?.required) {
      fieldSettings.Required = true;
    }
    if (formulaSettings?.disabled) {
      fieldSettings.Disabled = true;
    }
    config.field.settings = fieldSettings;
    config.field.label = fieldSettings.Name;
    config.field.placeholder = fieldSettings.Placeholder;
    config.field.validation = ValidationHelper.getValidators(fieldSettings);
    config.field.required = ValidationHelper.isRequired(fieldSettings);
    // config.field.settings$.next(fieldSettings); // must run after validations are recalculated
  }
}

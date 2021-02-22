import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EavService } from '../..';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { CalculatedInputType } from '../../shared/models';
import { EavContentType, EavContentTypeAttribute, EavEntityAttributes, EavItem } from '../../shared/models/eav';
import { FieldsSettingsService } from '../../shared/services/fields-settings.service';
import { ContentTypeService } from '../../shared/store/ngrx-data/content-type.service';
import { InputTypeService } from '../../shared/store/ngrx-data/input-type.service';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';

@Injectable()
export class BuildFieldsService {
  private item: EavItem;
  private formId: number;
  private currentLanguage: string;
  private defaultLanguage: string;
  private fieldsSettingsService: FieldsSettingsService;

  constructor(
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private languageInstanceService: LanguageInstanceService,
    private contentTypeService: ContentTypeService,
    private eavService: EavService,
  ) { }

  public buildFieldConfigs(
    contentType: EavContentType,
    item: EavItem,
    formId: number,
    currentLanguage: string,
    defaultLanguage: string,
    fieldsSettingsService: FieldsSettingsService,
  ): FieldConfigSet[] {
    this.item = item;
    this.formId = formId;
    this.currentLanguage = currentLanguage;
    this.defaultLanguage = defaultLanguage;
    this.fieldsSettingsService = fieldsSettingsService;

    const contentTypeSettings = contentType.Settings;

    // build first empty
    const parentType: CalculatedInputType = {
      inputType: InputTypeConstants.EmptyDefault,
      isExternal: false,
    };
    const parentFieldGroup = this.buildFieldConfig(null, null, parentType, contentTypeSettings, true);
    let currentFieldGroup = parentFieldGroup;

    // loop through contentType attributes
    contentType.Attributes.forEach((attribute, index) => {
      try {
        // if input type is empty-default create new field group and than continue to add fields to that group
        const calculatedInputType: CalculatedInputType = InputFieldHelper.calculateInputType(attribute, this.inputTypeService);
        const isEmptyInputType = (calculatedInputType.inputType === InputTypeConstants.EmptyDefault);
        if (isEmptyInputType) {
          // group-fields (empty)
          currentFieldGroup = this.buildFieldConfig(attribute, index, calculatedInputType, contentTypeSettings, false);
          const field = parentFieldGroup.field;
          field._fieldGroup.push(currentFieldGroup);
        } else {
          // all other fields (not group empty)
          const fieldConfigSet = this.buildFieldConfig(attribute, index, calculatedInputType, contentTypeSettings, null);
          const field = currentFieldGroup.field;
          field._fieldGroup.push(fieldConfigSet);
        }
      } catch (error) {
        console.error(`loadContentTypeFormFields(...) - error loading attribut ${index}`, attribute);
        throw error;
      }
    });
    return parentFieldGroup.field._fieldGroup;
  }

  private buildFieldConfig(
    attribute: EavContentTypeAttribute,
    index: number,
    calculatedInputType: CalculatedInputType,
    contentTypeSettings: EavEntityAttributes,
    isParentGroup: boolean,
  ): FieldConfigSet {
    const field = this.fieldsSettingsService.buildFieldConfig(
      attribute,
      index,
      calculatedInputType,
      contentTypeSettings,
      isParentGroup,
      this.currentLanguage,
      this.defaultLanguage,
      this.item,
      this.inputTypeService,
      this.itemService,
      this.formId,
      this.languageInstanceService,
      this.contentTypeService,
      this.eavService,
    );

    const fieldConfigSet: FieldConfigSet = {
      field,
    };
    return fieldConfigSet;
  }

  public startTranslations(fieldConfigs: FieldConfigSet[], form: FormGroup, fieldsSettingsService: FieldsSettingsService): void {
    for (const config of fieldConfigs) {
      const field = config.field;
      if (field._fieldGroup) {
        this.startTranslations(field._fieldGroup, form, fieldsSettingsService);
      } else {
        config.field.fieldHelper?.startTranslations(config, form, fieldsSettingsService);
      }
    }
  }

  public stopTranslations(fieldConfigs: FieldConfigSet[]): void {
    for (const config of fieldConfigs) {
      const field = config.field;
      if (field._fieldGroup) {
        this.stopTranslations(field._fieldGroup);
      } else {
        config.field.fieldHelper?.stopTranslations();
      }
    }
  }
}

import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { Observable, BehaviorSubject } from 'rxjs';

import { Connector } from '../../../../../../../edit-types';
import { InputTypeName } from '../../../../../../shared/models/input-field-models';
import { FormSet } from '../../../../../../shared/models/eav/form-set';

export class CustomElementProperties<T> {
  connector: Connector<T>;
  experimental: ExperimentalProps;
  host: any;

  adamSetValueCallback: any;
  adamAfterUploadCallback: any;
  // dnnBridgeprocessResult: any;
}

export class ExperimentalProps {
  entityGuid: string;
  allInputTypeNames: InputTypeName[];
  updateField: (name: string, value: any) => void;
  formGroup: FormGroup;
  formSetValueChange$: Observable<FormSet>;
  isFeatureEnabled: (guid: string) => boolean;
  dropzoneConfig$?: BehaviorSubject<DropzoneConfigInterface>;
  translateService: TranslateService; // for WYSIWYG
  expand: (expand: boolean) => void;
  setFocused: (focused: boolean) => void;
  wysiwygSettings?: WysiwygSettings; // only if field is of WYSIWYG input type
  expandedField$: Observable<number>;
}

export class WysiwygSettings {
  inlineMode: boolean; // without expandable -> inline mode in form. Not to be confused with tinymce inline mode which is without iframe
  buttonSource: string;
  buttonAdvanced: string;
}

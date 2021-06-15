import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/component-metadata.decorator';
import { BaseComponent } from '../../base/base.component';
import { CustomJsonEditorLogic } from './custom-json-editor-logic';
import { CustomJsonEditorTemplateVars } from './custom-json-editor.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'custom-json-editor',
  templateUrl: './custom-json-editor.component.html',
  styleUrls: ['./custom-json-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class CustomJsonEditorComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<CustomJsonEditorTemplateVars>;

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    CustomJsonEditorLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    const rowCount$ = this.settings$.pipe(map(settings => settings.Rows), distinctUntilChanged());

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([rowCount$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [rowCount],
      ]) => {
        const templateVars: CustomJsonEditorTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          rowCount,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}

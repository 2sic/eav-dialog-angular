import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService } from '../../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { BooleanTristateLogic } from './boolean-tristate-logic';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'boolean-tristate',
  templateUrl: './boolean-tristate.component.html',
  styleUrls: ['./boolean-tristate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({
  wrapper: [WrappersConstants.EavLocalizationWrapper],
})
export class BooleanTristateComponent extends BaseComponent<boolean | ''> implements OnInit, OnDestroy {

  constructor(eavService: EavService, validationMessagesService: ValidationMessagesService) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.value$ = this.value$.pipe(map(value => (value === '') ? null : value));
    const settingsLogic = new BooleanTristateLogic();
    this.label$ = settingsLogic.update(this.settings$, this.value$).pipe(map(settings => settings._label));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  toggle() {
    const currentValue: boolean | '' = this.control.value;
    let nextValue: boolean;
    switch (currentValue) {
      case false:
        nextValue = null;
        break;
      case '':
      case null:
        nextValue = true;
        break;
      case true:
        nextValue = false;
        break;
    }
    this.control.patchValue(nextValue);
  }

}

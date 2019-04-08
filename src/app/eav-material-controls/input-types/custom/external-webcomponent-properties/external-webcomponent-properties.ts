import { TranslateService } from '@ngx-translate/core';
import { ConnectorObservable } from '../../../../../../projects/shared/connector';
import { Observable } from 'rxjs/Observable';
import { InputTypeName } from '../../../../shared/helpers/input-field-models';

export class ExternalWebComponentProperties<T> {
    connector: ConnectorObservable<T>;
    hiddenProps: HiddenProps;
    host: any;
    translateService: TranslateService;

    adamSetValueCallback: any;
    adamAfterUploadCallback: any;
    // dnnBridgeprocessResult: any;
}

/** Props and methods available to the connector to communicate with the host */
export class Host<T> {
    update: (value: T) => void;
}

export class HiddenProps {
    allInputTypeNames: InputTypeName[];
    fieldStates$: Observable<FieldState[]>;
}

export class FieldState {
    name: string;
    value: any;
    disabled: boolean;
}

import { EavValues } from '../eav';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

export class Value1<T> {
  [key: string]: T;

  public static create<T>(eavValues: EavValues<T>): Value1<T> {
    const newValue1: Value1<T> = {};
    angularConsoleLog('eavValues.values.forEach: ', eavValues.values);
    eavValues.values.forEach(eavValue => {
      const allDimensions = eavValue.dimensions.map(d => d.value).join();
      newValue1[allDimensions] = eavValue.value;
    });
    return newValue1;
  }
}

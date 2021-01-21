import { EavValues } from '../eav';

export class Value1<T> {
  [key: string]: T;

  public static create<T>(eavValues: EavValues<T>): Value1<T> {
    const newValue1: Value1<T> = {};
    eavValues.Values.forEach(eavValue => {
      const allDimensions = eavValue.dimensions.map(d => d.value).join();
      newValue1[allDimensions] = eavValue.value;
    });
    return newValue1;
  }
}

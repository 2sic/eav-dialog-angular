import { EavEntityAttributes, EavFor, EavType } from '.';
import { Entity1 } from '../json-format-v1';

export class EavEntity {
  Attributes: EavEntityAttributes;
  Guid: string;
  Id: number;
  Owner: string;
  Type: EavType;
  Version: number;
  For?: EavFor;
  Metadata?: EavEntity[];

  static convertOne(entity1: Entity1): EavEntity {
    // spm 2021.01.26. is empty entity ever used?
    if (entity1 == null) {
      const defaultEntity: EavEntity = {
        Attributes: {},
        Guid: '00000000-0000-0000-0000-000000000000',
        Id: 0,
        Owner: '',
        Type: null,
        Version: 1,
        For: null,
        Metadata: null,
      };
      return defaultEntity;
    }

    const attributes = EavEntityAttributes.convert(entity1.Attributes);
    const metadata = this.convertMany(entity1.Metadata);

    const entity: EavEntity = {
      Attributes: attributes,
      Guid: entity1.Guid,
      Id: entity1.Id,
      Owner: entity1.Owner,
      Type: entity1.Type,
      Version: entity1.Version,
      For: entity1.For,
      Metadata: metadata,
    };
    return entity;
  }

  static convertMany(entities1: Entity1[]): EavEntity[] {
    if (entities1 == null) { return null; }

    const entities = entities1.map(entity1 => EavEntity.convertOne(entity1));
    return entities;
  }
}

import { EavAttributes } from './eav-attributes';
// import { EavAttributes } from './eav-attributes';
import { EavType } from './eav-type';
import { EavValue } from './eav-value';
import { Entity1 } from '../json-format-v1/entity1';
import { Attribute1 } from '../json-format-v1/attribute1';

export class EavEntity {
    // appId ???
    id: number;
    version: number;
    guid: string;
    // title - from attribute ???
    type: EavType; // ContentType
    attributes: EavAttributes;
    owner: string;
    metadata: EavEntity[];

    constructor(id: number, version: number, guid: string, type: EavType, attributes: EavAttributes, owner: string, metadata: EavEntity[]) {
        this.id = id;
        this.version = version;
        this.guid = guid;
        this.type = type;
        this.attributes = attributes;
        this.owner = owner;
        this.metadata = metadata;
    }

    /**
     * Create new Eav Entity from typed json Entity1
     * @param item
     */
    public static create(item: Entity1): EavEntity {
        console.log('create item.Attributes:', item.Attributes);
        const eavAttributes = EavAttributes.create(item.Attributes);
        const eavMetaData = this.createArray(item.Metadata);

        return new EavEntity(
            item.Id,
            item.Version,
            item.Guid,
            new EavType(item.Type.Id, item.Type.Name),
            eavAttributes,
            item.Owner,
            eavMetaData);
    }

    /**
    * Create new MetaData Entity Array from json typed metadataArray Entity1[]
    * @param item
    */
    public static createArray(entity1Array: Entity1[]): EavEntity[] {
        const eavMetaDataArray: EavEntity[] = new Array<EavEntity>();
        if (entity1Array !== undefined) {
            entity1Array.forEach(entity1 => {
                eavMetaDataArray.push(EavEntity.create(entity1));
            });
        }
        return eavMetaDataArray;
    }
}


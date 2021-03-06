import { EavEntity, EavFor, EavGroupAssignment } from '.';
import { Dictionary } from '../../../../ng-dialogs/src/app/shared/models/dictionary.model';

export interface EavHeader {
  Add: boolean;
  ContentTypeName: string;
  DuplicateEntity: number;
  EntityId: number;
  For: EavFor;
  Group: EavGroupAssignment;
  Guid: string;
  Index: number;
  Metadata?: EavEntity[];
  Prefill: Dictionary;
  Title?: string;
}

import { FieldValue } from '../../../../edit-types';
import { DesignerState, FormulaCacheItem } from '../../../shared/models';

export interface FormulaDesignerTemplateVars {
  formula: FormulaCacheItem;
  hasFormula: HasFormula;
  designer: DesignerState;
  snippets: DesignerSnippet[];
  result: FieldValue;
}

export interface HasFormula {
  [entityGuid: string]: {
    [fieldName: string]: {
      [target: string]: boolean;
    };
  };
}

export interface EntityOption {
  entityGuid: string;
  label: string;
}

export interface FieldOption {
  fieldName: string;
  label: string;
}

export interface DesignerSnippet {
  code: string;
  label: string;
}

export const SelectTargets = {
  Entity: 'entityGuid',
  Field: 'fieldValue',
  Target: 'formulaTarget',
} as const;

export type SelectTarget = typeof SelectTargets[keyof typeof SelectTargets];
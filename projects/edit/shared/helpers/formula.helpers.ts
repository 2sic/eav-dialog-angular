import { InputFieldHelpers } from '.';
import { FieldSettings } from '../../../edit-types';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { FormValues } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { DesignerSnippet, FieldOption } from '../../eav-item-dialog/multi-item-edit-form-debug/formula-designer/formula-designer.models';
import { FormulaCacheItem, FormulaFunction, FormulaProps, FormulaPropsV1, FormulaTargets, FormulaVersion, FormulaVersions, Language } from '../models';

export class FormulaHelpers {

  static findFormulaVersion(formula: string): FormulaVersion {
    const cleanFormula = formula.trim();
    const typePart = cleanFormula.substring(0, cleanFormula.indexOf('(')).trim();

    switch (typePart) {
      case FormulaVersions.V1:
        return FormulaVersions.V1;
      default:
        return;
    }
  }

  static buildFormulaFunction(formula: string): FormulaFunction {
    const version = this.findFormulaVersion(formula);
    let cleanFormula = formula.trim();

    switch (version) {
      case FormulaVersions.V1:
        cleanFormula = `function ${cleanFormula.substring(FormulaVersions.V1.length).trim()}`;
        break;
      default:
        break;
    }

    const fn: FormulaFunction = new Function(`return ${cleanFormula}`)();
    return fn;
  }

  static buildFormulaProps(
    formula: FormulaCacheItem,
    inputType: InputType,
    settings: FieldSettings,
    formValues: FormValues,
    currentLanguage: string,
    languages: Language[],
  ): FormulaProps {

    switch (formula.version) {
      case FormulaVersions.V1:
        const propsV1: FormulaPropsV1 = {
          data: {
            ...formValues,
            get default() {
              return InputFieldHelpers.parseDefaultValue(formula.fieldName, inputType, settings);
            },
            value: formValues[formula.fieldName],
          },
          context: {
            culture: {
              code: currentLanguage,
              name: languages.find(l => l.key === currentLanguage)?.name,
            },
            target: {
              get default() {
                return InputFieldHelpers.parseDefaultValue(formula.fieldName, inputType, settings);
              },
              name: formula.target === FormulaTargets.Value
                ? formula.fieldName
                : formula.target.substring(formula.target.lastIndexOf('.') + 1),
              type: formula.target === FormulaTargets.Value
                ? formula.target
                : formula.target.substring(0, formula.target.lastIndexOf('.')),
              value: formValues[formula.fieldName],
            },
          },
        };
        return propsV1;
      default:
        return;
    }
  }

  static buildDesignerSnippets(formula: FormulaCacheItem, fieldOptions: FieldOption[]): DesignerSnippet[] {
    switch (formula.version) {
      case FormulaVersions.V1:
        const valueSnippet: DesignerSnippet = {
          code: 'data.value',
          label: 'data.value',
        };

        const defaultSnippet: DesignerSnippet = {
          code: 'data.default',
          label: 'data.default',
        };

        const fieldSnippets = fieldOptions.map(field => {
          const code = `data.${field.fieldName}`;
          const fieldSnippet: DesignerSnippet = {
            code,
            label: code,
          };
          return fieldSnippet;
        });

        return [valueSnippet, defaultSnippet, ...fieldSnippets];
      default:
        return;
    }
  }
}
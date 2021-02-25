import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';

export class TranslateMenuHelpers {

  static getTranslationStateClass(linkType: string) {
    switch (linkType) {
      case TranslationLinkConstants.MissingDefaultLangValue:
        return 'localization-missing-default-lang-value';
      case TranslationLinkConstants.Translate:
      case TranslationLinkConstants.LinkCopyFrom:
        return 'localization-translate';
      case TranslationLinkConstants.DontTranslate:
        return '';
      case TranslationLinkConstants.LinkReadOnly:
        return 'localization-link-read-only';
      case TranslationLinkConstants.LinkReadWrite:
        return 'localization-link-read-write';
      default:
        return '';
    }
  }

  static calculateSharedInfoMessage(dimensions: string[], currentLanguage: string): string {
    dimensions = TranslateMenuHelpers.calculateShortDimensions(dimensions, currentLanguage);
    const result = TranslateMenuHelpers.calculateEditAndReadDimensions(dimensions);
    const editableDimensions = result.editableDimensions;
    const readOnlyDimensions = result.readOnlyDimensions;
    let infoMessage = '';

    const editableExist = editableDimensions.length > 0;
    const readOnlyExist = readOnlyDimensions.length > 0;
    if (editableExist && readOnlyExist) {
      infoMessage = `${editableDimensions.join(', ')}, (${readOnlyDimensions.join(', ')})`;
    } else if (editableExist) {
      infoMessage = editableDimensions.join(', ');
    } else if (readOnlyExist) {
      infoMessage = `(${readOnlyDimensions.join(', ')})`;
    }

    return infoMessage;
  }

  private static calculateShortDimensions(dimensions: string[], currentLanguage: string): string[] {
    const dimensionsMap: { [key: string]: string[] } = {};
    const shortCurrentLanguage = currentLanguage.slice(0, currentLanguage.indexOf('-'));

    dimensionsMap[shortCurrentLanguage] = [];
    dimensionsMap[shortCurrentLanguage].push(shortCurrentLanguage);

    dimensions.forEach(dimension => {
      const shortDimension = dimension.slice(0, dimension.indexOf('-'));
      const shortNoReadOnly = shortDimension.replace('~', '');

      if (!dimensionsMap[shortNoReadOnly]) {
        dimensionsMap[shortNoReadOnly] = [];
        dimensionsMap[shortNoReadOnly].push(dimension);
      } else {
        dimensionsMap[shortNoReadOnly].push(dimension);
      }
    });

    dimensions = dimensions.map(dimension => {
      const shortDimension = dimension.slice(0, dimension.indexOf('-'));
      const shortNoReadOnly = shortDimension.replace('~', '');

      if (dimensionsMap[shortNoReadOnly].length > 1) {
        return dimension;
      } else {
        return shortDimension;
      }
    });

    return dimensions;
  }

  private static calculateEditAndReadDimensions(dimensions: string[]) {
    const editableDimensions: string[] = [];
    const readOnlyDimensions: string[] = [];

    dimensions.forEach(dimension => {
      if (!dimension.includes('~')) {
        editableDimensions.push(dimension);
      } else {
        readOnlyDimensions.push(dimension.replace('~', ''));
      }
    });

    return {
      editableDimensions,
      readOnlyDimensions
    };
  }
}

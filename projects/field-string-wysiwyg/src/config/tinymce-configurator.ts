import { Editor, RawEditorSettings } from 'tinymce';
import { AddOnSettings, Connector } from '../../../edit-types';
import { WysiwygReconfigure } from '../../../edit-types';
import { FeaturesConstants } from '../../../edit/shared/constants';
import { EavWindow } from '../../../ng-dialogs/src/app/shared/models/eav-window.model';
import * as contentStyle from '../editor/tinymce-content.scss';
import { DefaultAddOnSettings, DefaultOptions, DefaultPaste, DefaultPlugins } from './defaults';
import { TinyMceToolbars } from './toolbars';
import { TinyMceTranslations } from './translations';

declare const window: EavWindow;
const reconfigErr = `Very likely an error in your reconfigure code. Check https://r.2sxc.org/field-wysiwyg`;

/** This object will configure the TinyMCE */
export class TinyMceConfigurator {
  addOnSettings: AddOnSettings = { ...DefaultAddOnSettings };

  private language: string;

  constructor(private connector: Connector<string>, private reconfigure: WysiwygReconfigure) {
    this.language = this.connector._experimental.translateService.currentLang;

    // call optional reconfiguration
    if (reconfigure) {
      reconfigure.initManager?.(window.tinymce);
      if (reconfigure.configureAddOns) {
        const changedAddOns = reconfigure.configureAddOns(this.addOnSettings);
        if (changedAddOns) {
          this.addOnSettings = changedAddOns;
        } else {
          console.error(`reconfigure.configureAddOns(...) didn't return a value. ${reconfigErr}`);
        }
      }

      this.addOnSettings = reconfigure.configureAddOns?.(this.addOnSettings) || this.addOnSettings;
      // if (reconfigure.optionsInit) reconfigure.optionsInit(this.options, this.instance);
    }

    this.warnAboutCommonSettingsIssues();
  }

  private warnAboutCommonSettingsIssues(): void {
    const contentCss = this.connector.field.settings.ContentCss;
    if (contentCss && contentCss?.toLocaleLowerCase().includes('file:')) {
      console.error(`Found a setting for wysiwyg ContentCss but it should be a real link, got this instead: '${contentCss}'`);
    }
  }

  /** Construct TinyMCE options */
  buildOptions(containerClass: string, fixedToolbarClass: string, inlineMode: boolean, setup: (editor: Editor) => void): RawEditorSettings {
    const connector = this.connector;
    const exp = connector._experimental;
    const buttonSource = connector.field.settings.ButtonSource;
    const buttonAdvanced = connector.field.settings.ButtonAdvanced;
    const dropzone = exp.dropzone;
    const adam = exp.adam;

    const contentBlocksEnabled = exp.allInputTypeNames[connector.field.index + 1]?.inputType === 'entity-content-blocks';
    const toolbarModes = TinyMceToolbars.build(contentBlocksEnabled, inlineMode, buttonSource, buttonAdvanced);

    if (dropzone == null || adam == null) {
      console.error(`Dropzone or ADAM Config not available, some things won't work`);
    }

    const options: RawEditorSettings = {
      ...DefaultOptions,
      ...{ plugins: [...DefaultPlugins] },
      selector: `.${containerClass}`,
      fixed_toolbar_container: `.${fixedToolbarClass}`,
      content_style: contentStyle.default,
      content_css: connector.field.settings?.ContentCss,
      setup,
      ...toolbarModes,
      ...TinyMceTranslations.getLanguageOptions(this.language),
      ...(exp.isFeatureEnabled(FeaturesConstants.PasteWithFormatting) ? DefaultPaste.formattedText : {}),
      ...(exp.isFeatureEnabled(FeaturesConstants.PasteImageFromClipboard) ? DefaultPaste.images(dropzone, adam) : {}),
    };

    if (this.reconfigure?.configureOptions) {
      const newOptions = this.reconfigure.configureOptions(options);
      if (newOptions) {
        return newOptions;
      }
      console.error(`reconfigure.configureOptions(options) didn't return an options object. ${reconfigErr}`);
    }
    return options;
  }

  addTranslations(): void {
    TinyMceTranslations.addTranslations(this.language, this.connector._experimental.translateService);
    this.reconfigure?.addTranslations?.(window.tinymce, this.language);
  }
}

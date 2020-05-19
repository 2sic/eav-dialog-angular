import { EavCustomInputField, Connector } from '../../../edit-types';
import { wysiwygPreviewTag, FieldStringWysiwygPreview } from '../preview/preview';
import { wysiwygEditorTag, FieldStringWysiwygEditor } from '../editor/editor';
import { webpackConsoleLog } from '../../../shared/webpack-console-log.helper';
import { WysiwygReconfigure } from '../../../edit-types/src/WysiwygReconfigure';

const wysiwygTag = 'field-string-wysiwyg';

/** Acts like a switcher that decides whether to load preview or the editor  */
class FieldStringWysiwyg extends HTMLElement implements EavCustomInputField<string> {
  connector: Connector<string>;
  mode?: 'inline' | 'normal';
  reconfigure?: WysiwygReconfigure;

  constructor() {
    super();
    webpackConsoleLog(`${wysiwygTag} constructor called`);
  }

  connectedCallback() {
    webpackConsoleLog(`${wysiwygTag} connectedCallback called`);
    const inline = this.calculateInline();
    if (!inline) {
      this.createPreview();
    } else {
      this.createEditor();
    }
  }

  private calculateInline() {
    let inline = this.connector.field.settings?.Dialog === 'inline';
    if (this.mode != null) {
      inline = this.mode === 'inline' || this.getAttribute('mode') === 'inline';
    }

    return inline;
  }

  private createPreview() {
    const previewName = wysiwygPreviewTag;
    const previewEl = document.createElement(previewName) as FieldStringWysiwygPreview;
    previewEl.connector = this.connector;
    this.appendChild(previewEl);
  }

  private createEditor() {
    const editorName = wysiwygEditorTag;
    const editorEl = document.createElement(editorName) as FieldStringWysiwygEditor;
    editorEl.connector = this.connector;
    editorEl.mode = 'inline';
    editorEl.reconfigure = this.reconfigure;
    this.appendChild(editorEl);
  }

  disconnectedCallback() {
    webpackConsoleLog(`${wysiwygTag} disconnectedCallback called`);
  }
}

customElements.define(wysiwygTag, FieldStringWysiwyg);
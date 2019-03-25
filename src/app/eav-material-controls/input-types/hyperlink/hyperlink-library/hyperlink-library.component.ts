import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { AdamConfig, AdamModeConfig } from '../../../../shared/models/adam/adam-config';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hyperlink-library',
  templateUrl: './hyperlink-library.component.html',
  styleUrls: ['./hyperlink-library.component.scss']
})
@InputType({
  wrapper: ['app-dropzone-wrapper', 'app-eav-localization-wrapper', 'app-hyperlink-library-expandable-wrapper', 'app-adam-attach-wrapper'],
})
export class HyperlinkLibraryComponent implements Field, OnInit {
  @Input() config: FieldConfigSet;
  group: FormGroup;

  adamModeConfig: AdamModeConfig = {
    usePortalRoot: false
  };

  get folderDepth() {
    return this.config.field.settings.FolderDepth || '';
  }

  get metadataContentTypes() {
    return this.config.field.settings.MetadataContentTypes || '';
  }

  get allowAssetsInRoot() {
    return this.config.field.settings.AllowAssetsInRoot === false ? false : true;
  }

  constructor() { }

  ngOnInit() {
    this.attachAdam();
  }

  private attachAdam() {
    if (this.config.adam) {
      // callbacks - functions called from adam
      this.config.adam.updateCallback = (fileItem) => { };

      // binding for dropzone
      this.config.adam.afterUploadCallback = (fileItem) => { };

      // return value from form
      // this.config.currentFieldConfig.adam.getValueCallback = () =>
      // this.config.currentFieldConfig.adam.afterUploadCallback = (fileItem) => { };

      console.log('HyperLibrary setConfig : ', Object.assign(new AdamConfig(), {
        adamModeConfig: this.adamModeConfig,
        allowAssetsInRoot: this.allowAssetsInRoot,
        autoLoad: true,
        enableSelect: false,
        folderDepth: this.folderDepth,
        metadataContentTypes: this.metadataContentTypes
      }));
      // set adam configuration (initial config)
      this.config.adam.setConfig(Object.assign(new AdamConfig(), {
        adamModeConfig: this.adamModeConfig,
        allowAssetsInRoot: this.allowAssetsInRoot,
        autoLoad: true,
        enableSelect: false,
        folderDepth: this.folderDepth,
        metadataContentTypes: this.metadataContentTypes
      }));

      // this.config.currentFieldConfig.adam.setConfig(
      //   new AdamConfig(this.adamModeConfig,
      //     this.allowAssetsInRoot,
      //     true, // autoLoad
      //     false, // enableSelect
      //     '', // fileFilter
      //     this.folderDepth,
      //     this.metadataContentTypes,
      //     '', // subFolder
      //   )
      // );
    }
  }
}


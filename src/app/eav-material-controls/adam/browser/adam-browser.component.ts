import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

import { AdamService } from '../adam.service';
import { AdamItem } from '../../../shared/models/adam/adam-item';
import { FileTypeService } from '../../../shared/services/file-type.service';
import { EavService } from '../../../shared/services/eav.service';
import { EavConfiguration } from '../../../shared/models/eav-configuration';
import { FeatureService } from '../../../shared/services/feature.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'adam-browser',
  templateUrl: './adam-browser.component.html',
  styleUrls: ['./adam-browser.component.css']
})
export class AdamBrowserComponent implements OnInit {

  // TODO: temp need to change
  // eavConfig.metadataOfCmsObject
  @Input() metadataOfCmsObject: any;

  // Identity fields
  // @Input() contentTypeName: any;
  // @Input() entityGuid: any;
  // @Input() fieldName: any;

  // New Configuration
  @Input() url;

  // Configuration
  @Input() subFolder;
  @Input() folderDepth;
  @Input() metadataContentTypes;
  @Input() showImagesOnly;
  @Input() showFolders;
  @Input() allowAssetsInRoot;

  @Input() autoLoad;

  @Input() adamModeConfig = { usePortalRoot: false };
  // this is configuration need change:
  @Input() fileFilter;

  // basic functionality
  @Input() disabled = false;
  @Input() enableSelect;

  @Input() show = false;

  @Output() openUpload: EventEmitter<any> = new EventEmitter<any>();

  // callback is set in attachAdam
  updateCallback;
  afterUploadCallback;
  getValueCallback;
  oldConfig;
  clipboardPasteImageFunctionalityDisabled = true;

  get folders() {
    return this.svc ? this.svc.folders : [];
  }

  items: AdamItem[];
  svc;

  items$: Observable<AdamItem[]>; // = this.svc.liveList();
  allowedFileTypes = [];

  private eavConfig: EavConfiguration;

  constructor(private adamService: AdamService,
    private fileTypeService: FileTypeService,
    private eavService: EavService,
    private featureService: FeatureService) {

    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {

    this.initConfig();
    // console.log('adam ngOnInit config:', this.config);
    this.svc = this.adamService.createSvc(this.subFolder, this.adamModeConfig, this.url);

    console.log('adam ngOnInit url:', this.url);
    this.setAllowedFileTypes();

    // TODO: when to load folders??? Before was toggle!!!
    this.items$ = this.svc.liveListCache$;
    this.loadFileList();
    // TODO: when set folders??? Before was toggle!!!
    // this.folders = this.svc.folders;

    if (this.autoLoad) {
      console.log('autoload:');
      this.toggle(null);
    }
  }

  initConfig() {
    this.subFolder = this.subFolder || '';
    this.showImagesOnly = this.showImagesOnly || false;
    this.folderDepth = (typeof this.folderDepth !== 'undefined' && this.folderDepth !== null) ? this.folderDepth : 2;
    this.showFolders = !!this.folderDepth;
    this.allowAssetsInRoot = this.allowAssetsInRoot || true; // if true, the initial folder can have files, otherwise only subfolders
    this.metadataContentTypes = this.metadataContentTypes || '';

    // TODO:
    // appRoot = read app root
    this.enableSelect = (this.enableSelect === false) ? false : true; // must do it like this, $scope.enableSelect || true will not work

    // if feature clipboardPasteImageFunctionality enabled
    this.featureService.enabled('f6b8d6da-4744-453b-9543-0de499aa2352', this.eavConfig.appId, this.url)
      .subscribe(enabled =>
        this.clipboardPasteImageFunctionalityDisabled = (enabled === false)
      );
  }

  addFolder() {
    if (this.disabled) {
      return;
    }
    const folderName = window.prompt('Please enter a folder name'); // todo i18n
    if (folderName) {
      this.svc.addFolder(folderName).subscribe();
    }
  }

  allowCreateFolder(): boolean {
    return this.svc.folders.length < this.folderDepth;
  }

  del(item) {
    if (this.disabled) {
      return;
    }
    const ok = window.confirm('Are you sure you want to delete this item?'); // todo i18n
    if (ok) {
      this.svc.deleteItem(item).subscribe();
    }
  }

  editMetadata(item) {
    const items = [
      this.itemDefinition(item, this.getMetadataType(item))
    ];
    // TODO:
    // eavAdminDialogs.openEditItems(items, vm.refresh);
  }

  goUp = () => {
    this.subFolder = this.svc.goUp();
  }

  getMetadataType = function (item) {
    let found;

    // check if it's a folder and if this has a special registration
    if (item.Type === 'folder') {
      found = this.metadataContentTypes.match(/^(folder)(:)([^\n]*)/im);
      if (found) {
        return found[3];
      } else {
        return null;
      }
    }

    // check if the extension has a special registration
    // -- not implemented yet

    // check if the type "image" or "document" has a special registration
    // -- not implemneted yet

    // nothing found so far, go for the default with nothing as the prefix
    found = this.metadataContentTypes.match(/^([^:\n]*)(\n|$)/im);
    if (found) {
      return found[1];
    }

    // this is if we don't find anything
    return null;
  };

  //#region Folder Navigation
  goIntoFolder(folder) {
    const subFolder = this.svc.goIntoFolder(folder);
    // this.refresh();
    this.subFolder = subFolder;
  }

  icon(item: AdamItem) {
    return this.fileTypeService.getIconClass(item.Name);
  }

  // load svc...
  // vm.svc = adamSvc(vm.contentTypeName, vm.entityGuid, vm.fieldName, vm.subFolder, $scope.adamModeConfig);

  openUploadClick = (event) => this.openUpload.emit();

  rename(item) {
    const newName = window.prompt('Rename the file / folder to: ', item.Name);
    if (newName) {
      this.svc.rename(item, newName).subscribe();
    }
  }

  refresh = () => this.svc.liveListReload();

  select(fileItem) {
    if (this.disabled || !this.enableSelect) {
      return;
    }
    this.updateCallback(fileItem);
  }

  toggle(newConfig) {
    // Reload configuration
    this.initConfig();
    let configChanged = false;

    if (newConfig) {
      // Detect changes in config, allows correct toggle behaviour
      if (JSON.stringify(newConfig) !== this.oldConfig) {
        configChanged = true;
      }
      this.oldConfig = JSON.stringify(newConfig);

      this.showImagesOnly = newConfig.showImagesOnly;
      this.adamModeConfig.usePortalRoot = !!(newConfig.usePortalRoot);
    }

    this.show = configChanged || !this.show;

    if (!this.show) {
      this.adamModeConfig.usePortalRoot = false;
    }

    // Override configuration in portal mode
    if (this.adamModeConfig.usePortalRoot) {
      this.showFolders = true;
      this.folderDepth = 99;
    }

    if (this.show) {

      console.log('TOGGLE this.showImagesOnly', this.showImagesOnly);
      this.refresh();
      console.log('TOGGLE this.items', this.items);
    }
  }

  private itemDefinition = function (item, metadataType) {
    const title = 'EditFormTitle.Metadata'; // todo: i18n
    return item.MetadataId !== 0
      ? { EntityId: item.MetadataId, Title: title } // if defined, return the entity-number to edit
      : {
        ContentTypeName: metadataType, // otherwise the content type for new-assegnment
        Metadata: {
          Key: (item.Type === 'folder' ? 'folder' : 'file') + ':' + item.Id,
          KeyType: 'string',
          TargetType: this.metadataOfCmsObject
        },
        Title: title,
        Prefill: { EntityTitle: item.Name } // possibly prefill the entity title
      };

  };

  private setAllowedFileTypes() {
    if (this.fileFilter) {
      this.allowedFileTypes = this.fileFilter.split(',').map(function (i) {
        return i.replace('*', '').trim();
      });
    }
  }

  private loadFileList = () => this.svc.liveListLoad();
}


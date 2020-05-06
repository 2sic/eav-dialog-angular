import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AdamService } from '../adam.service';
import { AdamItem } from '../../../shared/models/adam/adam-item';
import { FileTypeService } from '../../../shared/services/file-type.service';
import { FeatureService } from '../../../shared/store/ngrx-data/feature.service';
import { AdamConfig } from '../../../shared/models/adam/adam-config';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { eavConstants } from '../../../../ng-dialogs/src/app/shared/constants/eav-constants';
import { UrlHelper } from '../../../shared/helpers/url-helper';
import { FeaturesGuidsConstants } from '../../../../shared/features-guids.constants';
import { EditForm } from '../../../../ng-dialogs/src/app/app-administration/shared/models/edit-form.model';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'adam-browser',
  templateUrl: './adam-browser.component.html',
  styleUrls: ['./adam-browser.component.scss'],
  animations: [
    trigger('adamShowAnimate', [
      state('closed', style({
        height: '0',
        overflow: 'hidden'
      })),
      state('open', style({
        height: '*',
        overflow: 'hidden'
      })),
      transition('closed => open', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ])
    ])
  ]
})
export class AdamBrowserComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;

  // New Configuration
  @Input() url: string;

  // Basic functionality
  @Input() disabled = false;
  @Input() show = false;

  @Output() openUpload: EventEmitter<any> = new EventEmitter<any>();

  // Configuration
  adamModeConfig = { usePortalRoot: false };
  allowAssetsInRoot: boolean;
  autoLoad = false;
  enableSelect = true;
  fileFilter = '';
  folderDepth = 0;
  metadataContentTypes: string;
  showImagesOnly: boolean;
  subFolder = '';
  showFolders: boolean;

  // callback is set in attachAdam
  updateCallback: (value: any) => void;
  afterUploadCallback: (value: any) => void;
  getValueCallback: () => any;

  allowedFileTypes: string[] = [];
  clipboardPasteImageFunctionalityDisabled = true;
  items: AdamItem[];
  items$: Observable<AdamItem[]>; // = this.svc.liveList();
  oldConfig: any;
  svc: any;

  private subscription = new Subscription();
  private hasChild: boolean;
  get folders() { return this.svc ? this.svc.folders : []; }

  constructor(
    private adamService: AdamService,
    private fileTypeService: FileTypeService,
    private featureService: FeatureService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild;
  }

  ngOnInit() {
    this.refreshOnChildClosed();
    this.subFolder = this.config.field.settings.Paths || '';
    // fixed leading "/"
    if (this.subFolder.startsWith('/') || this.subFolder.startsWith('\\')) {
      this.subFolder = this.subFolder.slice(1);
    }
    const currDzConfig = this.config.dropzoneConfig$.value;
    this.config.dropzoneConfig$.next({
      ...currDzConfig,
      url: UrlHelper.replaceUrlParam(currDzConfig.url as string, 'subfolder', this.subFolder),
    });
    this.initConfig();
    this.svc = this.adamService.createSvc(this.subFolder, this.adamModeConfig, this.url);

    angularConsoleLog('adam ngOnInit url:', this.url);
    this.setAllowedFileTypes();

    // TODO: when to load folders??? Before was toggle!!!
    this.items$ = this.svc.liveListCache$;
    // loading items on adam load might not be required because they are loaded when field is toggled, file uploaded...
    // this.loadFileList();
    // TODO: when set folders??? Before was toggle!!!
    // this.folders = this.svc.folders;

    if (this.autoLoad) { this.toggle(null); }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  initConfig() {
    this.subFolder = this.subFolder || '';
    const currDzConfig = this.config.dropzoneConfig$.value;
    this.config.dropzoneConfig$.next({
      ...currDzConfig,
      url: UrlHelper.replaceUrlParam(currDzConfig.url as string, 'subfolder', this.subFolder),
    });
    this.showImagesOnly = this.showImagesOnly || false; // spm 2019.02.28. test this line against old angular
    this.folderDepth = (typeof this.folderDepth !== 'undefined' && this.folderDepth !== null) ? this.folderDepth : 2;
    this.showFolders = !!this.folderDepth;
    // if true, the initial folder can have files, otherwise only subfolders
    this.allowAssetsInRoot = this.allowAssetsInRoot === false ? false : true; // spm 2019.02.28. test this line against old angular
    this.metadataContentTypes = this.metadataContentTypes || '';

    this.enableSelect = (this.enableSelect === false) ? false : true; // must do it like this, $scope.enableSelect || true will not work

    // if feature clipboardPasteImageFunctionality enabled
    const featureEnabled = this.featureService.isFeatureEnabled(FeaturesGuidsConstants.PasteImageFromClipboard);
    this.clipboardPasteImageFunctionalityDisabled = (featureEnabled === false);
  }

  addFolder() {
    if (this.disabled) { return; }

    const folderName = window.prompt('Please enter a folder name'); // todo i18n
    if (folderName) { this.svc.addFolder(folderName).subscribe(); }
  }

  allowEdit(): boolean {
    return this.svc.getAllowEdit();
  }

  allowCreateFolder(): boolean {
    return (this.allowEdit()) && (this.svc.folders.length < this.folderDepth);
  }

  del(item: AdamItem) {
    if (this.disabled) { return; }

    const ok = window.confirm('Are you sure you want to delete this item?'); // todo i18n
    if (ok) { this.svc.deleteItem(item).subscribe(); }
  }

  addItemMetadata(adamItem: AdamItem) {
    const form: EditForm = {
      items: [{
        ContentTypeName: this.getMetadataType(adamItem),
        For: {
          Target: eavConstants.metadata.cmsObject.target,
          String: (adamItem.Type === 'folder' ? 'folder' : 'file') + ':' + adamItem.Id,
        }
      }],
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
  }

  editItemMetadata(metadataId: string) {
    const form: EditForm = {
      items: [{ EntityId: metadataId.toString() }],
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
  }

  goUp = () => {
    this.subFolder = this.svc.goUp();
    const currDzConfig = this.config.dropzoneConfig$.value;
    this.config.dropzoneConfig$.next({
      ...currDzConfig,
      url: UrlHelper.replaceUrlParam(currDzConfig.url as string, 'subfolder', this.subFolder)
    });
  }

  getMetadataType(item: AdamItem) {
    let found: string[];

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
    if (found) { return found[1]; }

    // this is if we don't find anything
    return null;
  }

  //#region Folder Navigation
  goIntoFolder(folder: AdamItem) {
    const subFolder = this.svc.goIntoFolder(folder);
    // this.refresh();
    this.subFolder = subFolder;
    const currDzConfig = this.config.dropzoneConfig$.value;
    this.config.dropzoneConfig$.next({
      ...currDzConfig,
      url: UrlHelper.replaceUrlParam(currDzConfig.url as string, 'subfolder', this.subFolder)
    });
  }

  isKnownType(item: AdamItem) {
    return this.fileTypeService.isKnownType(item.Name);
  }

  icon(item: AdamItem) {
    return this.fileTypeService.getIconClass(item.Name);
  }

  openUploadClick = (event: Event) => this.openUpload.emit();

  rename(item: AdamItem) {
    if (this.disabled) { return; }

    const newName = window.prompt('Rename the file / folder to: ', item.Name);
    if (newName) { this.svc.rename(item, newName).subscribe(); }
  }

  refresh = () => this.svc.liveListReload();

  select(fileItem: AdamItem) {
    if (this.disabled || !this.enableSelect) { return; }
    this.updateCallback(fileItem);
  }

  toggle(newConfig: { [key: string]: any }) {
    // Reload configuration
    this.initConfig();
    let configChanged = false;

    if (newConfig) {
      // Detect changes in config, allows correct toggle behaviour
      if (JSON.stringify(newConfig) !== this.oldConfig) { configChanged = true; }
      this.oldConfig = JSON.stringify(newConfig);

      this.showImagesOnly = newConfig.showImagesOnly;
      this.adamModeConfig.usePortalRoot = !!(newConfig.usePortalRoot);
      const currDzConfig = this.config.dropzoneConfig$.value;
      this.config.dropzoneConfig$.next({
        ...currDzConfig,
        url: UrlHelper.replaceUrlParam(currDzConfig.url as string, 'usePortalRoot', this.adamModeConfig.usePortalRoot.toString()),
      });
    }

    this.show = configChanged || !this.show;

    if (!this.show) {
      this.adamModeConfig.usePortalRoot = false;
      const currDzConfig = this.config.dropzoneConfig$.value;
      this.config.dropzoneConfig$.next({
        ...currDzConfig,
        url: UrlHelper.replaceUrlParam(currDzConfig.url as string, 'usePortalRoot', this.adamModeConfig.usePortalRoot.toString()),
      });
    }

    // Override configuration in portal mode
    if (this.adamModeConfig.usePortalRoot) {
      this.showFolders = true;
      this.folderDepth = 99;
    }

    if (this.show) { this.refresh(); }
  }

  /** Set configuration (called from input type) */
  setConfig(adamConfig: AdamConfig) {
    this.allowAssetsInRoot = adamConfig.allowAssetsInRoot;
    this.autoLoad = adamConfig.autoLoad;
    this.enableSelect = adamConfig.enableSelect;
    this.fileFilter = adamConfig.fileFilter;
    this.folderDepth = adamConfig.folderDepth;
    this.metadataContentTypes = adamConfig.metadataContentTypes;
    this.showImagesOnly = adamConfig.showImagesOnly;
    this.subFolder = adamConfig.subFolder;

    const currDzConfig = this.config.dropzoneConfig$.value;
    this.config.dropzoneConfig$.next({
      ...currDzConfig,
      url: UrlHelper.replaceUrlParam(currDzConfig.url as string, 'subfolder', this.subFolder),
    });

    // Reload configuration
    this.initConfig();
    this.show = this.autoLoad;
    if (this.show) { this.refresh(); }
  }

  private setAllowedFileTypes() {
    if (this.fileFilter) {
      this.allowedFileTypes = this.fileFilter.split(',').map(i => i.replace('*', '').trim());
    }
  }

  private loadFileList = () => this.svc.liveListLoad();

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild;
        if (!this.hasChild && hadChild) {
          const expandedFieldId = this.route.snapshot.paramMap.get('expandedFieldId');
          if (expandedFieldId !== this.config.field.index.toString()) { return; }
          this.refresh();
        }
      })
    );
  }

}
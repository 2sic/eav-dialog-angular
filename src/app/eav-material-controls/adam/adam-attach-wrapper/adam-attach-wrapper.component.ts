import { Component, OnInit, ViewContainerRef, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { AdamBrowserComponent } from '../browser/adam-browser.component';
import { EavConfiguration } from '../../../shared/models/eav-configuration';
import { EavService } from '../../../shared/services/eav.service';
import { UrlHelper } from '../../../shared/helpers/url-helper';
import { UrlConstants } from '../../../shared/constants/url-constants';
import { InputTypesConstants } from '../../../shared/constants';

@Component({
  selector: 'app-adam-attach-wrapper',
  templateUrl: './adam-attach-wrapper.component.html',
  styleUrls: ['./adam-attach-wrapper.component.scss']
})
export class AdamAttachWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('invisibleClickable', { static: false }) invisibleClickableReference: ElementRef;
  @ViewChild(AdamBrowserComponent, { static: true }) adamRef: AdamBrowserComponent;

  @Input() config: FieldConfigSet;
  group: FormGroup;
  fullScreenAdamBrowser = false;
  url: string;

  private eavConfig: EavConfiguration;

  get disabled() {
    return this.group.controls[this.config.field.name].disabled;
  }

  constructor(private eavService: EavService) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.fullScreenAdamBrowser = this.config.field.inputType === InputTypesConstants.hyperlinkLibrary;
    this.config.adam = this.adamRef;
    // const serviceRoot = 'http://2sxc-dnn742.dnndev.me/en-us/desktopmodules/2sxc/api/';
    const serviceRoot = this.eavConfig.portalroot + UrlConstants.apiRoot;
    // const url = UrlHelper.resolveServiceUrl('app-content/' + contentType + '/' + entityGuid + '/' + field, serviceRoot);
    const contentType = this.config.entity.header.contentTypeName;
    // const contentType = '106ba6ed-f807-475a-b004-cd77e6b317bd';
    const entityGuid = this.config.entity.header.guid;
    // const entityGuid = '386ec145-d884-4fea-935b-a4d8d0c68d8d';
    const field = this.config.field.name;
    // const field = 'HyperLinkStaticName';
    this.url = UrlHelper.resolveServiceUrl(`app-content/${contentType}/${entityGuid}/${field}`, serviceRoot);
  }

  // /**
  //  * triger click on clickable element for load open
  //  */
  openUpload() {
    console.log('openUpload click');
    this.invisibleClickableReference.nativeElement.click();
  }
}

import { Component, OnInit, ViewContainerRef, ViewChild, Input, AfterViewInit, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { FileTypeService } from '../../../shared/services/file-type.service';
import { DnnBridgeService } from '../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../shared/services/eav.service';
import { AdamItem } from '../../../shared/models/adam/adam-item';
import { DropzoneDraggingHelper } from '../../../shared/services/dropzone-dragging.helper';

@Component({
  selector: 'app-hyperlink-library-expandable-wrapper',
  templateUrl: './hyperlink-library-expandable-wrapper.component.html',
  styleUrls: ['./hyperlink-library-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation]
})
export class HyperlinkLibraryExpandableWrapperComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop', { static: false }) backdropRef: ElementRef;
  @ViewChild('dialog', { static: false }) dialogRef: ElementRef;
  @Input() config: FieldConfigSet;
  group: FormGroup;

  dialogIsOpen = false;
  private subscriptions: Subscription[] = [];
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  get value() { return this.group.controls[this.config.field.name].value; }
  get id() { return `${this.config.entity.entityId}${this.config.field.index}`; }
  get inputInvalid() { return this.group.controls[this.config.field.name].invalid; }
  get disabled() { return this.group.controls[this.config.field.name].disabled; }

  constructor(
    private fileTypeService: FileTypeService,
    private zone: NgZone,
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.config.field.expanded.subscribe(expanded => { this.dialogIsOpen = expanded; }),
    );
  }

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  isKnownType(item: AdamItem) {
    return this.fileTypeService.isKnownType(item.Name);
  }

  icon(item: AdamItem) {
    return this.fileTypeService.getIconClass(item.Name);
  }

  expandDialog() {
    console.log('HyperlinkLibraryExpandableWrapperComponent expandDialog');
    this.config.field.expanded.next(true);
  }
  closeDialog() {
    console.log('HyperlinkLibraryExpandableWrapperComponent closeDialog');
    this.config.field.expanded.next(false);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.dropzoneDraggingHelper.detach();
  }
}

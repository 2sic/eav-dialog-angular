import { Component, ViewChild, ViewContainerRef, Input, OnInit, OnDestroy } from '@angular/core';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavHeader } from '../../../shared/models/eav';
import { ItemService } from '../../../shared/services/item.service';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { EavGroupAssignment } from '../../../shared/models/eav/eav-group-assignment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-collapsible-wrapper',
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.css']
})
export class CollapsibleWrapperComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfig;
  // slotIsUsed = false;
  slotIsEmptyChecked = false;
  header: EavHeader;
  private subscriptions: Subscription[] = [];

  get notes() {
    return this.config.settings ? (this.config.settings.Notes || '') : '';
  }

  get slotCanBeEmpty() {
    return this.config.header.group ? this.config.header.group.slotCanBeEmpty || false : false;
  }

  constructor(private itemService: ItemService) { }

  ngOnInit() {
    if (this.slotCanBeEmpty) {

      this.itemService.selectHeaderByEntityId(this.config.entityId, this.config.entityGuid).subscribe(header => {
        if (header.group) {
          this.slotIsEmptyChecked = header.group.slotIsEmpty;
        }

        this.header = { ...header };
      });
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  /// toggle / change if a section (slot) is in use or not (like an unused presentation)
  toggleSlotIsEmpty = function () {
    if (this.header.group) {
      const updateHeader = { ...this.header, group: { ...this.header.group, slotIsEmpty: !this.slotIsEmptyChecked } };
      this.itemService.updateItemHeader(this.config.entityId, this.config.entityGuid, updateHeader);
    } else { // if header group undefined create empty group object
      this.itemService.updateItemHeader(this.config.entityId, this.config.entityGuid,
        { ...this.header, group: new EavGroupAssignment() });
    }
  };
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';

import { keyItems } from '../shared/constants/sessions-keys';
import { ContentGroupService } from './services/content-group.service';
import { ReplaceOption } from './models/replace-option.model';
import { ReplaceItem, UrlReplaceItem } from './models/replace-item.model';
import { EditForm } from '../app-administration/shared/models/edit-form.model';

@Component({
  selector: 'app-replace-content',
  templateUrl: './replace-content.component.html',
  styleUrls: ['./replace-content.component.scss']
})
export class ReplaceContentComponent implements OnInit, OnDestroy {
  options: ReplaceOption[];
  item: ReplaceItem;
  contentTypeName: string;

  private subscription = new Subscription();
  private hasChild: boolean;

  constructor(
    private dialogRef: MatDialogRef<ReplaceContentComponent>,
    private contentGroupService: ContentGroupService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild;
    const itemsString = sessionStorage.getItem(keyItems);
    const items: UrlReplaceItem[] = JSON.parse(itemsString);
    this.item = {
      id: null,
      guid: items[0].Group.Guid,
      part: items[0].Group.Part,
      index: items[0].Group.Index,
    };
  }

  ngOnInit() {
    this.getItems();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  save() {
    this.contentGroupService.saveItem(this.item).subscribe(() => {
      this.closeDialog();
    });
  }

  copySelected() {
    const form: EditForm = {
      items: [{ ContentTypeName: this.contentTypeName, DuplicateEntity: this.item.id }],
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private getItems() {
    this.contentGroupService.getItems(this.item).subscribe(res => {
      const optionKeys = Object.keys(res.Items);
      this.options = [];
      for (const key of optionKeys) {
        const nKey = parseInt(key, 10);
        const itemName = res.Items[nKey];
        this.options.push({ label: `${itemName} (${key})`, value: nKey });
      }
      this.item.id = res.SelectedId;
      this.contentTypeName = res.ContentTypeName;
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild;
        if (!this.hasChild && hadChild) {
          // spm TODO: select new item
          this.getItems();
        }
      })
    );
  }

}

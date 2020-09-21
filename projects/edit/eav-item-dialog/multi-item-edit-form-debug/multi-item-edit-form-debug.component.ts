import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Item } from '../../shared/models/eav';
import { ItemService } from '../../shared/store/ngrx-data/item.service';

declare const sxcVersion: string;

@Component({
  selector: 'app-multi-item-edit-form-debug',
  templateUrl: './multi-item-edit-form-debug.component.html',
  styleUrls: ['./multi-item-edit-form-debug.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiItemEditFormDebugComponent implements OnInit, OnDestroy {
  @Output() debugInfoOpened = new EventEmitter<boolean>();

  sxcVer = sxcVersion.substring(0, sxcVersion.lastIndexOf('\.'));
  showDebugInfo$ = new BehaviorSubject(false);
  items$: Observable<Item[]>;

  constructor(private itemService: ItemService) { }

  ngOnInit() {
    this.items$ = this.itemService.selectAllItems();
  }

  ngOnDestroy() {
    this.showDebugInfo$.complete();
  }

  toggleDebugInfo() {
    this.showDebugInfo$.next(!this.showDebugInfo$.value);
    this.debugInfoOpened.emit(this.showDebugInfo$.value);
  }
}

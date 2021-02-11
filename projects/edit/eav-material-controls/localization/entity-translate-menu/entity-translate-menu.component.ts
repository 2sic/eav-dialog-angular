import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EavService } from '../../..';
import { TranslationLink, TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { EntityTranslateMenuTemplateVars } from './entity-translate-menu.models';

@Component({
  selector: 'app-entity-translate-menu',
  templateUrl: './entity-translate-menu.component.html',
  styleUrls: ['./entity-translate-menu.component.scss'],
})
export class EntityTranslateMenuComponent implements OnInit {
  @Input() private entityGuid: string;

  translationLinkConstants = TranslationLinkConstants;
  templateVars$: Observable<EntityTranslateMenuTemplateVars>;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private eavService: EavService,
  ) { }

  ngOnInit() {
    const slotIsEmpty$ = this.itemService.selectItemHeader(this.entityGuid).pipe(
      map(header => !header.Group?.SlotCanBeEmpty ? false : header.Group.SlotIsEmpty),
    );
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    this.templateVars$ = combineLatest([slotIsEmpty$, currentLanguage$, defaultLanguage$]).pipe(
      map(([slotIsEmpty, currentLanguage, defaultLanguage]) => {
        const templateVars: EntityTranslateMenuTemplateVars = {
          slotIsEmpty,
          currentLanguage,
          defaultLanguage,
        };
        return templateVars;
      }),
    );
  }

  translateMany(translationLink: TranslationLink) {
    this.languageInstanceService.translateMany({
      formId: this.eavService.eavConfig.formId,
      entityGuid: this.entityGuid,
      translationLink,
    });
  }
}

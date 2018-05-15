import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import * as languageActions from '../../shared/store/actions/language.actions';
import * as fromStore from '../store';
import { Language } from '../models/eav';

@Injectable()
export class LanguageService {

  constructor(private httpClient: HttpClient, private store: Store<fromStore.EavState>) {
    // this.items$ = store.select(fromStore.getItems);
  }

  /**
   * Load all languages
   */
  public loadLanguages(languages: Language[], currentLanguage: string, defaultLanguage: string, uiLanguage: string) {
    this.store.dispatch(new languageActions.LoadLanguagesAction(languages, currentLanguage, defaultLanguage, uiLanguage));
  }

  public selectAllLanguages(): Observable<Language[]> {
    return this.store.select(fromStore.getLanguages);
  }

  public selectLanguage(name: string) {
    return this.store.select(fromStore.getLanguages)
      .map(data => data.find(obj => obj.name === name));
  }

  public getCurrentLanguage() {
    return this.store.select(fromStore.getCurrentLanguage);
  }

  public getDefaultLanguage() {
    return this.store.select(fromStore.getDefaultLanguage);
  }

  public updateCurrentLanguage(currentLanguage: string) {
    this.store.dispatch(new languageActions.UpdateCurrentLanguageAction(currentLanguage));
  }

  public updateDefaultLanguage(defaultLanguage: string) {
    this.store.dispatch(new languageActions.UpdateDefaultLanguageAction(defaultLanguage));
  }
}
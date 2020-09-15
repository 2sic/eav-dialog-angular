import { Component, Input, ViewChild, AfterViewInit, ElementRef, OnDestroy, OnInit, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Language } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/store/ngrx-data/language.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { MouseScrollHelper } from './eav-language-switcher-services/mouse-scroll-helper';
import { CenterSelectedHelper } from './eav-language-switcher-services/center-selected-helper';
import { ShowShadowsHelper } from './eav-language-switcher-services/show-shadows-helper';
import { LanguageButton, calculateLanguageButtons } from './eav-language-switcher-services/eav-language-switcher.helpers';

@Component({
  selector: 'app-eav-language-switcher',
  templateUrl: './eav-language-switcher.component.html',
  styleUrls: ['./eav-language-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EavLanguageSwitcherComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollable') private headerRef: ElementRef;
  @ViewChild('leftShadow') private leftShadowRef: ElementRef;
  @ViewChild('rightShadow') private rightShadowRef: ElementRef;
  @Input() private formId: number;
  @Input() disabled: boolean;

  languageButtons$: Observable<LanguageButton[]>;
  currentLanguage$: Observable<string>;

  private centerSelectedService: CenterSelectedHelper;
  private mouseScrollHelper: MouseScrollHelper;
  private showShadowsService: ShowShadowsHelper;

  constructor(
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    this.languageButtons$ = this.languageService.entities$.pipe(map(langs => calculateLanguageButtons(langs)));
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.formId);
  }

  ngAfterViewInit() {
    this.showShadowsService = new ShowShadowsHelper(this.ngZone, this.headerRef.nativeElement,
      this.leftShadowRef.nativeElement, this.rightShadowRef.nativeElement);
    this.mouseScrollHelper = new MouseScrollHelper(this.ngZone, this.headerRef.nativeElement, this.areButtonsDisabled.bind(this));
    this.centerSelectedService = new CenterSelectedHelper(this.ngZone, this.headerRef.nativeElement);
  }

  ngOnDestroy() {
    this.centerSelectedService.destroy();
    this.mouseScrollHelper.destroy();
    this.showShadowsService.destroy();
  }

  lngButtonMouseDown(event: MouseEvent) {
    this.centerSelectedService.lngButtonDown(event);
  }

  lngButtonClick(event: MouseEvent, language: Language) {
    if (this.disabled) { return; }
    this.centerSelectedService.lngButtonClick(event);

    if (!this.centerSelectedService.stopClickIfMouseMoved()) {
      this.languageInstanceService.updateCurrentLanguage(this.formId, language.key);
    }
  }

  private areButtonsDisabled() {
    return this.disabled;
  }
}

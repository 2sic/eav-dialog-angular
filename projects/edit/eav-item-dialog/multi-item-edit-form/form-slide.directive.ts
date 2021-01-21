import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, merge, Subscription } from 'rxjs';
import { delay, filter, map, pairwise, take } from 'rxjs/operators';
import { EavService } from '../..';
import { Language } from '../../shared/models';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';
import { LanguageService } from '../../shared/store/ngrx-data/language.service';

@Directive({ selector: '[appFormSlide]' })
export class FormSlideDirective implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private languageInstanceService: LanguageInstanceService,
    private languageService: LanguageService,
    private eavService: EavService,
  ) { }

  ngOnInit() {
    this.subscription = new Subscription();
    this.subscription.add(
      merge(
        this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId).pipe(
          pairwise(),
          map(([previousLang, currentLang]) => {
            let languages: Language[];
            this.languageService.entities$.pipe(take(1)).subscribe(langs => {
              languages = langs;
            });
            const previousLangIndex = languages.findIndex(lang => lang.key === previousLang);
            const currentLangIndex = languages.findIndex(lang => lang.key === currentLang);
            const slide = (previousLangIndex > currentLangIndex) ? 'previous' : 'next';
            return slide;
          }),
        ),
        fromEvent<AnimationEvent>(this.elementRef.nativeElement, 'animationend').pipe(
          filter(event => event.animationName === 'move-next' || event.animationName === 'move-previous'),
          map(() => ''),
          delay(0), // small delay because animationend fires a bit too early
        ),
      ).subscribe(slide => {
        if (slide === '') {
          this.elementRef.nativeElement.classList.remove('previous');
          this.elementRef.nativeElement.classList.remove('next');
        } else {
          this.elementRef.nativeElement.classList.add(slide);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
import { ChangeDetectionStrategy, Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContentImport, EvaluateContentResult, ImportContentResult } from '../../models/content-import.model';
import { AppDialogConfigService } from '../../services/app-dialog-config.service';
import { ContentImportService } from '../../services/content-import.service';
import { ContentImportDialogData } from './content-import-dialog.config';

@Component({
  selector: 'app-content-import',
  templateUrl: './content-import.component.html',
  styleUrls: ['./content-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentImportComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  formValues: ContentImport;
  private loading$ = new BehaviorSubject(false);
  private viewStates = {
    waiting: 0,
    default: 1,
    evaluated: 2,
    imported: 3,
  };
  private viewStateSelected$ = new BehaviorSubject<number>(this.viewStates.default);
  private evaluationResult$ = new BehaviorSubject<EvaluateContentResult>(null);
  private importResult$ = new BehaviorSubject<ImportContentResult>(null);
  templateVars$ = combineLatest([this.loading$, this.viewStateSelected$, this.evaluationResult$, this.importResult$]).pipe(
    map(([loading, viewStateSelected, evaluationResult, importResult]) =>
      ({ loading, viewStateSelected, evaluationResult, importResult })),
  );
  errors: { [key: string]: string } = {
    0: 'Unknown error occured.',
    1: 'Selected content-type does not exist.',
    2: 'Document is not a valid XML file.',
    3: 'Selected content-type does not match the content-type in the XML file.',
    4: 'The language is not supported.',
    5: 'The document does not specify all languages for all entities.',
    6: 'Language reference cannot be parsed, the language is not supported.',
    7: 'Language reference cannot be parsed, the read-write protection is not supported.',
    8: 'Value cannot be read, because of it has an invalid format.'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: ContentImportDialogData,
    private dialogRef: MatDialogRef<ContentImportComponent>,
    private route: ActivatedRoute,
    private contentImportService: ContentImportService,
    private appDialogConfigService: AppDialogConfigService,
  ) { }

  ngOnInit() {
    this.loading$.next(true);
    this.appDialogConfigService.getDialogSettings().subscribe(dialogSettings => {
      this.formValues = {
        defaultLanguage: dialogSettings.Context.Language.Primary,
        contentType: this.route.snapshot.paramMap.get('contentTypeStaticName'),
        file: this.dialogData.files != null ? this.dialogData.files[0] : null,
        resourcesReferences: 'Keep',
        clearEntities: 'None',
      };
      this.loading$.next(false);
    });
  }

  ngOnDestroy() {
    this.loading$.complete();
    this.viewStateSelected$.complete();
    this.evaluationResult$.complete();
    this.importResult$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  evaluateContent() {
    this.viewStateSelected$.next(this.viewStates.waiting);
    this.contentImportService.evaluateContent(this.formValues).subscribe(result => {
      this.evaluationResult$.next(result);
      this.viewStateSelected$.next(this.viewStates.evaluated);
    });
  }

  importContent() {
    this.viewStateSelected$.next(this.viewStates.waiting);
    this.contentImportService.importContent(this.formValues).subscribe(result => {
      this.importResult$.next(result);
      this.viewStateSelected$.next(this.viewStates.imported);
    });
  }

  back() {
    this.viewStateSelected$.next(this.viewStates.default);
    this.evaluationResult$.next(null);
  }

  fileChange(event: Event) {
    this.formValues.file = (event.target as HTMLInputElement).files[0];
  }

  filesDropped(files: FileList) {
    const importFile = files[0];
    this.formValues.file = importFile;
  }
}

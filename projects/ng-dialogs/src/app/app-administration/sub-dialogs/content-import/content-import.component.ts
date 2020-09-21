import { Component, HostBinding, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ContentImport, EvaluateContentResult, ImportContentResult } from '../../models/content-import.model';
import { AppDialogConfigService } from '../../services/app-dialog-config.service';
import { ContentImportService } from '../../services/content-import.service';

@Component({
  selector: 'app-content-import',
  templateUrl: './content-import.component.html',
  styleUrls: ['./content-import.component.scss']
})
export class ContentImportComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  formValues: ContentImport;
  viewStateSelected: number;
  evaluationResult: EvaluateContentResult;
  importResult: ImportContentResult;
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

  private viewStates = {
    waiting: 0,
    default: 1,
    evaluated: 2,
    imported: 3,
  };

  constructor(
    private dialogRef: MatDialogRef<ContentImportComponent>,
    private route: ActivatedRoute,
    private contentImportService: ContentImportService,
    private appDialogConfigService: AppDialogConfigService,
  ) {
    this.viewStateSelected = this.viewStates.default;
  }

  ngOnInit() {
    this.appDialogConfigService.getDialogSettings().subscribe(dialogSettings => {
      this.formValues = {
        defaultLanguage: dialogSettings.Context.Language.Primary,
        contentType: this.route.snapshot.paramMap.get('contentTypeStaticName'),
        file: null,
        resourcesReferences: 'Keep',
        clearEntities: 'None',
      };
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  async evaluateContent() {
    this.viewStateSelected = this.viewStates.waiting;
    (await this.contentImportService.evaluateContent(this.formValues)).subscribe(result => {
      this.evaluationResult = result;
      this.viewStateSelected = this.viewStates.evaluated;
    });
  }

  async importContent() {
    this.viewStateSelected = this.viewStates.waiting;
    (await this.contentImportService.importContent(this.formValues)).subscribe(result => {
      this.importResult = result;
      this.viewStateSelected = this.viewStates.imported;
    });
  }

  back() {
    this.viewStateSelected = this.viewStates.default;
    this.evaluationResult = undefined;
  }

  fileChange(event: Event) {
    this.formValues.file = (event.target as HTMLInputElement).files[0];
  }
}

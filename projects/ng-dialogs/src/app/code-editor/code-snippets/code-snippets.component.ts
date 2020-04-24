import { Component, OnInit, Input } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
declare const ace: any;

@Component({
  selector: 'app-code-snippets',
  templateUrl: './code-snippets.component.html',
  styleUrls: ['./code-snippets.component.scss']
})
export class CodeSnippetsComponent implements OnInit {
  @Input() snippets: any;
  @Input() editor: any;
  snippetSet = 'Content';
  setsKeys: string[];
  activeSnipps: any;
  openSnipps: string[] = [];

  constructor() { }

  ngOnInit() {
    this.activeSnipps = this.snippets[this.snippetSet];
    this.setsKeys = Object.keys(this.snippets);
  }

  onSetChange(event: MatSelectChange) {
    this.snippetSet = event.value;
    this.activeSnipps = this.snippets[this.snippetSet];
    this.openSnipps = [];
  }

  addSnippet(snippet: string) {
    const snippetManager = ace.acequire('ace/snippets').snippetManager;
    snippetManager.insertSnippet(this.editor, snippet);
    this.editor.focus();
  }

  toggleItem(item: any) {
    const index = this.openSnipps.indexOf(item);
    if (index === -1) {
      this.openSnipps.push(item);
    } else {
      this.openSnipps.splice(index, 1);
    }
  }
}

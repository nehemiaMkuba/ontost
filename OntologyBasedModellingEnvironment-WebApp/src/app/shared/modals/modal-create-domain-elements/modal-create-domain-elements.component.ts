import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {ModellerService} from "../../../core/services/modeller/modeller.service";
import {DomainElementModel} from "../../models/DomainElement.model";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FormControl,FormGroup} from '@angular/forms';
import {PaletteElementModel} from "../../models/PaletteElement.model";

@Component({
  selector: 'app-modal-create-domain-elements',
  templateUrl: './modal-create-domain-elements.component.html',
  styleUrls: ['./modal-create-domain-elements.component.css']
})
export class ModalCreateDomainElementsComponent implements OnInit {

  public domainElement: DomainElementModel;
  checked = false;
  disabled = false;
  @Output() newDomainElementAdded = new EventEmitter();
  public config: any;

  constructor(
    public dialogRef: MatDialogRef<ModalCreateDomainElementsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public mService: ModellerService) {
  }

  ngOnInit() {
    this.mService.queryDomainClasses();
    this.domainElement = new DomainElementModel();

    this.config = {
      displayKey: 'label',
      search: true,
      height: 'auto',
      placeholder: 'Select Parent Class',
      limitTo: 15,
      moreText: 'more',
      noResultsFound: 'No results found!',
      searchPlaceholder: 'Search'
    };
  }

  createDomainElementInOntology() {
    console.log(this.domainElement.isRoot);
    console.log(this.domainElement.parentElement);
    console.log(this.domainElement.label);
    this.domainElement.id = (this.domainElement.label).replace(new RegExp(' ', 'g'), '_');
    if (this.domainElement.isRoot !== true) {
      this.domainElement.isRoot = false;
      this.domainElement.parentElement = (this.domainElement.parentElement).replace('http://fhnw.ch/modelingEnvironment/DomainOntology#', '');
    }
    console.log(JSON.stringify(this.domainElement));

    this.mService.createDomainElementInOntology(JSON.stringify(this.domainElement));
    this.newDomainElementAdded.emit(this.domainElement);
    this.dialogRef.close('Cancel');
  }

  onCloseCancel() {
    this.dialogRef.close('Cancel');
  }

  selectionChanged($event: any) {
    console.log('Selection changed');
    this.domainElement.parentElement = $event.value.id;
  }
}

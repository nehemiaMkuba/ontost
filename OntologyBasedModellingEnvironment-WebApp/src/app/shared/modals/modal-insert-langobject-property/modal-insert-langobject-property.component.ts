import { Component, OnInit, Output, EventEmitter, Inject} from '@angular/core';
import {ObjectPropertyModel} from '../../models/ObjectProperty.model';
import {ModellerService} from "../../../core/services/modeller/modeller.service";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-modal-insert-langobject-property',
  templateUrl: './modal-insert-langobject-property.component.html',
  styleUrls: ['./modal-insert-langobject-property.component.css']
})
export class ModalInsertLangobjectPropertyComponent implements OnInit {

  @Output() newLangRelationAdded = new EventEmitter();
  public objectProperty: ObjectPropertyModel;
  step = 0;
  public config: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public mService: ModellerService,
              public dialogRef: MatDialogRef<ModalInsertLangobjectPropertyComponent>,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.objectProperty = new ObjectPropertyModel();

    this.config = {
      displayKey: 'label',
      search: true,
      height: 'auto',
      placeholder: 'Select a Range',
      limitTo: 15,
      moreText: 'more',
      noResultsFound: 'No results found!',
      searchPlaceholder: 'Search'
    };
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  onCloseCancel() {
    this.dialogRef.close('Cancel');
  }

  selectionChanged(event) {
    console.log(event);
    if(!(event.value === null || event.value === undefined)) {
      this.objectProperty.range = event.value.id;
    }
  }

  insertNewProperty() {
    this.objectProperty.id = (this.objectProperty.label).replace(new RegExp(' ', 'g'), '_');
    this.objectProperty.domainName = this.data.paletteElement.representedLanguageClass;
    console.log(this.objectProperty.range);
    this.mService.createNewBridgingConnector(JSON.stringify(this.objectProperty)).subscribe(
      (response) => {
        this.newLangRelationAdded.emit(this.objectProperty);
        this.dialogRef.close('Cancel');
      }
    );
  }

}

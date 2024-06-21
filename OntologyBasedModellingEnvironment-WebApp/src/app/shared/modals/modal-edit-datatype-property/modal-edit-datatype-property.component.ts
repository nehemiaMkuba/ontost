import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {ModellerService} from "../../../core/services/modeller/modeller.service";
import {DatatypePropertyModel} from "../../models/DatatypeProperty.model";

@Component({
  selector: 'app-modal-edit-datatype-property',
  templateUrl: './modal-edit-datatype-property.component.html',
  styleUrls: ['./modal-edit-datatype-property.component.css']
})
export class ModalEditPropertiesComponent implements OnInit {
  step = 0;
  @Output() propertyEdited = new EventEmitter();
  public datatypeProperty: DatatypePropertyModel;
  public editedProperty: DatatypePropertyModel;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public mService: ModellerService,
              public dialogRef: MatDialogRef<ModalEditPropertiesComponent>) { }

  ngOnInit() {
    this.datatypeProperty = this.data.datatypeProperty;
    this.editedProperty = new DatatypePropertyModel();
    //this.editedProperty.domainName = this.datatypeProperty.domainName;
    this.editedProperty.label = this.datatypeProperty.label;
    this.editedProperty.range = this.datatypeProperty.range;
    this.editedProperty.isAvailableToModel = this.datatypeProperty.isAvailableToModel;
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

  editProperty() {
    this.mService.editDatatypeProperty(this.datatypeProperty, this.editedProperty).subscribe(
      (response) => {
        console.log(this.datatypeProperty);
        console.log(this.editedProperty);
        this.propertyEdited.emit(this.editedProperty);
      }
    );
  }

}

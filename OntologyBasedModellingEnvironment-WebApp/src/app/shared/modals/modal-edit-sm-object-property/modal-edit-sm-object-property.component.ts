import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {ModellerService} from "../../../core/services/modeller/modeller.service";
import {ObjectPropertyModel} from "../../models/ObjectProperty.model";

@Component({
  selector: 'app-modal-edit-sm-object-property',
  templateUrl: './modal-edit-sm-object-property.component.html',
  styleUrls: ['./modal-edit-sm-object-property.component.css']
})
export class ModalEditSMObjectPropertyComponent implements OnInit {

  step = 0;
  @Output() semanticMappingEdited = new EventEmitter();
  public objectProperty: ObjectPropertyModel;
  public editedProperty: ObjectPropertyModel;
  public config2: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public mService: ModellerService,
              public dialogRef: MatDialogRef<ModalEditSMObjectPropertyComponent>) { }

  ngOnInit() {
    this.objectProperty = this.data.objectProperty;
    this.editedProperty = new ObjectPropertyModel();
    //this.editedProperty.domainName = this.datatypeProperty.domainName;
    this.editedProperty.label = this.objectProperty.label;
    this.editedProperty.range = this.objectProperty.range;

    this.config2 = {
      displayKey: 'label',
      search: true,
      height: 'auto',
      placeholder: 'Select Range',
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

  selectionChanged($event: any) {
    console.log('Selection changed');
    this.editedProperty.range = $event.value.id;
  }

  editProperty() {
    this.mService.editObjectProperty(this.objectProperty, this.editedProperty).subscribe(
      (response) => {
        console.log(this.objectProperty);
        console.log(this.editedProperty);
        this.semanticMappingEdited.emit(this.editedProperty);
      }
    );
  }

}

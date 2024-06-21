import { Component, OnInit, Output, EventEmitter, Inject} from '@angular/core';
import {ObjectPropertyModel} from '../../models/ObjectProperty.model';
import {ModellerService} from "../../../core/services/modeller/modeller.service";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material/dialog";
import {ModalCreateDomainElementsComponent} from "../modal-create-domain-elements/modal-create-domain-elements.component";
import {PaletteElementModel} from "../../models/PaletteElement.model";

@Component({
  selector: 'app-modal-insert-object-property',
  templateUrl: './modal-insert-object-property.component.html',
  styleUrls: ['./modal-insert-object-property.component.css']
})


export class ModalInsertObjectPropertyComponent implements OnInit {

  @Output() newRelationAdded = new EventEmitter();
  public objectProperty: ObjectPropertyModel;
  step = 0;
  public config: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public mService: ModellerService,
              public dialogRef: MatDialogRef<ModalInsertObjectPropertyComponent>,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.objectProperty = new ObjectPropertyModel();

    this.config = {
      displayKey: 'label',
      search: true,
      height: '200px',
      placeholder: 'Select a Range',
      limitTo: 10000,
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

  openCreateDomainElementModalFromExtend(element: PaletteElementModel) {

    const dialogRef = this.dialog.open(ModalCreateDomainElementsComponent, {
      data: {paletteElement: element },
      height:'80%',
      width: '800px',
      disableClose: false,
    });

    const sub = dialogRef.componentInstance.newDomainElementAdded.subscribe(() => {
      this.mService.queryDomainClasses();
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }

  insertNewProperty() {
    this.objectProperty.id = (this.objectProperty.label).replace(new RegExp(' ', 'g'), '_');
    this.objectProperty.domainName = this.data.paletteElement.representedLanguageClass;
    console.log(this.objectProperty.range);
    this.mService.createNewSemanticMapping(JSON.stringify(this.objectProperty)).subscribe(
      (response) => {
        this.newRelationAdded.emit(this.objectProperty);
        this.dialogRef.close('Cancel');
      }
    );
  }

}

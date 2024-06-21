import {Component, Inject, Input, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import {PaletteElementModel} from "../../models/PaletteElement.model";
import {ModalInsertPropertyComponent} from "../modal-insert-datatype-property/modal-insert-datatype-property.component";
import {ModellerService} from "../../../core/services/modeller/modeller.service";

@Component({
  selector: 'app-modal-connector-element-properties',
  templateUrl: './modal-connector-element-properties.component.html',
  styleUrls: ['./modal-connector-element-properties.component.css']
})
export class ModalConnectorElementPropertiesComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<ModalConnectorElementPropertiesComponent>,
              public dialog: MatDialog,
              public mService: ModellerService) {
  }

  ngOnInit() {
  }

  /*openInsertNewProperty(element: PaletteElementModel) {
    const dialogRef = this.dialog.open(ModalInsertPropertyComponent, {
      data: {paletteElement: element },
      height:'80%',
      width: '800px',
      disableClose: false,
    });

    //const sub = dialogRef.componentInstance.newPropertyAdded.subscribe(() => {
     // this.mService.queryDomainClasses();
    //});

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }*/

  // Heroku difference
  onCloseCancel() {
    this.dialogRef.close('Cancel');
  }

  //Heroku difference
  try() {}
}

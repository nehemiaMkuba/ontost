import {Component, Inject} from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {ModellerService} from '../../../core/services/modeller/modeller.service';
import {ModelElementDetailAndModel} from '../../models/ModelElementDetailAndModel';

@Component({
  selector: 'modal-element-note',
  templateUrl: 'modal-element-note.component.html'
})
export class ModalElementNote {

  text: string;

  constructor(
    public dialogRef: MatDialogRef<ModalElementNote>,
    private modellerService: ModellerService,
    @Inject(MAT_DIALOG_DATA) public data: ModelElementDetailAndModel) {}


  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.modellerService.updateElement(this.data.elementDetail, this.data.modelId);
    this.dialogRef.close();
  }

  delete() {
    delete this.data.elementDetail.note;
    this.modellerService.updateElement(this.data.elementDetail, this.data.modelId);
    this.dialogRef.close();
  }
}

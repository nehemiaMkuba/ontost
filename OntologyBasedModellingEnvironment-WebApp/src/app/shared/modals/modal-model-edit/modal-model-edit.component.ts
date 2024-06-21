import {Component, Inject} from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Model} from '../../models/Model.model';
import {ModellerService} from '../../../core/services/modeller/modeller.service';

@Component({
  selector: 'modal-model-edit',
  templateUrl: 'modal-model-edit.component.html'
})
export class ModalModelEdit {
  constructor(
    public dialogRef: MatDialogRef<ModalModelEdit>,
    private modellerService: ModellerService,
    @Inject(MAT_DIALOG_DATA) public model: Model) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave() {
    this.modellerService.updateModel(this.model);
    this.dialogRef.close(this.model);
  }
}

import {Component, Inject} from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Model} from '../../models/Model.model';
import {ModellerService} from '../../../core/services/modeller/modeller.service';
import {ModelElementDetailAndModel} from '../../models/ModelElementDetailAndModel';
import {take} from 'rxjs/operators';

@Component({
  selector: 'modal-model-link',
  templateUrl: 'modal-model-link.html'
})
export class ModalModelLink {

  selectedModel: Model;
  models: Model[];

  constructor(
    public dialogRef: MatDialogRef<ModalModelLink>,
    private modellerService: ModellerService,
    @Inject(MAT_DIALOG_DATA) public data: ModelElementDetailAndModel) {}

  ngOnInit(): void {
    this.modellerService.getModels().pipe(take(1)).subscribe(value => {
      this.models = value;
      if (this.data.elementDetail.shapeRepresentsModel != undefined) {
        this.selectedModel = this.models.find(value1 => value1.id == this.data.elementDetail.shapeRepresentsModel);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close({
      action: 'Save',
      selectedModelId: this.selectedModel.id
    });
  }

  delete() {
    this.dialogRef.close({
      action: 'Delete'
    });
  }
}

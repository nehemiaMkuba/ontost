import {Component, Inject, OnInit} from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {ModellerService} from '../../../core/services/modeller/modeller.service';
import {ModelElementDetailAndModel} from '../../models/ModelElementDetailAndModel';
import {InstantiationTargetType} from '../../models/InstantiationTargetType.model';
import * as _ from 'lodash-es';

@Component({
  selector: 'app-modal-instantiation-type',
  templateUrl: 'modal-instantiation-type.component.html'
})
export class ModalInstantiationTypeComponent implements OnInit {

  selectedModel: InstantiationTargetType;
  models: InstantiationTargetType[];

  constructor(
    public dialogRef: MatDialogRef<ModalInstantiationTypeComponent>,
    private modellerService: ModellerService,
    @Inject(MAT_DIALOG_DATA) public data: ModelElementDetailAndModel) {}

  ngOnInit(): void {
    this.models = this.getInstantiationTypes();
    this.selectedModel = this.models.find(m => m === this.data.elementDetail.abstractElementAttributes.instantiationType);
  }

  getInstantiationTypes(): InstantiationTargetType[] {
    return _.values(InstantiationTargetType);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close({
      action: 'Save',
      selectedModel: this.selectedModel
    });
  }

  delete() {
    this.dialogRef.close({
      action: 'Delete'
    });
  }
}

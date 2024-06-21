import {Component, Inject} from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Model} from '../../models/Model.model';
import {ModellerService} from '../../../core/services/modeller/modeller.service';
import {take} from 'rxjs/operators';
import {NavigationExtras, Router} from '@angular/router';

@Component({
  selector: 'modal-model-creation',
  templateUrl: 'modal-model-creation.component.html'
})
export class ModalModelCreation {
  constructor(
    public dialogRef: MatDialogRef<ModalModelCreation>,
    private modellerService: ModellerService,
    public router: Router,
    @Inject(MAT_DIALOG_DATA) public model: Model) {}

  public closeDiagram(): void {
    this.dialogRef.close();
  }

  public createDiagram(): void {
    if (this.model.label) {
      this.modellerService.createModel(this.model.label).pipe(take(1)).subscribe((model) => {
        this.dialogRef.close();
        this.navigateToModellingCanvas(model);
      });
    }
  }

  private navigateToModellingCanvas(model: Model) {
    const navExtras = {
      queryParams: {
        id: model.id,
        label: model.label
      }
    } as NavigationExtras;
    this.router.navigate(['/modeller'], navExtras);
  }
}

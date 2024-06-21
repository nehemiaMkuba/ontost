import {Component, OnInit } from '@angular/core';
import {ModalModelCreation} from '../../shared/modals/modal-model-creation/modal-model-creation.component';
import {Model} from '../../shared/models/Model.model';
import {MatDialog} from '@angular/material/dialog';
import {ModellerService} from '../../core/services/modeller/modeller.service';
import {take} from 'rxjs/operators';
import {NavigationExtras, Router} from '@angular/router';
import {ModalModelEdit} from '../../shared/modals/modal-model-edit/modal-model-edit.component';

@Component({
  selector: 'app-diagram-management',
  templateUrl: './diagram-management.component.html',
  styleUrls: ['./diagram-management.component.css']
})
export class DiagramManagementComponent implements OnInit {
  public models: Model[];
  public rippleDisabled: boolean = false;

  constructor(private matDialog: MatDialog, private modellerService: ModellerService, private router: Router) { }

  ngOnInit(): void {
    this.modellerService.getModels().pipe(take(1)).subscribe(models => {
      this.models = models;
    });
  }

  createNewDiagram() {
    this.matDialog.open(ModalModelCreation, {
      data: new Model()
    });
  }

  editDiagram(model: Model): void {
    const dialogRef = this.matDialog.open(ModalModelEdit, {
      data: { ...model }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        model.label = result.label;
      }
    });
  }

  deleteDiagram(model: Model): void {
    this.modellerService.deleteModel(model.id).pipe(take(1)).subscribe(response => {
      const index = this.models.findIndex(m => m.id === model.id);
      if (index >= 0) {
        this.models.splice(index, 1);
      }
    });
  }


  openModel(model: Model) {
    const navExtras = {
      queryParams: {
        id: model.id,
        label: model.label
      }
    } as NavigationExtras;
    this.router.navigate(['/modeller'], navExtras);
  }

  public toggleRipple(): void {
    this.rippleDisabled = !this.rippleDisabled;
  }

  createNewOntologyLanguage() {

  }
}

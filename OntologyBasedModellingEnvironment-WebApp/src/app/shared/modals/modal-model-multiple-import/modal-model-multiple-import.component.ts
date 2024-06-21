import {ChangeDetectorRef, Component, Inject} from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Model} from '../../models/Model.model';
import {ModellerService} from '../../../core/services/modeller/modeller.service';
import {HttpClient} from '@angular/common/http';
import {EndpointSettings} from '../../../_settings/endpoint.settings';
import {MatDialog} from '@angular/material/dialog';
import {IDropdownSettings} from 'ng-multiselect-dropdown';
import {delay, take} from 'rxjs/operators';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {ModellingAreaComponent} from '../../../pages/modelling-environment/components/modelling-area/modelling-area.component';


@Component({
  selector: 'modal-model-multiple-import',
  templateUrl: 'modal-model-multiple-import.component.html'
})
export class ModalModelMultipleImport {
//for multiple selection
  dropdownList = [];
  selectedItems = [];
  dropdownSettings: IDropdownSettings;
//for single selection
  selectedOption: string;
  httpClient: HttpClient;
  endpointSettings: EndpointSettings;
  service: ModellerService;
  ttlResult: string;
  modellingareacomponent: ModellingAreaComponent;


  constructor(public matDialog: MatDialog, public mService: ModellerService,
              private router: Router,
              private route: ActivatedRoute,
              public dialogRef: MatDialogRef<ModalModelMultipleImport>,
              @Inject(MAT_DIALOG_DATA) public model: Model) {
  }


  onNoClick(): void {
    this.dialogRef.close();
  }


  public getLanguagesFromGithub(): void {
    if (this.mService.prefixAdvancedGithub !== undefined && this.mService.prefixAdvancedGithub.length > 0) {
      this.dropdownList.push(...this.mService.prefixAdvancedGithub);
    }
  }


  postLanguagesSelectedOnFuseki(): void {
    this.mService.queryUploadLanguagesSelectedOnFuseki(this.selectedItems).pipe(take(1)).subscribe();
  }



  ngOnInit(): void {
    //Check if prefixes are stored in the variable prefixAdvanced
    if (this.mService.prefixAdvancedGithub !== undefined && this.mService.prefixAdvancedGithub.length > 0) {
      this.getLanguagesFromGithub();
      //this.getLanguagesFromFusekiHtml();
    }
    //Check if dropdownlist is empty, in this case the error string appear on the dialog box
    if (this.dropdownList.length === 0) {
      var x = document.getElementById('myDIV');
      x.style.display = 'block';
    }
//Set properties to the dropdownSettings
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true
    };
  }

  onItemSelect(item: any) {
    console.log(item);
  }

  onSelectAll(items: any) {
    console.log(items);
  }


}

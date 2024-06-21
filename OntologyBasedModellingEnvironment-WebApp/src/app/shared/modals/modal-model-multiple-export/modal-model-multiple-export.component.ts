import { Component, Inject} from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Model} from '../../models/Model.model';
import {ModellerService} from '../../../core/services/modeller/modeller.service';
import {HttpClient} from '@angular/common/http';
import {EndpointSettings} from '../../../_settings/endpoint.settings';
import {MatDialog} from '@angular/material/dialog';
import {IDropdownSettings} from 'ng-multiselect-dropdown';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';


@Component({
  selector: 'modal-model-multiple-export',
  templateUrl: 'modal-model-multiple-export.component.html'
})
export class ModalModelMultipleExport {
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


  constructor(public matDialog: MatDialog, public mService: ModellerService,
              private router: Router,
              private route: ActivatedRoute,
              public dialogRef: MatDialogRef<ModalModelMultipleExport>,
              @Inject(MAT_DIALOG_DATA) public model: Model) {
  }


  onNoClick(): void {
    this.dialogRef.close();
  }


  //split prefix string into array and push prefixes into dropdownlist
  public getLanguagesFromFusekiHtml(): void {
    if (this.mService.prefixAdvanced !== undefined) {
      var array = this.mService.prefixAdvanced.split(',');

      for (let i = 1; i < array.length; i++) {
        this.dropdownList.push({item_id: i, item_text: array[i - 1]});
      }
    }


  }


  //Get data from fuseki based on array of prefixes selected
  getLanguageMultipleSelection(): void {

    var aSelectedLangArray: string[] = [];
    for (let i = 0; i < this.selectedItems.length; i++) {
      aSelectedLangArray[i] = this.selectedItems[i].item_text;
    }
    this.mService.queryModelsAndLanguageADVANCEDwithDistinctionMultipleSelection(aSelectedLangArray);

  }

  ngOnInit(): void {
    //Check if prefixes are stored in the variable prefixAdvanced
    if (this.mService.prefixAdvanced !== undefined) {
      this.getLanguagesFromFusekiHtml();
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

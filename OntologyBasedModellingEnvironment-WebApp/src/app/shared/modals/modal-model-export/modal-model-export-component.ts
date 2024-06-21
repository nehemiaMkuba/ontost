
//THIS TYPESCRIPT IS NOT USED - OLD TYPESCRIPT

import {ChangeDetectorRef, Component, Inject} from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Model} from '../../models/Model.model';
import {ModellerService} from '../../../core/services/modeller/modeller.service';
import {HttpClient} from '@angular/common/http';
import {EndpointSettings} from '../../../_settings/endpoint.settings';
import {MatDialog} from '@angular/material/dialog';
import * as go from 'gojs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { saveAs } from 'file-saver';
import {element} from 'protractor';
import {PaletteElementModel} from '../../models/PaletteElement.model';
import {delay} from 'rxjs/operators';



@Component({
  selector: 'modal-model-export',
  templateUrl: 'modal-model-export.component.html'
})
export class ModalModelExport {
//for multiple selection
  dropdownList = [];
  selectedItems = [];
  dropdownSettings:IDropdownSettings;
//for single selection
  selectedOption: string;
  httpClient: HttpClient;
  endpointSettings: EndpointSettings;
  service: ModellerService;
  ttlResult: string;

/*
  @Inject(MAT_DIALOG_DATA) public data: any, public mService: ModellerService, public dialog: MatDialog, private changeDetection: ChangeDetectorRef) {
  this.currentPaletteElement = new PaletteElementModel();
  this.VariablesSettings = VariablesSettings;
}
  */

  constructor( public matDialog: MatDialog,public mService: ModellerService,

    public dialogRef: MatDialogRef<ModalModelExport>,
    @Inject(MAT_DIALOG_DATA) public model: Model) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
//advanced export
  getLanguage(): void{
    //this.service(HttpClient,EndpointSettings);
    //var mservice = new ModellerService(this.httpClient,this.endpointSettings);

    this.mService.queryModelsAndLanguageADVANCEDwithDistinction(this.selectedOption);

  }

  //MULTIPLE SELECTION
 //private mService2: ModellerService;
 // private mService2: ModellerService;
  /*getLanguageMultipleSelection(): void{

    var selectedItemsString: Array<string> = [];

    //this.selectedItems.forEach(arrayFunction);
    this.ttlResult="";


   // this.ttlResult=this.mService.queryModelsAndLanguageADVANCEDwithDistinctionMultipleSelection(this.selectedItems[0].item_text);

    //let num = [7, 8, 9];
   // this.selectedItems.forEach(function (element) {

     // mService2: ModellerService;
     // console.log("First console log"+element);
      //mservice è vuoto! chiamata a qualcosa che non esiste. This is empty

   // });



    //function arrayFunction (element){

      //let languageSelected = element.item_text;

      this.ttlResult= this.ttlResult+this.mService.queryModelsAndLanguageADVANCEDwithDistinctionMultipleSelection(this.selectedItems[0].item_text),delay(9000);

       //error "cannot read properties of undefined" like if i didn't defined mService
        //this.mService.queryModelsAndLanguageADVANCEDwithDistinction(this.selectedOption);

   // };
    const filename = "AOAME.ttl";
    var myblob = new Blob([this.ttlResult], {
      type: 'text/trig'
    });
    saveAs(myblob, filename);

    var myblob2 = new Blob([this.mService.modelAndLanguageAdvanced], {
      type: 'text/trig'
    });
    saveAs(myblob2, filename);
  }*/



//for multiple selection
 /* ngOnInit() {
    this.dropdownList = [
      { item_id: 1, item_text: 'mod' },
      { item_id: 2, item_text: 'bpmn' },
      { item_id: 3, item_text: 'cmmn' },
      { item_id: 4, item_text: 'apqc' },
      { item_id: 5, item_text: 'archi' }
    ];

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
*/

}

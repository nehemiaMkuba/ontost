import {Component, Inject, OnInit, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material/dialog";
import {DomainElementModel} from "../../models/DomainElement.model";
import {ModellerService} from "../../../core/services/modeller/modeller.service";
import {PaletteElementModel} from "../../models/PaletteElement.model";
import {ModalCreateDomainElementsComponent} from "../modal-create-domain-elements/modal-create-domain-elements.component";
import {ModalAddPropertiesComponent} from "../modal-add-properties/modal-add-properties.component";
import {VariablesSettings} from "../../../_settings/variables.settings";
import * as go from 'gojs';
import {take} from 'rxjs/operators';
import {UUID} from 'angular2-uuid';
import {ModalEditPaletteElementComponent} from '../modal-edit-palette-element/modal-edit-palette-element.component';

@Component({
  selector: 'app-modal-extend-palette-element',
  templateUrl: './modal-extend-palette-element.component.html',
  styleUrls: ['./modal-extend-palette-element.component.css']
})
export class ModalExtendPaletteElementComponent implements OnInit {

 /*constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  public mService: ModellerService) {

  }*/

private ontologyClasses: DomainElementModel[] = [];
public currentPaletteElement: PaletteElementModel;
public activityImageList: any;
public eventImageList: any;
public gatewayImageList: any;
public dataObjectImageList: any;
public groupImageList: any;

public documents4DSML4PTMImageList: any;
public data4DSML4PTMImageList: any;
public activities4DSML4PTMImageList:any;
public connectors4DSML4PTMDocumentViewImageList:any;

public group4BPaaSImageList: any;

public organizationalUnitImageList: any;
public performerImageList: any;
public roleImageList: any;

public sapscenesImageList: any;
public sapscenesRelationsList: any;

public archiMateApplicationLayerList: any;
public archiMateBusinessLayerList: any;
public archiMateTechnologyLayerList: any;

public floWare_SystemLayerList: any;
public domainName: string;


public config: any;
public config1: any;
public VariablesSettings: any;

public arrowHeads: string[] = [];
public arrowStrokes: string[] = [];

public uploadedList: any;
public imageList: string[] = [];

public imageRoot: string = VariablesSettings.IMG_ROOT;

@Output() showCreateDomainElementModalFromExtend = new EventEmitter();
@Output() newElementCreated = new EventEmitter();
  constructor(
    public dialogRef: MatDialogRef<ModalExtendPaletteElementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public mService: ModellerService, public dialog: MatDialog, private changeDetection: ChangeDetectorRef) {
    this.currentPaletteElement = new PaletteElementModel();
    this.VariablesSettings = VariablesSettings;
    this.domainName = data.paletteElement.representedLanguageClass;

  }


  async ngOnInit() {
    console.log('Domain name is ' + this.domainName);
    this.mService.queryDomainClasses();
    this.mService.queryModelingElementClasses();
    this.mService.queryAllProperties(this.domainName);
    //this.mService.queryPaletteCategories();
    this.mService.queryNamespacePrefixes();

    console.log('Palette category for the element is ' + this.data.paletteElement.categoryLabel);
    console.log('Palette category uri for the element is ' + this.data.paletteElement.paletteCategory);

    this.mService.getArrowStructures().then(value => {
      this.arrowHeads = value.heads;
      this.arrowStrokes = value.strokes;
    });

    console.log(this.arrowHeads);

    this.config = {
      displayKey: 'label', //if objects array passed which key to be displayed defaults to description
      search: true, //true/false for the search functionlity defaults to false,
      height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
      placeholder: 'Select Semantic Domain Element', // text to be displayed when no item is selected defaults to Select,
      // customComparator: ()=>{} // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
      limitTo: 5, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
      moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
      noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
      searchPlaceholder: 'Search' // label thats displayed in search input,
      // searchOnKey: 'name' // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
    };

    this.config1 = {
      displayKey: 'label', //if objects array passed which key to be displayed defaults to description
      search: true, //true/false for the search functionlity defaults to false,
      height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
      placeholder: 'Select Existing Language Element', // text to be displayed when no item is selected defaults to Select,
      // customComparator: ()=>{} // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
      limitTo: 5, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
      moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
      noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
      searchPlaceholder: 'Search' // label thats displayed in search input,
    };

    await this.loadImages();
  }
  private async loadImages() {
    await this.mService.getUploadedImages().then(async values => {

      let category = this.data.paletteElement.paletteCategory.split('#')[1];

      this.imageList = values[category];
    });
  }

  private  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  processImageUpload(imageInput: any, type: string) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', async (event: any) => {

      let filename = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();;

      const currentPaletteCategory = this.data.paletteElement.paletteCategory.split('#')[1];
      this.mService.uploadNewImageToBackend(file, filename, currentPaletteCategory);

      this.imageList.push(filename);

    });
    reader.readAsDataURL(file);

  }


  onCloseCancel() {
    this.dialogRef.close('Cancel');
  }

  selectionChanged($event: any) {
    console.log('Selection changed');
    this.currentPaletteElement.representedDomainClass = $event.value.id;
  }

  selectionChangedForIntegrate($event: any) {
    console.log('Selection changed for Integrate Elements');
    //this.data.paletteElement.languageSubclasses = $event.value.id;
  }

  createElementInOntology() {

    const ele = this.currentPaletteElement;
    ele.id = '';
    ele.uuid = UUID.UUID();
    //console.log('uuid:' + ele.uuid);
    ele.label = this.currentPaletteElement.label;
    ele.type = this.data.paletteElement.type;
    ele.hiddenFromPalette = false;
    ele.usesImages = false;
    //console.log('parent element ' + this.data.paletteElement.id);
    ele.parentElement = this.data.paletteElement.id;
    ele.parentLanguageClass = this.data.paletteElement.representedLanguageClass;
    //console.log('parent:' + ele.parentElement);
    ele.paletteCategory = this.data.paletteElement.paletteCategory; // 'lo:Category_Activities';
    //console.log('category: ' + this.currentPaletteElement.paletteCategory);
    ele.representedLanguageClass = ele.languagePrefix + (this.currentPaletteElement.label).replace(new RegExp(' ', 'g'), ''); /*important property to display in the pallette*/

    //console.log('Thumbnail not selected: ' + this.currentPaletteElement.thumbnailURL);
    ele.width = 100;
    ele.height = 70;
    // Set width and height of the image as per category
    if (ele.paletteCategory.search(VariablesSettings.CAT_ACTIVITIES) !== -1) {
      ele.width = 100;
      ele.height = 70;
      if (this.currentPaletteElement.thumbnailURL === null) {
        ele.thumbnailURL = '/assets/images/BPMN-CMMN/Thumbnail_Task.png';
      }
    } else if (ele.paletteCategory.search(VariablesSettings.CAT_EVENTS) !== -1) {
      ele.width = 70;
      ele.height = 70;
      if (this.currentPaletteElement.thumbnailURL === null) {
        ele.thumbnailURL = '/assets/images/BPMN-CMMN/Simple_Start.png';
      }
    } else if (ele.paletteCategory.search(VariablesSettings.CAT_GATEWAYS) !== -1) {
      ele.width = 70;
      ele.height = 100;
      if (this.currentPaletteElement.thumbnailURL === null) {
        ele.thumbnailURL = '/assets/images/BPMN-CMMN/Simple_Gateway.png';
      }
    } else if (ele.paletteCategory.search(VariablesSettings.CAT_DATA) !== -1) {
      ele.width = 70;
      ele.height = 100;
    }

    ele.fromArrow = this.currentPaletteElement.fromArrow;
    ele.toArrow = this.currentPaletteElement.toArrow;
    ele.arrowStroke = this.currentPaletteElement.arrowStroke;

    console.log('stringified element:' + JSON.stringify(ele));


    this.mService.createElementInOntology(JSON.stringify(ele)).subscribe( // this is a synchronous call to the webservice
      (response) => {
        this.newElementCreated.emit(ele);
        this.dialogRef.close();

        const dialogRef1 = this.dialog.open(ModalEditPaletteElementComponent, { //ModalAddPropertiesComponent, {
          data: {paletteElement: ele },
          height:'80%',
          width: '800px',
          disableClose: false,
        });

        this.mService.queryPaletteElements().pipe(take(1)).subscribe();

        const sub = dialogRef1.componentInstance.propertiesAdded.subscribe(() => {
          dialogRef1.close('Cancel');
        });
      },
      (err) => {
        console.log(err);
      }
    );

  }

  mapToDomainOntology() {
    this.dialogRef.close('Cancel');
    let dialog = this.dialog.open(ModalCreateDomainElementsComponent, {
      height:'80%',
      width: '800px',
      data: 'This text is passed into the dialog!',
      disableClose: false,
    });
    dialog.afterClosed().subscribe(result => {
      console.log(`Dialog closed: ${result}`);
      //this.dialogResult = result;
    });
  }

  /*openCreateDomainElementModalFromExtend(element: PaletteElementModel) {

    const dialogRef = this.dialog.open(ModalCreateDomainElementsComponent, {
      data: {paletteElement: element },
      height:'80%',
      width: '800px',
      disableClose: false,
    });

    const sub = dialogRef.componentInstance.newDomainElementAdded.subscribe(() => {
      this.mService.queryDomainClasses();
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }*/

  addSubClassesForLanguage(element: PaletteElementModel) {
    console.log('Selected subclasses : ');
    console.log(element);
    element.uuid = (this.data.paletteElement.label).replace(new RegExp(' ', 'g'), ''); // replace spaces
    element.parentElement = (this.data.paletteElement.label).replace(new RegExp(' ', 'g'), ''); // replace spaces
    this.mService.createLanguageSubclasses(JSON.stringify(element)).subscribe( // synchronous call to webservice
      (response) => {
        this.mService.queryPaletteElements().pipe(take(1)).subscribe();
        this.dialogRef.close('Cancel');
      }
    );
  }

}

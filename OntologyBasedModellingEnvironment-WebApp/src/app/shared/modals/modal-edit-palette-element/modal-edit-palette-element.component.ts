import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material/dialog";
import {PaletteElementModel} from "../../models/PaletteElement.model";
import {ModellerService} from "../../../core/services/modeller/modeller.service";
import {ModalCreateDomainElementsComponent} from "../modal-create-domain-elements/modal-create-domain-elements.component";
import {ModalInsertPropertyComponent} from "../modal-insert-datatype-property/modal-insert-datatype-property.component";
import {ModalEditPropertiesComponent} from "../modal-edit-datatype-property/modal-edit-datatype-property.component";
import {ModalEditBCObjectPropertyComponent} from "../modal-edit-bc-object-property/modal-edit-bc-object-property.component";
import {ModalEditSMObjectPropertyComponent} from "../modal-edit-sm-object-property/modal-edit-sm-object-property.component";
import {DatatypePropertyModel} from "../../models/DatatypeProperty.model";
import {ObjectPropertyModel} from "../../models/ObjectProperty.model";
import {ModalInsertObjectPropertyComponent} from "../modal-insert-object-property/modal-insert-object-property.component";
import {ModalInsertLangobjectPropertyComponent} from "../modal-insert-langobject-property/modal-insert-langobject-property.component";
import {VariablesSettings} from "../../../_settings/variables.settings";
import * as go from 'gojs';
import {take} from 'rxjs/operators';
import {ModalInsertShaclPropertyComponent} from '../modal-insert-shacl-property/modal-insert-shacl-property.component';
import {ShaclConstraintModel} from '../../models/ShaclConstraint.model';
import {of} from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-modal-edit-palette-element',
  templateUrl: './modal-edit-palette-element.component.html',
  styleUrls: ['./modal-edit-palette-element.component.css']
})
export class ModalEditPaletteElementComponent implements OnInit {

  @Output() propertiesAdded = new EventEmitter();

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
  public archiMateList: any;

  public archiMateApplicationLayerList: any;
  public archiMateBusinessLayerList: any;
  public archiMateTechnologyLayerList: any;

  public floWare_SystemLayerList: any;

  public domainName: string;
  //public domainNameArr = [];
  public namespaceMap: Map<string, string>;
  public datatypeProperties: DatatypePropertyModel[] = [];
  public bridgingConnectors: ObjectPropertyModel[] = [];
  public semanticMappings: ObjectPropertyModel[] = [];
  public shaclConstraints: ShaclConstraintModel[] = [];

  public config1: any;
  public VariablesSettings: any;

  public arrowHeads: string[] = [];
  public arrowStrokes: string[] = [];

  public uploadedList: any;
  public imageList: string[] = [];

  public imageRoot: string = VariablesSettings.IMG_ROOT;

  constructor(public dialogRef: MatDialogRef<ModalEditPaletteElementComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, public mService: ModellerService, public dialog: MatDialog) {
    this.currentPaletteElement = new PaletteElementModel();
    this.namespaceMap = new Map<string, string>();
    //this.domainElement = new DomainElementModel();
    this.VariablesSettings = VariablesSettings;
  }

  async ngOnInit() {

    // const domainStr = domainNameArr[0]; //!!!Fix this - should be in format bmm:BMMTask (prefix case-sensitive)
    /*this.mService.queryNamespaceMap().subscribe(
      (data) => {
      this.namespaceMap = data;
      this.namespaceMap.set('bmm','hello');
      console.log(data);*/
      // const arr = domainStr.split("/");
    const domainNameArr = this.data.paletteElement.representedLanguageClass.split('#');
    const prefix = this.data.paletteElement.languagePrefix;
    if (domainNameArr[1] !== undefined) this.domainName = prefix + ':' + domainNameArr[1];
    else this.domainName = domainNameArr[0];
    this.mService.queryDatatypeProperties(this.domainName).subscribe(
      (response) => {
        this.datatypeProperties = response;
        console.log("Loading datatype properties");
      }
    );
      this.mService.queryBridgingConnectors(this.domainName).subscribe(
        (response) => {
          this.bridgingConnectors = response;
          console.log("Loading object properties");
        }
      );
    this.mService.querySemanticMappings(this.domainName).subscribe(
      (response) => {
        this.semanticMappings = response;
        console.log("Loading object properties");
      }
    );
    this.mService.queryShaclConstraints(this.domainName).subscribe(
      (response) => {
        this.shaclConstraints = response;
        console.log(response);
        console.log("Loading shacl constraints");
      }
    );
      //}
    //);
    this.mService.queryDomainClasses();
    this.mService.queryModelingElementClasses();

    //this.mService.queryPaletteCategories();
    this.mService.queryNamespacePrefixes();

    this.loadImages();

    this.currentPaletteElement.label = this.data.paletteElement.label;
    this.currentPaletteElement.thumbnailURL = this.data.paletteElement.thumbnailURL;
    console.log('this.data.paletteElement.thumbnailURL ' + this.data.paletteElement.thumbnailURL);
    console.log('this.data.paletteElement.imageURL ' + this.data.paletteElement.imageURL);
    console.log('this.data.paletteElement.comment ' + this.data.paletteElement.comment);
    console.log(this.data.paletteElement);
    this.currentPaletteElement.imageURL = this.data.paletteElement.imageURL;
    this.currentPaletteElement.comment = this.data.paletteElement.comment;
    this.currentPaletteElement.uuid = this.data.paletteElement.uuid;
    this.currentPaletteElement.arrowStroke = this.data.paletteElement.arrowStroke;
    this.currentPaletteElement.toArrow = this.data.paletteElement.toArrow;
    this.currentPaletteElement.fromArrow = this.data.paletteElement.fromArrow;

    this.mService.getArrowStructures().then(value => {
      this.arrowHeads = value.heads;
      this.arrowStrokes = value.strokes;
    });

    this.config1 = {
      displayKey: 'label',
      search: true,
      height: 'auto',
      placeholder: 'Select Semantic Domain Element',
      limitTo: 15,
      moreText: 'more',
      noResultsFound: 'No results found!',
      searchPlaceholder: 'Search'
    };

  }

  private  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async loadImages() {
    await this.mService.getUploadedImages().then(async values => {

      let category = this.data.paletteElement.paletteCategory.split('#')[1];

      this.imageList = values[category];
    });
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
  }

  openCreateDomainElementModalFromEdit(element: PaletteElementModel) {

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
  }

  openInsertNewProperty(element: PaletteElementModel) {
    const dialogRef1 = this.dialog.open(ModalInsertPropertyComponent, {
      data: {paletteElement: element },
      height:'80%',
      width: '800px',
      disableClose: false,
    });

    const sub = dialogRef1.componentInstance.newPropertyAdded.subscribe(() => {
      /*const prefix = this.namespaceMap.get(this.domainName);
      const domainStr = prefix + ":" + this.domainNameArr[1];
      console.log('domainStr ' + domainStr);*/
      this.mService.queryDatatypeProperties(this.domainName).subscribe(
        (response) => {
          this.datatypeProperties = response;
          dialogRef1.close('Cancel');
        }
      );
    });

    dialogRef1.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }

  editElementInOntology() {
    const ele = this.currentPaletteElement;
    console.log('Edited label: '+ele.label);
    console.log('Edited comment: '+ele.comment);
    console.log('Edited image: '+ele.imageURL);
    console.log('Edited thumbnail: '+ele.thumbnailURL);
    this.mService.editElement(this.data.paletteElement, ele).subscribe(
      (response) => {
        //this.elementEdited.emit(ele);
        this.dialogRef.close();
      }
    );
  }

  /*loadProperties() {
    console.log('domainName: ' + this.domainName);
    console.log(this.namespaceMap);
    const prefix = this.namespaceMap.get(this.domainName);
    console.log('domainName ' + prefix);
    const domainStr = prefix + ":" + this.domainNameArr[1];
    this.mService.queryDatatypeProperties(domainStr);
  }*/

  modifyProperty(element: PaletteElementModel, property: DatatypePropertyModel) {
    const dialogRef1 = this.dialog.open(ModalEditPropertiesComponent, {
      data: {paletteElement: element, datatypeProperty: property },
      height:'80%',
      width: '800px',
      disableClose: false,
    });

    const sub = dialogRef1.componentInstance.propertyEdited.subscribe(() => {
      //const prefix = this.namespaceMap.get(this.domainName);
      //const domainStr = prefix + ":" + this.domainNameArr[1];
      this.mService.queryDatatypeProperties(this.domainName).subscribe(
        (response) => {
          this.datatypeProperties = response;
          dialogRef1.close('Cancel');
        }
      );

    });

    dialogRef1.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }

  deleteProperty(property: DatatypePropertyModel) {
    this.mService.deleteDatatypeProperty(property).subscribe(
      (response) => {
        this.mService.queryDatatypeProperties(this.domainName).subscribe(
          (response1) => {
            this.datatypeProperties = response1;
          }
        );

      }
    );
  }

  openInsertNewShaclConstraint(element: PaletteElementModel) {
    const dialogRef1 = this.dialog.open(ModalInsertShaclPropertyComponent, {
      data: {paletteElement: element },
      height:'80%',
      width: '800px',
      disableClose: false,
    });

    const sub = dialogRef1.componentInstance.newConstraintAdded.subscribe(() => {
      this.mService.queryShaclConstraints(this.domainName).subscribe(
        (response) => {
          this.shaclConstraints = response;
          console.log(response);
          dialogRef1.close('Cancel');
        }
      );
    });

    dialogRef1.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }
  openInsertNewSemanticMapping(element: PaletteElementModel) {

    const dialogRef1 = this.dialog.open(ModalInsertObjectPropertyComponent, {
      data: {paletteElement: element },
      height:'80%',
      width: '800px',
      disableClose: false,
    });

    const sub = dialogRef1.componentInstance.newRelationAdded.subscribe(() => {
      this.mService.querySemanticMappings(this.domainName).subscribe(
        (response) => {
          this.semanticMappings = response;
          dialogRef1.close('Cancel');
        }
      );
    });

    dialogRef1.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }

  openInsertNewBridgingConnector(element: PaletteElementModel) {

    const dialogRef1 = this.dialog.open(ModalInsertLangobjectPropertyComponent, {
      data: {paletteElement: element },
      height:'80%',
      width: '800px',
      disableClose: false,
    });

    const sub = dialogRef1.componentInstance.newLangRelationAdded.subscribe(() => {
      this.mService.queryBridgingConnectors(this.domainName).subscribe(
        (response) => {
          this.bridgingConnectors = response;
          dialogRef1.close('Cancel');
        }
      );
    });

    dialogRef1.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }

  modifyBridgingConnector(element: PaletteElementModel, property: ObjectPropertyModel) {
    const dialogRef1 = this.dialog.open(ModalEditBCObjectPropertyComponent, {
      data: {paletteElement: element, objectProperty: property },
      height:'80%',
      width: '800px',
      disableClose: false,
    });

    const sub = dialogRef1.componentInstance.bridgingConnectorEdited.subscribe(() => {
      //const prefix = this.namespaceMap.get(this.domainName);
      //const domainStr = prefix + ":" + this.domainNameArr[1];
      this.mService.queryBridgingConnectors(this.domainName).subscribe(
        (response) => {
          this.bridgingConnectors = response;
          dialogRef1.close('Cancel');
        }
      );

    });

    dialogRef1.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }

  modifySemanticMapping(element: PaletteElementModel, property: ObjectPropertyModel) {
    const dialogRef1 = this.dialog.open(ModalEditSMObjectPropertyComponent, {
      data: {paletteElement: element, objectProperty: property },
      height:'80%',
      width: '800px',
      disableClose: false,
    });

    const sub = dialogRef1.componentInstance.semanticMappingEdited.subscribe(() => {
      //const prefix = this.namespaceMap.get(this.domainName);
      //const domainStr = prefix + ":" + this.domainNameArr[1];
      this.mService.querySemanticMappings(this.domainName).subscribe(
        (response) => {
          this.semanticMappings = response;
          dialogRef1.close('Cancel');
        }
      );

    });

    dialogRef1.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }

  deleteSemanticMapping(property: ObjectPropertyModel) {
    this.mService.deleteObjectProperty(property).subscribe(
      (response) => {
        this.mService.querySemanticMappings(this.domainName).subscribe(
          (response1) => {
            this.semanticMappings = response1;
          }
        );

      }
    );
  }

  deleteBridgingConnector(property: ObjectPropertyModel) {
    this.mService.deleteObjectProperty(property).subscribe(
      (response) => {
        this.mService.queryBridgingConnectors(this.domainName).subscribe(
          (response1) => {
            this.bridgingConnectors = response1;
          }
        );

      }
    );
  }
}

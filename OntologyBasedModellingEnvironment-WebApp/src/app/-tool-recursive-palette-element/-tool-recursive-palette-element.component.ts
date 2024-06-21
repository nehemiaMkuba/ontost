import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {PaletteElementModel} from '../shared/models/PaletteElement.model';
import {GraphicalElementModel} from '../shared/models/GraphicalElement.model';
import {ContextMenuComponent} from 'ngx-contextmenu';
import {ModellerService} from '../core/services/modeller/modeller.service';
import {ModalExtendPaletteElementComponent} from '../shared/modals/modal-extend-palette-element/modal-extend-palette-element.component';
import {
  ModalPaletteElementPropertiesComponent
} from '../shared/modals/modal-palette-element-properties/modal-palette-element-properties.component';
import {MatDialog} from '@angular/material/dialog';
import {ModalEditPaletteElementComponent} from '../shared/modals/modal-edit-palette-element/modal-edit-palette-element.component';
import {VariablesSettings} from '../_settings/variables.settings';
import {ModalShowLanguageInstances} from '../shared/modals/modal-show-language-instances/modal-show-language-instances';
import {FiguresClass} from '../pages/modelling-environment/gojs/figures.class';
import * as go from 'gojs';
import {BpmnTemplateService} from '../pages/modelling-environment/gojs/bpmn-classes/bpmn-template.service';
import {take} from 'rxjs/operators';

const $ = go.GraphObject.make;

@Component({
  selector: 'app--tool-recursive-palette-element',
  templateUrl: './-tool-recursive-palette-element.component.html',
  styleUrls: ['./-tool-recursive-palette-element.component.css']
})
export class ToolRecursivePaletteElementComponent implements OnInit, AfterViewInit {
  @ViewChild(ContextMenuComponent, {static: true}) public elementRightClickMenu: ContextMenuComponent;

  @Input() child: PaletteElementModel;
  @Input() isBPMNNotationSelected: boolean;
  @Input() parentPaletteId: string;
  @Input() contextMenu: ContextMenuComponent;
  @Input() contextMenuSubject: PaletteElementModel;

  @Output() sendElementFromRecursiveElement = new EventEmitter();

  @Output() sendElementFromPalette = new EventEmitter();
  @Output() showPaletteElementPropertyModal1 = new EventEmitter();
  @Output() showExtendPaletteElementModal1 = new EventEmitter();
  @Output() showCreateDomainElementModal1 = new EventEmitter();
  @Output() showActivityElementPropertyModal1 = new EventEmitter();
  @Output() showEditPaletteElementModal1 = new EventEmitter();

  public imageRoot: string = '';
  public categorySuffix: string = '';

  constructor(private mService: ModellerService, public dialog: MatDialog, private bpmnTemplateService: BpmnTemplateService) {
    this.imageRoot = VariablesSettings.IMG_ROOT;
  }

  ngOnInit() {
    this.categorySuffix = this.child.paletteCategory.split('#')[1];
    console.log(this.child.id);

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadPaletteGoJSElements();
    }, 1000);
  }

  private addNewShape(a: GraphicalElementModel): void {
    let b: GraphicalElementModel = Object.assign({}, a);
    this.sendElementFromRecursiveElement.emit(b);
  }

  removeFromPalette(element: PaletteElementModel) {
    console.log('clicked ', element);
    console.log(element.label + ' ' + element.childElements);
    if (element.childElements.length > 0) {
      alert(element.label + ' has child elements, cannot be deleted');
    } else {
      if (confirm('Do you want to remove ' + element.label + ' from palette?')) {
        this.mService.deletePaletteElement(JSON.stringify(element)).subscribe(
          response => {
            this.mService.queryPaletteElements().pipe(take(1)).subscribe();
          }
        );
      } else {
        // Do nothing!
      }
    }
  }

  toggleExtendPaletteElementModal(element: PaletteElementModel) {
    //console.log(element)
    let dialogRef = this.dialog.open(ModalExtendPaletteElementComponent, {
      data: {paletteElement: element},
      height: '80%',
      width: '800px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }

  toggleEditPaletteElementModal(element: PaletteElementModel) {
    let dialogRef = this.dialog.open(ModalEditPaletteElementComponent, {
      data: {paletteElement: element},
      height: '80%',
      width: '800px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }

  /*toggleCreateDomainElementModalFromExtend(element: PaletteElementModel) {
    let dialogRef = this.dialog.open(ModalCreateDomainElementsComponent, {
      data: {paletteElement: element },
      height:'80%',
      width: '800px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }*/

  toggleActivityElementPropertyModal(element: PaletteElementModel) {
    let dialogRef = this.dialog.open(ModalPaletteElementPropertiesComponent, {
      data: {paletteElement: element},
      height: '80%',
      width: '800px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed : ' + result);
    });
  }

  openPaletteElementPropertiesModal(element: PaletteElementModel) {
    this.showPaletteElementPropertyModal1.emit(element);
  }

  openExtendPaletteElementModal(element: PaletteElementModel) {
    this.showExtendPaletteElementModal1.emit(element);
  }

  openActivityElementProperty(element: PaletteElementModel) {
    this.showActivityElementPropertyModal1.emit(element);
  }

  openCreateDomainElementModal(element: PaletteElementModel) {
    this.showCreateDomainElementModal1.emit(element);
  }

  openEditPaletteElementModal(element: PaletteElementModel) {
    this.showEditPaletteElementModal1.emit(element);
  }

  hideFromPalette(element: PaletteElementModel) {
    console.log('Hiding element : ' + element.label);
    element.uuid = (element.label).replace(new RegExp(' ', 'g'), ''); // replace spaces
    this.mService.hidePaletteElement(JSON.stringify(element)).subscribe(
      (response) => {
        console.log(response);
        this.mService.queryPaletteElements().pipe(take(1)).subscribe();
      }
    );
  }

  //Heroku difference
  showMessage(msg: string) {
  }

  showInstantiatedElements(element: PaletteElementModel) {
    this.dialog.open(ModalShowLanguageInstances, {data: element});
  }

  isElementMappedToBPMNMappers(element: PaletteElementModel): boolean {

    return this.bpmnTemplateService.isElementMappedToBPMNMappers(element);
  }

  loadPaletteGoJSElements() {
    const figuresClass = new FiguresClass();
    figuresClass.defineShapes();

    const tooltiptemplate = this.bpmnTemplateService.getTooltipTemplate();
    const activityNodeTemplateForPalette = this.bpmnTemplateService.getActivityNodeTemplateForPalette();
    const eventNodeTemplate = this.bpmnTemplateService.getEventNodeTemplate(tooltiptemplate, 1.2);
    const gatewayNodeTemplateForPalette = this.bpmnTemplateService.getGatewayNodeTemplateForPalette(tooltiptemplate);
    const annotationNodeTemplate = this.bpmnTemplateService.getAnnotationNodeTemplate();
    const dataObjectNodeTemplate = this.bpmnTemplateService.getDataObjectNodeTemplate();
    const dataStoreNodeTemplate = this.bpmnTemplateService.getDataStoreNodeTemplate();
    const privateProcessNodeTemplateForPalette = this.bpmnTemplateService.getPrivateProcessingNodeTempalteForPalette();

    const subProcessGroupTemplateForPalette = this.bpmnTemplateService.getSubProcessGroupTemplateForPalette();
    const poolTemplateForPalette = this.bpmnTemplateService.getPoolTemplateForPalette();
    const swimLanesGroupTemplateForPalette = this.bpmnTemplateService.getSwimLanesGroupTemplateForPalette();

    // create the nodeTemplateMap, holding special palette "mini" node templates:
    const palNodeTemplateMap = new go.Map<string, go.Node>();
    palNodeTemplateMap.add('activity', activityNodeTemplateForPalette);
    palNodeTemplateMap.add('event', eventNodeTemplate);
    palNodeTemplateMap.add('gateway', gatewayNodeTemplateForPalette);
    palNodeTemplateMap.add('annotation', annotationNodeTemplate);
    palNodeTemplateMap.add('dataobject', dataObjectNodeTemplate);
    palNodeTemplateMap.add('datastore', dataStoreNodeTemplate);
    palNodeTemplateMap.add('privateProcess', privateProcessNodeTemplateForPalette);

    const palGroupTemplateMap = new go.Map<string, go.Group>();
    palGroupTemplateMap.add('subprocess', subProcessGroupTemplateForPalette);
    palGroupTemplateMap.add('Pool', poolTemplateForPalette);
    palGroupTemplateMap.add('Lane', swimLanesGroupTemplateForPalette);

    // ------------------------------------------  Palette   ----------------------------------------------

    this.child.childElements.forEach((sbchild, indexElement) => {
      if (sbchild.parentElement === this.child.id && !sbchild.hiddenFromPalette && sbchild.type !== 'PaletteConnector' && this.isElementMappedToBPMNMappers(sbchild)) {
        const paletteId = this.parentPaletteId + '-' + indexElement;
        const foundDomElement = document.getElementById(paletteId);
        if (foundDomElement && !foundDomElement.querySelector('canvas')) {
          this.instatiatePaletteElement(sbchild, paletteId, palNodeTemplateMap, palGroupTemplateMap);
        }
      }
    });

    const canvasContainers = document.getElementsByClassName('bpmn-canvas-container');
    for (let i = 0; i < canvasContainers.length; i++) {
      const foundDiv = canvasContainers[i].querySelector('div');
      if (foundDiv) {
        foundDiv.style.overflow = 'hidden';
      }
    }
  }


  private instatiatePaletteElement(element: PaletteElementModel, paletteId: string, palNodeTemplateMap: go.Map<string, go.Node>, palGroupTemplateMap: go.Map<string, go.Group>) {
    const self = this;
    // initialize the first Palette, BPMN Spec Level 1
    const myPalette =
      $(go.Palette, paletteId,
        { // share the templates with the main Diagram
          'draggingTool.isEnabled': false,
          nodeTemplateMap: palNodeTemplateMap,
          groupTemplateMap: palGroupTemplateMap,
          layout: $(go.GridLayout,
            {
              cellSize: new go.Size(1, 1),
              spacing: new go.Size(5, 5),
            })
        });


    if (PaletteElementModel.getProbableElementType(element) === 'ModelingElement') {
      this.bpmnTemplateService.addGoJsBPMNNodeFields(element, PaletteElementModel.getProbableModellingConstruct(element));
    } else if (PaletteElementModel.getProbableElementType(element) === 'ModelingContainer') {
      const probableModellingConstruct = PaletteElementModel.getProbableModellingConstruct(element);
      this.bpmnTemplateService.addGoJsBPMNGroupFields(element, probableModellingConstruct);
    }
    // @ts-ignore
    //element.text = element.label.split(' ').join('\n');

    myPalette.model = $(go.GraphLinksModel,
      {
        copiesArrays: true,
        copiesArrayObjects: true,
        nodeDataArray: [
          // -------------------------- Event Nodes
          element
        ]  // end nodeDataArray
      });  // end model
  }
}

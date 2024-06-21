import {Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import * as go from 'gojs';
import {ChangedEvent} from 'gojs';
import {PaletteElementModel} from '../../../../shared/models/PaletteElement.model';
import {VariablesSettings} from '../../../../_settings/variables.settings';
import {ModellerService} from '../../../../core/services/modeller/modeller.service';
import {ContextMenuComponent} from 'ngx-contextmenu';
import {Model} from '../../../../shared/models/Model.model';
import {MatDialog} from '@angular/material/dialog';
import {UUID} from 'angular2-uuid';
import * as _ from 'lodash-es';
import {InstantiationTargetType} from '../../../../shared/models/InstantiationTargetType.model';
import {ModalModelLink} from '../../../../shared/modals/modal-model-link/modal-model-link';
import {ModalElementNote} from '../../../../shared/modals/modal-element-note/modal-element-note.component';
import {
  ModalModellingLanguageConstructInstanceLink,
  VisualisationLinksData
} from '../../../../shared/modals/modal-modelling-language-construct-instance-link/modal-modelling-language-construct-instance-link';
import {ModalPaletteVisualisation} from '../../../../shared/modals/modal-palette-visualisation/modal-palette-visualisation';
import {ModelElementDetail} from '../../../../shared/models/ModelElementDetail.model';
import {ModelElementDetailAndModel} from '../../../../shared/models/ModelElementDetailAndModel';
import {ModalViewElementDetail} from '../../../../shared/modals/model-element-detail/model-element-detail.component';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {filter, switchMap, take, takeUntil, timeout} from 'rxjs/operators';
import {Subject} from 'rxjs/internal/Subject';
import {of} from 'rxjs/internal/observable/of';

import {DrawCommandHandlerClass} from '../../gojs/draw-command-handler.class';
import {LaneResizingTool} from '../../gojs/bpmn-classes/lane-resizing-tool.class';
import {PoolLayout} from '../../gojs/bpmn-classes/pool-layout.class';
import {BpmnLaneHelpers} from '../../gojs/bpmn-classes/bpmn-lane-helpers';
import {PoolLink} from '../../gojs/bpmn-classes/pool-link.class';
import {BPMNLinkingTool} from '../../gojs/bpmn-classes/bpmn-linking-tool.class';
import {BPMNRelinkingTool} from '../../gojs/bpmn-classes/bpmn-relinking-tool.class';
import {Mappers} from '../../gojs/mappers';
import {FiguresClass} from '../../gojs/figures.class';
import {BpmnTemplateService} from '../../gojs/bpmn-classes/bpmn-template.service';
import {BpmnConstantsClass} from '../../gojs/bpmn-classes/bpmn-constants.class';
import {AdditionalCreateOptions} from '../../models/additional-create-options.interface';
import {ModalInstantiationTypeComponent} from '../../../../shared/modals/modal-instantiation-type/modal-instantiation-type.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';

const $ = go.GraphObject.make;


@Component({
  selector: 'app-modelling-area-bpmn',
  templateUrl: './modelling-area-bpmn.component.html',
  styleUrls: ['./modelling-area-bpmn.component.css']
})
export class ModellingAreaBPMNComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:max-line-length
  public constructor(public mService: ModellerService, public matDialog: MatDialog, private activatedRoute: ActivatedRoute, private router: Router, private bpmnTemplateService: BpmnTemplateService, private snackBar:MatSnackBar, private toastr: ToastrService) {
    console.log('Constructor of graph');
    (go as any).licenseKey = '54ff43e7b11c28c702d95d76423d38f919a52e63998449a35a0412f6be086d1d239cef7157d78cc687f84cfb487fc2898fc1697d964f073cb539d08942e786aab63770b3400c40dea71136c5ceaa2ea1fa2b24a5c5b775a2dc718cf3bea1c59808eff4d54fcd5cb92b280735562bac49e7fc8973f950cf4e6b3d9ba3fffbbf4faf3c7184ccb4569aff5a70deb6f2a3417f';

    this.dialog = matDialog;
  }

  myDiagram: go.Diagram;

  private destroy$ = new Subject<void>();

  @ViewChild(ContextMenuComponent, {static: true}) public elementRightClickMenu: ContextMenuComponent;
  @ViewChild(ContextMenuComponent, {static: true}) public paletteRightClickMenu: ContextMenuComponent;

  @Input() contextMenu: ContextMenuComponent;
  @Input() contextMenuSubject: PaletteElementModel;

  @Input() public elements: any;
  @Input() public style: any;
  @Input() public layout: any;
  @Input() public zoom: any;
  @Input() new_element: PaletteElementModel;

  public models: Model[] = [];
  public selectedModel: Model;
  public selectedConnectorMode: PaletteElementModel;
  private pathPatterns: Map<string, string> = new Map();
  private dialog: MatDialog;

  selectedFile: File;

  selectedInstantiationType: InstantiationTargetType = InstantiationTargetType.INSTANCE;

  // removing a boundary event doesn't not reposition other BE circles on the node
  // just reassigning alignmentIndex in remaining BE would do that.
  removeActivityNodeBoundaryEvent(obj: go.GraphObject | null) {
    if (obj === null || obj.panel === null || obj.panel.itemArray === null) {
      return;
    }
    this.myDiagram.startTransaction('removeBoundaryEvent');
    const pid = obj.portId;
    const arr = obj.panel.itemArray;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].portId === pid) {
        this.myDiagram.model.removeArrayItem(arr, i);
        break;
      }
    }
    this.myDiagram.commitTransaction('removeBoundaryEvent');
  }

  diagramOnMouseDrop(self) {
    if (!self.myDiagram) {
      return;
    }
    // when the selection is dropped in the diagram's background,
    // make sure the selected Parts no longer belong to any Group
    const ok = self.myDiagram.commandHandler.addTopLevelParts(this.myDiagram.selection, true);
    if (!ok) {
      self.myDiagram.currentTool.doCancel();
    }
  }

// location of event on boundary of Activity is based on the index of the event in the boundaryEventArray
  nodeActivityBESpotConverter(s: number) {
    const x = 10 + (BpmnConstantsClass.EventNodeSize / 2);
    if (s === 0) {
      return new go.Spot(0, 1, x, 0);
    }    // bottom left
    if (s === 1) {
      return new go.Spot(1, 1, -x, 0);
    }   // bottom right
    if (s === 2) {
      return new go.Spot(1, 0, -x, 0);
    }   // top right
    return new go.Spot(1, 0, -x - (s - 2) * BpmnConstantsClass.EventNodeSize, 0);    // top ... right-to-left-ish spread
  }

  groupStyle() {  // common settings for both Lane and Pool Groups
    return [
      {
        layerName: 'Background',  // all pools and lanes are always behind all nodes and links
        background: 'transparent',  // can grab anywhere in bounds
        movable: true, // allows users to re-order by dragging
        copyable: false,  // can't copy lanes or pools
        avoidable: false  // don't impede AvoidsNodes routed Links
      },
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify)
    ];
  }

  // hide links between lanes when either lane is collapsed
  updateCrossLaneLinks(group: go.Group) {
    group.findExternalLinksConnected().each((l) => {
      l.visible = (l.fromNode !== null && l.fromNode.isVisible() && l.toNode !== null && l.toNode.isVisible());
    });
  }

  // Add a lane to pool (lane parameter is lane above new lane)
  addLaneEvent(pool: go.Node) {
    this.myDiagram.startTransaction('addLane');
    if (pool != null && pool.data.category === 'Pool') {
      const laneElement = this.mService.paletteElements.find(e => PaletteElementModel.getProbableModellingConstruct(e) === 'Lane');
      const uuid = UUID.UUID();
      laneElement.tempUuid = uuid;
      // create a new lane data object
      const shape = pool.findObject('SHAPE');
      const size = new go.Size(shape ? shape.width : BpmnLaneHelpers.MINLENGTH, BpmnLaneHelpers.MINBREADTH);
      this.createElement(laneElement,
        {
          loc: go.Point.stringify(new go.Point(pool.location.x, pool.location.y)), // place below selection
          size: go.Size.stringify(size),
          group: pool.data.key
        } as AdditionalCreateOptions);
    }
    this.myDiagram.commitTransaction('addLane');
  }

  // set Default Sequence Flow (backslash From Arrow)
  setSequenceLinkDefaultFlow(obj: go.Link) {
    this.myDiagram.startTransaction('setSequenceLinkDefaultFlow');
    const model = this.myDiagram.model;
    model.setDataProperty(obj.data, 'isDefault', true);
    // Set all other links from the fromNode to be isDefault=null
    if (obj.fromNode !== null) {
      obj.fromNode.findLinksOutOf().each(function (link) {
        if (link !== obj && link.data.isDefault) {
          model.setDataProperty(link.data, 'isDefault', null);
        }
      });
    }
    this.myDiagram.commitTransaction('setSequenceLinkDefaultFlow');
  }

  // set Conditional Sequence Flow (diamond From Arrow)
  setSequenceLinkConditionalFlow(obj: go.Link) {
    this.myDiagram.startTransaction('setSequenceLinkConditionalFlow');
    const model = this.myDiagram.model;
    model.setDataProperty(obj.data, 'isDefault', false);
    this.myDiagram.commitTransaction('setSequenceLinkConditionalFlow');
  }

  // this is called after nodes have been moved or lanes resized, to layout all of the Pool Groups again
  relayoutDiagram() {
    this.myDiagram.layout.invalidateLayout();
    this.myDiagram.findTopLevelGroups().each(function (g) {
      if (g.category === 'Pool' && g.layout !== null) {
        g.layout.invalidateLayout();
      }
    });
    this.myDiagram.layoutDiagram();
  }

  // ------------------------------------------  Overview   ----------------------------------------------

  // const myOverview =
  //   $(go.Overview, 'myOverviewDiv',
  //     { observed: this.myDiagram, maxScale: 0.5, contentAlignment: go.Spot.Center });
  // // change color of viewport border in Overview
  // (myOverview.box.elt(0) as go.Shape).stroke = 'dodgerblue';


  // ------------------------------------------  Commands for this application  ----------------------------------------------

  // Add a port to the specified side of the selected nodes.   name is beN  (be0, be1)
  // evDim is 5 for Interrupting, 6 for non-Interrupting
  addActivityNodeBoundaryEvent(evType: number, evDim: number) {
    const self = this;
    this.myDiagram.startTransaction('addBoundaryEvent');
    this.myDiagram.selection.each(function (node) {
      // skip any selected Links
      if (!(node instanceof go.Node)) {
        return;
      }
      if (node.data && (node.data.category === 'activity' || node.data.category === 'subprocess')) {
        // compute the next available index number for the side
        let i = 0;
        const defaultPort = node.findPort('');
        // tslint:disable-next-line:max-line-length
        while (node.findPort('be' + i.toString()) !== defaultPort) {
          i++;
        }           // now this new port name is unique within the whole Node because of the side prefix
        const name = 'be' + i.toString();
        if (!node.data.boundaryEventArray) {
          self.myDiagram.model.setDataProperty(node.data, 'boundaryEventArray', []);
        }       // initialize the Array of port data if necessary
        // create a new port data object
        const newportdata = {
          portId: name,
          eventType: evType,
          eventDimension: evDim,
          color: 'white',
          alignmentIndex: i
          // if you add port data properties here, you should copy them in copyPortData above  ** BUG...  we don't do that.
        };
        // and add it to the Array of port data
        self.myDiagram.model.insertArrayItem(node.data.boundaryEventArray, -1, newportdata);
      }
    });
    this.myDiagram.commitTransaction('addBoundaryEvent');
  }

  convertGeometryToShape(geometry: string) {

    if (!geometry) {
      return null;
    }

    return $(go.Shape,
      {
        geometryString: geometry,
        fill: 'transparent',
        stroke: 'black',
        strokeWidth: 1.5,
        strokeCap: 'round'
      }
    );
  }


  ngOnInit(): void {
    this.mService.queryPaletteElements().pipe(take(1)).subscribe();
    this.loadModels();
    this.prepareModel();
    this.prepareCustomRelations();
  }

  private prepareCustomRelations() {
    // https://gojs.net/latest/samples/relationships.html
    this.pathPatterns.set('Single', 'M0 0 L1 0');
    this.pathPatterns.set('Double', 'M0 0 L1 0 M0 3 L1 3');
    this.pathPatterns.set('Triple', 'M0 0 L1 0 M0 3 L1 3 M0 6 L1 6');
    this.pathPatterns.set('Dash', 'M0 0 M3 0 L6 0');
    this.pathPatterns.set('DoubleDash', 'M0 0 M3 0 L6 0 M3 3 L6 3');
    this.pathPatterns.set('Dot', 'M0 0 M4 0 L4.1 0');
    this.pathPatterns.set('DoubleDot', 'M0 0 M4 0 L4.1 0 M4 3 L4.1 3');
    this.pathPatterns.set('BackSlash', 'M0 3 L2 6 M1 0 L5 6 M4 0 L6 3');
    this.pathPatterns.set('Slash', 'M0 3 L2 0 M1 6 L5 0 M4 6 L6 3');
    this.pathPatterns.set('Coil', 'M0 0 C2.5 0  5 2.5  5 5  C5 7.5  5 10  2.5 10  C0 10  0 7.5  0 5  C0 2.5  2.5 0  5 0');
    this.pathPatterns.set('Square', 'M0 0 M1 0 L7 0 7 6 1 6z');
    this.pathPatterns.set('Circle', 'M0 3 A3 3 0 1 0 6 4  A3 3 0 1 0 0 3');
    this.pathPatterns.set('BigCircle', 'M0 5 A5 5 0 1 0 10 5  A5 5 0 1 0 0 5');
    this.pathPatterns.set('Triangle', 'M0 0 L4 4 0 8z');
    this.pathPatterns.set('Diamond', 'M0 4 L4 0 8 4 4 8z');
    this.pathPatterns.set('Dentil', 'M0 0 L2 0  2 6  6 6  6 0  8 0');
    this.pathPatterns.set('Greek', 'M0 0 L1 0  1 3  0 3  M0 6 L4 6  4 0  8 0  M8 3 L7 3  7 6  8 6');
    this.pathPatterns.set('Seed', 'M0 0 A9 9 0 0 0 12 0  A9 9 180 0 0 0 0');
    this.pathPatterns.set('SemiCircle', 'M0 0 A4 4 0 0 1 8 0');
    this.pathPatterns.set('BlindHem', 'M0 4 L2 4  4 0  6 4  8 4');
    this.pathPatterns.set('Zipper', 'M0 4 L1 4 1 0 8 0 8 4 9 4  M0 6 L3 6 3 2 6 2 6 6 9 6');
    this.pathPatterns.set('Herringbone', 'M0 2 L2 4 0 6  M2 0 L4 2  M4 6 L2 8');
    this.pathPatterns.set('Sawtooth', 'M0 3 L4 0 2 6 6 3');
  }


  private prepareModel() {
    this.activatedRoute.queryParams
      .pipe(filter(params => !!params && params.id),
        switchMap((params) => {
          if (params.id) {
            this.selectedModel = new Model();
            this.selectedModel.id = params.id;
            this.selectedModel.label = params.label;
            return this.mService.getElements(params.id);
          }
          return of(null);
        }),
        takeUntil(this.destroy$))
      .subscribe(elements => {
          this.selectedModel.goJsModel = new go.GraphLinksModel();
          this.prepareModelElements(this.selectedModel, elements);
          console.log(this.selectedModel);
          this.selectionChanged();
        }
      );
  }

  private prepareModelElements(model: Model, value: ModelElementDetail[]) {
    model.elements = value;

    model.elements.forEach(element => {
      if (element.modelElementType === 'ModelingRelation') {
        const linkData = {
          key: element.id,
          element: element,
          text: element.label ?? ' ',
          fromArrow: element.fromArrow || '',
          toArrow: element.toArrow || '',
          from: this.findShapeById(model.elements, element.fromShape),
          to: this.findShapeById(model.elements, element.toShape),
          pathPattern: this.pathPatterns.get(element.arrowStroke),
          shapeRepresentsModel: element.shapeRepresentsModel,
          otherVisualisationsOfSameLanguageConstruct: element.otherVisualisationsOfSameLanguageConstruct,
          routing: go.Link.Orthogonal
        };

        if (element.fromArrow !== undefined) {
          linkData.fromArrow = element.fromArrow;
        }

        if (element.toArrow !== undefined) {
          linkData.toArrow = element.toArrow;
        }

        this.bpmnTemplateService.addGoJsBPMNLinkFields(linkData, element);

        model.goJsModel.addLinkData(linkData);

      } else if (element.modelElementType === 'ModelingElement') {
        const nodeData = {
          text: element.label,
          key: element.id,
          fill: '#0000',
          source: VariablesSettings.IMG_ROOT + element.imageUrl,
          size: new go.Size(element.width, element.height),
          width: element.width,
          height: element.height,
          alignment: go.Spot.Center,
          loc: go.Point.stringify(new go.Point(element.x, element.y)),
          element: element,
          shapeRepresentsModel: element.shapeRepresentsModel,
          otherVisualisationsOfSameLanguageConstruct: element.otherVisualisationsOfSameLanguageConstruct,
          modelingLanguageConstructInstance: element.modelingLanguageConstructInstance
        };

        this.bpmnTemplateService.addGoJsBPMNNodeFields(nodeData, element.modellingLanguageConstruct);

        model.goJsModel.addNodeData(nodeData);
      } else if (element.modelElementType === 'ModelingContainer') {

        const nodeData = {
          text: element.label,
          key: element.id,
          fill: '#0000',
          source: VariablesSettings.IMG_ROOT + element.imageUrl,
          size: new go.Size(element.width, element.height),
          width: element.width,
          height: element.height,
          alignment: go.Spot.Bottom,
          loc: go.Point.stringify(new go.Point(element.x, element.y)),
          element: element,
          shapeRepresentsModel: element.shapeRepresentsModel,
          otherVisualisationsOfSameLanguageConstruct: element.otherVisualisationsOfSameLanguageConstruct,
          isGroup: true,
        };

        this.bpmnTemplateService.addGoJsBPMNGroupFields(nodeData, element.modellingLanguageConstruct);

        model.goJsModel.addNodeData(nodeData);
      }

    });

    model.elements.forEach(modelElement => {
      if (modelElement.modelElementType === 'ModelingContainer') {
        const containedElements = modelElement.containedShapes || [];
        containedElements.forEach(element => {
          let data = model.goJsModel.nodeDataArray.find(nodeData => nodeData.element.modelingLanguageConstructInstance === element);
          if (data == null) {
            data = model.goJsModel.linkDataArray.find(nodeData => nodeData.element.modelingLanguageConstructInstance === element);
          }
          if (data != null) {
            data.group = modelElement.id;
            data.element.group = modelElement.id;
          }
        });
      }
    });
  }

  private findShapeById(modelElements: ModelElementDetail[], shapeId: string) {

    const modelElement = modelElements.find(diag => diag.modelingLanguageConstructInstance === shapeId);
    if (modelElement !== undefined) {
      return modelElement.id;
    }

    return undefined;
  }

  private navigateToLinkedModel() {
    return (e, obj) => {
      const node = obj.part;
      if (node != null) {
        console.log(node);
        const element = node.data.element;
        const foundModel = this.models.find(m => m.id === element.shapeRepresentsModel);

        if (!foundModel) {
          return;
        }
        const navExtras = {
          queryParams: {
            id: foundModel.id,
            label: foundModel.label
          }
        } as NavigationExtras;
        this.router.navigate(['/modeller'], navExtras);
      }
    };
  }


  private handleNodePaste(txn: any) {
    // TODO handle case when several elements are copied (including containers and links)
    const data = txn.changes.toArray().find(change => change.propertyName = 'nodeDataArray').newValue;
    const element = data.element;

    const paletteConstructName = element.paletteConstruct.split(':')[1];
    const key = paletteConstructName + '_Shape_' + UUID.UUID();

    this.myDiagram.model.setKeyForNodeData(data, key);
    const newElement = Object.assign({}, element); // apparently copying leads to referencing the same element from both data objects...
    newElement.id = key;
    const newNodeData = this.myDiagram.model.findNodeDataForKey(key);
    newNodeData.element = newElement;

    this.mService.copyElement(
      newElement,
      this.selectedModel.id
    ).then(response => {
      const nodeToManipulate = this.myDiagram.model.findNodeDataForKey(key);
      this.myDiagram.model.setDataProperty(nodeToManipulate, 'otherVisualisationsOfSameLanguageConstruct', response.otherVisualisationsOfSameLanguageConstruct);
      nodeToManipulate.element = response;

      response.otherVisualisationsOfSameLanguageConstruct.forEach(otherElementDataKey => {
        const otherNodeData = this.myDiagram.model.findNodeDataForKey(otherElementDataKey);
        if (otherNodeData) {
          const otherElements = otherNodeData.element.otherVisualisationsOfSameLanguageConstruct && otherNodeData.element.otherVisualisationsOfSameLanguageConstruct.slice() || [];
          otherElements.push(response.id);
          this.myDiagram.model.setDataProperty(otherNodeData, 'otherVisualisationsOfSameLanguageConstruct', otherElements);
          otherNodeData.element.otherVisualisationsOfSameLanguageConstruct = otherElements;
        }
      });
    });
  }

  private handleNodeResizing(txn: any) {

    // resizing should only be affecting one element, we are not interested in the others
    const latestChange = _.last(txn.changes.toArray().filter(change => change.propertyName === 'size'));
    const modelElement = latestChange.object.element;
    modelElement.width = Math.trunc(Number.parseInt(latestChange.newValue.split(' ')[0], 10));
    modelElement.height = Math.trunc(Number.parseInt(latestChange.newValue.split(' ')[1], 10));
    latestChange.object.width = modelElement.width;
    latestChange.object.height = modelElement.height;

    this.mService.updateElement(modelElement, this.selectedModel.id);
  }

  private handleNodeDeleted(txn) {
    txn.changes.toArray().filter(element => element.propertyName === 'parts').forEach(evt => {
      this.mService.deleteElement(this.selectedModel.id, evt.oldValue.data.element.id);
    });
    // TODO for all elements which contained this shape, remove them
    // for()
    //   grp.data.element.containedShapes = containedShapes;
    // if (p.data.element.group) {
    //   const oldLane = self.myDiagram.model.findNodeDataForKey(p.data.element.group);
    //   if (oldLane) {
    //     const indexToRemove = oldLane.element.containedShapes.indexOf(p.data.element.id);
    //     if (indexToRemove >= 0) {
    //       oldLane.element.containedShapes.splice(indexToRemove);
    //       self.mService.updateElement(oldLane.element, self.selectedModel.id);
    //     }
    //   }
    // }
  }

  private handleNodeTextEditing(txn) {
    const nodeData = txn.changes.iteratorBackwards.first().object;
    if (!nodeData || !nodeData.element) {
      console.error('couldn\'t edit text because element was undefined');
      return;
    }
    const modelElement: ModelElementDetail = nodeData.element;
    modelElement.label = nodeData.text;

    this.mService.updateElement(modelElement, this.selectedModel.id);
  }

  private handleNodeLinking(txn) {
    const change = txn.changes.toArray().find(element => element.propertyName === 'data');
    const link = this.myDiagram.findLinkForData(change.object.data);

    if ((this.selectedConnectorMode === undefined || this.selectedConnectorMode.arrowStroke === undefined) && link.category === 'customLink') {
      // @ts-ignore
      this.myDiagram.model.removeLinkData(link.data);
      this.snackBar.open('You need to select a Connector from the bottom left corner of the palette when connecting custom elements', 'Close', {
        duration: 5000
      });
      return;
    }

    let id;
    if (link.category === 'customLink') {
      id = this.selectedConnectorMode.id.split('#')[1];
      link.data.toArrow = this.selectedConnectorMode.toArrow || '';
      link.data.fromArrow = this.selectedConnectorMode.fromArrow || '';
      link.data.routing = this.selectedConnectorMode.routing || '';
      link.data.pathPattern = this.pathPatterns.get(this.selectedConnectorMode.arrowStroke);
    } else {
      Mappers.dictionaryGoJsAOAMELinkIdToLinkCategory.forEach((value, key, map) => {
        if (value === link.category) {
          id = key + '_BPMN';
        }
      });
    }
    if (!id) {
      return;
    }

    const fromElement = change.newValue.from;
    const toElement = change.newValue.to;

    this.mService.createConnection(
      this.selectedModel.id,
      UUID.UUID(),
      change.object.location.x,
      change.object.location.y,
      fromElement,
      toElement,
      id,
      this.selectedInstantiationType
    ).then(response => {
      link.data.element = response;
    });

    this.myDiagram.rebuildParts();
  }

  private handleNodeMove(txn) {
    const lastMovedNodes = new Map();

    txn.changes.toArray()
      .filter(evt => ['location', 'position'].includes(evt.propertyName))
      .forEach(evt => {

        const nodeData = evt.object;

        const modelElement: ModelElementDetail = nodeData.data.element;
        modelElement.x = Math.trunc(nodeData.location.x);
        modelElement.y = Math.trunc(nodeData.location.y);
        nodeData.data.loc = new go.Point(modelElement.x, modelElement.y);

        lastMovedNodes.set(
          modelElement.id,
          {
            modelElementDetail: modelElement,
            node: nodeData.data
          }
        );
      });

    lastMovedNodes.forEach(nodeInfo => {
      if (nodeInfo.modelElementDetail.modelElementType === 'ModelingElement' || nodeInfo.modelElementDetail.modelElementType === 'ModelingContainer') {
        this.updateContainerInformationIfNeeded(nodeInfo);
        this.mService.updateElement(nodeInfo.modelElementDetail, this.selectedModel.id);
      }
    });

    this.myDiagram.rebuildParts();
  }

  private updateContainerInformationIfNeeded(nodeInfo) {
    if (nodeInfo.node.element.modellingLanguageConstruct === 'Pool' || nodeInfo.node.element.modellingLanguageConstruct === 'Lane') {
      return;
    }

    const initialContainerKey = nodeInfo.node.group;


    // check if element has been moved inside any of the containers and update those
    const overlappedContainers: ModelElementDetail[] = [];

    this.myDiagram.model.nodeDataArray.forEach(containerNode => {
      if (
        // @ts-ignore
        containerNode.element.modelElementType === 'ModelingContainer' && nodeInfo.modelElementDetail.id != containerNode.element.id &&
        this.isNodeInContainer(containerNode, nodeInfo.modelElementDetail)
      ) {
        // @ts-ignore
        overlappedContainers.push(containerNode.element);
      }
    });

    let mostSpecificContainer: ModelElementDetail;
    overlappedContainers.forEach(value => {
      if (mostSpecificContainer === undefined) {
        mostSpecificContainer = value;
      }
      if (mostSpecificContainer.containedShapes !== undefined && mostSpecificContainer.containedShapes.includes(value.modelingLanguageConstructInstance)) {
        mostSpecificContainer = value;
      }
    });

    if (mostSpecificContainer && (mostSpecificContainer.modellingLanguageConstruct === 'Pool' || mostSpecificContainer.modellingLanguageConstruct === 'Lane')) {
      return;
    }

    if (nodeInfo.node.element.group !== undefined &&
      ((mostSpecificContainer !== undefined && nodeInfo.node.element.group !== mostSpecificContainer.id) || // moved to another container
        (mostSpecificContainer === undefined)) // moved out of the container into the open space
    ) {
      this.removeElementFromContainer(nodeInfo.node.element.group, nodeInfo.modelElementDetail.modelingLanguageConstructInstance);
      delete nodeInfo.node.group;
      delete nodeInfo.node.element.group;
    }

    if (mostSpecificContainer !== undefined) {
      nodeInfo.node.group = mostSpecificContainer.id;
      const containedShapes = mostSpecificContainer.containedShapes || [];
      if (!containedShapes.includes(nodeInfo.modelElementDetail.modelingLanguageConstructInstance)) {
        containedShapes.push(nodeInfo.modelElementDetail.modelingLanguageConstructInstance);
        mostSpecificContainer.containedShapes = containedShapes;
        this.mService.updateElement(mostSpecificContainer, this.selectedModel.id);
      }
    }
  }

  private removeElementFromContainer(groupKey, elementKey) {
    const containerNode = this.myDiagram.model.findNodeDataForKey(groupKey);
    _.remove(containerNode.element.containedShapes, s => s === elementKey);
    if (containerNode.element.containedShapes.length === 0) {
      delete containerNode.element.containedShapes;
    }
    this.mService.updateElement(containerNode.element, this.selectedModel.id);
  }

  private isNodeInContainer(containerNode, node) {
    return containerNode.element.x < node.x &&
      containerNode.element.x + containerNode.element.width > node.x + node.width &&
      containerNode.element.y < node.y &&
      containerNode.element.y + containerNode.element.height > node.y + node.height;
  }

  selectionChanged() {

    if (this.myDiagram === undefined) {
      this.initDiagramCanvas();
    }

    if (this.selectedModel !== undefined) {
      if (this.selectedModel.goJsModel !== undefined) {
        this.myDiagram.model = new go.GraphLinksModel(this.selectedModel.goJsModel.nodeDataArray, this.selectedModel.goJsModel.linkDataArray);
      } else {
        this.myDiagram.model = new go.GraphLinksModel();
        this.selectedModel.goJsModel = this.myDiagram.model;
      }
    }
    this.relayoutDiagram();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.new_element && changes.new_element.currentValue && this.selectedModel) {

      if (changes.new_element.currentValue.type === 'PaletteConnector') {
        this.setConnectorMode(changes.new_element.currentValue);
      } else {
        this.createElement(changes.new_element.currentValue);
      }
    }
  }

  setConnectorMode(element: PaletteElementModel) {
    this.selectedConnectorMode = element;
  }

  createElement(element: PaletteElementModel, additionalCreateOptions?: AdditionalCreateOptions) {
    console.log('category is: ' + element.paletteCategory);
    console.log(VariablesSettings.paletteCategoryConnectorsURI);
    console.log('instantiation type ' + this.selectedInstantiationType);
    /*
    if (element.paletteCategory === VariablesSettings.paletteCategoryConnectorsURI) {
      this.connectorModeOn = true;
      console.log('connector mode: ' + this.connectorModeOn);
      this.connectorId = element.uuid;

      myDiagram.model.addLinkData({ from: 1, to: 2 });
      //myDiagram.model = model;
      console.log("added link");

      return null;
    }
    */

    if (this.myDiagram === undefined) {
      this.initDiagramCanvas();
    }

    const elementId = element.uuid;
    const nodeId = '#' + elementId;
    console.log('icon url is: ' + VariablesSettings.IMG_ROOT + (element.paletteCategory).split('#')[1] + '/' + element.imageURL);
    const imageURL = VariablesSettings.IMG_ROOT + (element.paletteCategory).split('#')[1] + '/' + element.imageURL;

    console.log('shape: ' + element.shape + ' label: ' + element.label + 'bg color: ' + element.backgroundColor);

    this.myDiagram.startTransaction('Add State');

    console.log('Palette category: ' + element.paletteCategory);

    const elementKey = element.id.split('#')[1] + '_Shape_' + element.tempUuid;

    const toData = {
      text: element.label,
      key: elementKey,
      fill: '#0000',
      source: imageURL,
      size: new go.Size(element.width, element.height),
      width: element.width,
      height: element.height,
      alignment: go.Spot.Center,
      shapeRepresentsModel: undefined
    };

    // add the new node data to the model
    const model = this.myDiagram.model;

    if (PaletteElementModel.getProbableElementType(element) === 'ModelingElement') {
      this.bpmnTemplateService.addGoJsBPMNNodeFields(toData, PaletteElementModel.getProbableModellingConstruct(element));
    } else if (PaletteElementModel.getProbableElementType(element) === 'ModelingContainer') {
      const probableModellingConstruct = PaletteElementModel.getProbableModellingConstruct(element);
      this.bpmnTemplateService.addGoJsBPMNGroupFields(toData, probableModellingConstruct);
    }

    if (additionalCreateOptions) {
      this.bpmnTemplateService.addAdditionalCreateOptions(toData, additionalCreateOptions);
    }

    model.addNodeData(toData);

    const newnode = this.myDiagram.findNodeForData(toData);
    this.myDiagram.select(newnode);

    this.mService.createElement(
      this.selectedModel.id,
      elementKey,
      newnode.part.data.text,
      newnode.location.x,
      newnode.location.y,
      element.id.split('#')[1],
      this.selectedInstantiationType
    ).then(response => {
      newnode.part.data.element = response;

      this.myDiagram.commitTransaction('Add State');
      this.relayoutDiagram();

      const self = this;
      if (additionalCreateOptions && additionalCreateOptions.group) {
        self.setGroupPropertyForChildAndParent(newnode, additionalCreateOptions);
      }
    });
  }

  private setGroupPropertyForChildAndParent(newnode: go.Node, additionalCreateOptions: AdditionalCreateOptions) {
    const groupedNodes = new Map();
    // child
    groupedNodes.set(
      newnode.part.data.element.id,
      {
        modelElementDetail: newnode.part.data.element,
        node: newnode.part.data
      }
    );
    // parent
    const parentNode = this.myDiagram.findNodeForKey(additionalCreateOptions.group);
    groupedNodes.set(
      parentNode.data.element.id,
      {
        modelElementDetail: parentNode.data.element,
        node: parentNode.data
      }
    );

    const containedShapes = parentNode.data.element.containedShapes || [];
    if (!containedShapes.includes(newnode.data.element.modelingLanguageConstructInstance)) {
      containedShapes.push(newnode.data.element.modelingLanguageConstructInstance);
      parentNode.data.element.containedShapes = containedShapes;
      this.mService.updateElement(parentNode.data.element, this.selectedModel.id);
    }

    this.myDiagram.rebuildParts();
  }

  makePort(name, spot, output, input) {
    // the port is basically just a small transparent square
    return $(go.Shape, 'Circle',
      {
        fill: null,  // not seen, by default; set to a translucent gray by showSmallPorts, defined below
        stroke: null,
        desiredSize: new go.Size(7, 7),
        alignment: spot,  // align the port on the main Shape
        alignmentFocus: spot,  // just inside the Shape
        portId: name,  // declare this object to be a "port"
        fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
        fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
        cursor: 'pointer'  // show a different cursor to indicate potential link point
      });
  }

  getInstantiationTypes(): InstantiationTargetType[] {
    return _.values(InstantiationTargetType);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadModels() {
    this.mService.getModels().pipe(take(1)).subscribe(models => {
      this.models = models;
    });
  }

  // custom figures for Shapes
  private initDiagramCanvas() {
    const self = this;

    const figuresClass = new FiguresClass();
    figuresClass.defineShapes();

    // define the appearance of tooltips, shared by various templates
    const tooltiptemplate = this.bpmnTemplateService.getTooltipTemplate();

    // ------------------------------------------  Activity Node Boundary Events   ----------------------------------------------

    const boundaryEventMenu =  // context menu for each boundaryEvent on Activity node
      $('ContextMenu',
        $('ContextMenuButton',
          $(go.TextBlock, 'Remove event'),
          // in the click event handler, the obj.part is the Adornment; its adornedObject is the port
          {
            click: function (e: go.InputEvent, obj: go.GraphObject) {
              self.removeActivityNodeBoundaryEvent((obj.part as go.Adornment).adornedObject);
            }
          })
      );

    const boundaryEventItemTemplate =
      $(go.Panel, 'Spot',
        {
          contextMenu: boundaryEventMenu,
          alignmentFocus: go.Spot.Center,
          fromLinkable: true, toLinkable: false, cursor: 'pointer', fromSpot: go.Spot.Bottom,
          fromMaxLinks: 1, toMaxLinks: 0
        },
        new go.Binding('portId', 'portId'),
        new go.Binding('alignment', 'alignmentIndex', this.nodeActivityBESpotConverter),
        $(go.Shape, 'Circle',
          {desiredSize: new go.Size(BpmnConstantsClass.EventNodeSize, BpmnConstantsClass.EventNodeSize)},
          new go.Binding('strokeDashArray', 'eventDimension', function (s) {
            return (s === 6) ? [4, 2] : null;
          }),
          new go.Binding('fromSpot', 'alignmentIndex',
            function (s) {
              //  nodeActivityBEFromSpotConverter, 0 & 1 go on bottom, all others on top of activity
              if (s < 2) {
                return go.Spot.Bottom;
              }
              return go.Spot.Top;
            }),
          new go.Binding('fill', 'color')),
        $(go.Shape, 'Circle',
          {
            alignment: go.Spot.Center,
            desiredSize: new go.Size(BpmnConstantsClass.EventNodeInnerSize, BpmnConstantsClass.EventNodeInnerSize),
            fill: null
          },
          new go.Binding('strokeDashArray', 'eventDimension', function (s) {
            return (s === 6) ? [4, 2] : null;
          })
        ),
        $(go.Shape, 'NotAllowed',
          {
            alignment: go.Spot.Center,
            desiredSize: new go.Size(BpmnConstantsClass.EventNodeSymbolSize, BpmnConstantsClass.EventNodeSymbolSize),
            fill: 'white'
          },
          new go.Binding('figure', 'eventType', this.bpmnTemplateService.nodeEventTypeConverter)
        )
      );

    // ------------------------------------------  Activity Node contextMenu   ----------------------------------------------

    const activityNodeMenu =
      $('ContextMenu',
        $('ContextMenuButton',
          $(go.TextBlock, 'Add Email Event', {margin: 3}),
          {
            click: function (e: go.InputEvent, obj: go.GraphObject) {
              self.addActivityNodeBoundaryEvent(2, 5);
            }
          }),
        $('ContextMenuButton',
          $(go.TextBlock, 'Add Timer Event', {margin: 3}),
          {
            click: function (e: go.InputEvent, obj: go.GraphObject) {
              self.addActivityNodeBoundaryEvent(3, 5);
            }
          }),
        $('ContextMenuButton',
          $(go.TextBlock, 'Add Escalation Event', {margin: 3}),
          {
            click: function (e: go.InputEvent, obj: go.GraphObject) {
              self.addActivityNodeBoundaryEvent(4, 5);
            }
          }),
        $('ContextMenuButton',
          $(go.TextBlock, 'Add Error Event', {margin: 3}),
          {
            click: function (e: go.InputEvent, obj: go.GraphObject) {
              self.addActivityNodeBoundaryEvent(7, 5);
            }
          }),
        $('ContextMenuButton',
          $(go.TextBlock, 'Add Signal Event', {margin: 3}),
          {
            click: function (e: go.InputEvent, obj: go.GraphObject) {
              self.addActivityNodeBoundaryEvent(10, 5);
            }
          }),
        $('ContextMenuButton',
          $(go.TextBlock, 'Add N-I Escalation Event', {margin: 3}),
          {
            click: function (e: go.InputEvent, obj: go.GraphObject) {
              self.addActivityNodeBoundaryEvent(4, 6);
            }
          }));


    const activityNodeTemplate =
      $(go.Node, 'Spot',
        {
          locationObjectName: 'SHAPE', locationSpot: go.Spot.Center,
          resizable: true, resizeObjectName: 'PANEL',
          toolTip: tooltiptemplate,
          selectionAdorned: false,  // use a Binding on the Shape.stroke to show selection
          contextMenu: activityNodeMenu,
          itemTemplate: boundaryEventItemTemplate
        },
        new go.Binding('itemArray', 'boundaryEventArray'),
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Auto',
          {
            name: 'PANEL',
            minSize: new go.Size(BpmnConstantsClass.ActivityNodeWidth, BpmnConstantsClass.ActivityNodeHeight),
            desiredSize: new go.Size(BpmnConstantsClass.ActivityNodeWidth, BpmnConstantsClass.ActivityNodeHeight)
          },
          new go.Binding('desiredSize', 'size').makeTwoWay(go.Size.stringify),
          $(go.Panel, 'Spot',
            $(go.Shape, 'RoundedRectangle',  // the outside rounded rectangle
              {
                name: 'SHAPE',
                fill: BpmnConstantsClass.ActivityNodeFill, stroke: BpmnConstantsClass.ActivityNodeStroke,
                parameter1: 10, // corner size
                portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide
              },
              new go.Binding('fill', 'color'),
              new go.Binding('strokeWidth', 'isCall',
                function (s) {
                  return s ? BpmnConstantsClass.ActivityNodeStrokeWidthIsCall : BpmnConstantsClass.ActivityNodeStrokeWidth;
                })
            ),
            //        $(go.Shape, "RoundedRectangle",  // the inner "Transaction" rounded rectangle
            //          { margin: 3,
            //            stretch: go.GraphObject.Fill,
            //            stroke: this.ActivityNodeStroke,
            //            parameter1: 8, fill: null, visible: false
            //          },
            //          new go.Binding("visible", "isTransaction")
            //         ),
            // task icon

            $(go.Shape, 'BpmnTaskScript',    // will be None, Script, Manual, Service, etc via converter
              {
                alignment: new go.Spot(0, 0, 5, 5), alignmentFocus: go.Spot.TopLeft,
                width: 22, height: 22
              },
              new go.Binding('fill', 'taskType', this.bpmnTemplateService.nodeActivityTaskTypeColorConverter),
              new go.Binding('figure', 'taskType', this.bpmnTemplateService.nodeActivityTaskTypeConverter)
            ), // end Task Icon
            this.bpmnTemplateService.makeMarkerPanel(false, 1) // sub-process,  loop, parallel, sequential, ad doc and compensation markers
          ),  // end main body rectangles spot panel
          self.getArrowShape(),
          $(go.TextBlock,  // the center text
            {
              alignment: go.Spot.Center, textAlign: 'center', margin: 12,
              editable: true
            },
            new go.Binding('text').makeTwoWay())
        )  // end Auto Panel
      );  // end go.Node, which is a Spot Panel with bound itemArray


    // ------------------------------------------  Event Node Template  ----------------------------------------------

    const eventNodeTemplate = this.bpmnTemplateService.getEventNodeTemplate(tooltiptemplate, 1, self.getArrowShape());

    // ------------------------------------------  Gateway Node Template   ----------------------------------------------
    const gatewayNodeTemplate =
      $(go.Node, 'Vertical',
        {
          locationObjectName: 'SHAPE',
          locationSpot: go.Spot.Center,
          toolTip: tooltiptemplate
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        // can be resided according to the user's desires
        {resizable: false, resizeObjectName: 'SHAPE'},

        $(go.Panel, 'Spot',

          $(go.Shape, 'Diamond',
            {
              strokeWidth: 1, fill: BpmnConstantsClass.GatewayNodeFill, stroke: BpmnConstantsClass.GatewayNodeStroke,
              name: 'SHAPE',
              desiredSize: new go.Size(BpmnConstantsClass.GatewayNodeSize, BpmnConstantsClass.GatewayNodeSize),
              portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
              fromSpot: go.Spot.NotLeftSide, toSpot: go.Spot.NotRightSide
            },
            //new go.Binding('desiredSize', 'size').makeTwoWay(go.Size.stringify)  // end main shape
          ),
          $(go.Shape, 'NotAllowed',
            {
              alignment: go.Spot.Center,
              stroke: BpmnConstantsClass.GatewayNodeSymbolStroke,
              fill: BpmnConstantsClass.GatewayNodeSymbolFill
            },
            new go.Binding('figure', 'gatewayType', (s) => self.bpmnTemplateService.nodeGatewaySymbolTypeConverter(s)),
            // new go.Binding("visible", "gatewayType", function(s) { return s !== 4; }),   // comment out if you want exclusive gateway to be X instead of blank.
            new go.Binding('strokeWidth', 'gatewayType', function (s) {
              return (s <= 4) ? BpmnConstantsClass.GatewayNodeSymbolStrokeWidth : 1;
            }),
            new go.Binding('desiredSize', 'gatewayType', (s) => self.bpmnTemplateService.nodeGatewaySymbolSizeConverter(s))),
          // the next 2 circles only show up for event gateway
          $(go.Shape, 'Circle',  // Outer circle
            {
              strokeWidth: 1,
              stroke: BpmnConstantsClass.GatewayNodeSymbolStroke,
              fill: null,
              desiredSize: new go.Size(BpmnConstantsClass.EventNodeSize, BpmnConstantsClass.EventNodeSize)
            },
            new go.Binding('visible', 'gatewayType', function (s) {
              return s >= 5;
            }) // only visible for > 5
          ),  // end main shape
          $(go.Shape, 'Circle',  // Inner circle
            {
              alignment: go.Spot.Center, stroke: BpmnConstantsClass.GatewayNodeSymbolStroke,
              desiredSize: new go.Size(BpmnConstantsClass.EventNodeInnerSize, BpmnConstantsClass.EventNodeInnerSize),
              fill: null
            },
            new go.Binding('visible', 'gatewayType', function (s) {
              return s === 5;
            }) // inner  only visible for == 5
          ),
          self.getArrowShape(),
        ),
        $(go.TextBlock,
          {alignment: go.Spot.Center, textAlign: 'center', margin: 5, editable: true},
          new go.Binding('text').makeTwoWay())
      ); // end go.Node Vertical


    // --------------------------------------------------------------------------------------------------------------

    const annotationNodeTemplate = this.bpmnTemplateService.getAnnotationNodeTemplate(self.getArrowShape());

    const dataObjectNodeTemplate = this.bpmnTemplateService.getDataObjectNodeTemplate(self.getArrowShape());

    const dataStoreNodeTemplate = this.bpmnTemplateService.getDataStoreNodeTemplate(self.getArrowShape());

    // ------------------------------------------  private process Node Template Map   ----------------------------------------------

    const privateProcessNodeTemplate =
      $(go.Node, 'Auto',
        {layerName: 'Background', resizable: true, resizeObjectName: 'LANE'},
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, 'Rectangle',
          {fill: null}),
        $(go.Panel, 'Table',     // table with 2 cells to hold header and lane
          {
            desiredSize: new go.Size(BpmnConstantsClass.ActivityNodeWidth * 6, BpmnConstantsClass.ActivityNodeHeight),
            background: BpmnConstantsClass.DataFill,
            name: 'LANE',
            minSize: new go.Size(BpmnConstantsClass.ActivityNodeWidth, BpmnConstantsClass.ActivityNodeHeight * 0.667)
          },
          new go.Binding('desiredSize', 'size').makeTwoWay(go.Size.stringify),
          $(go.TextBlock,
            {
              row: 0, column: 0,
              angle: 270, margin: 5,
              editable: true, textAlign: 'center'
            },
            new go.Binding('text').makeTwoWay()),
          $(go.RowColumnDefinition, {column: 1, separatorStrokeWidth: 1, separatorStroke: 'black'}),
          $(go.Shape, 'Rectangle',
            {
              row: 0, column: 1,
              stroke: null, fill: 'transparent',
              portId: '', fromLinkable: true, toLinkable: true,
              fromSpot: go.Spot.TopBottomSides, toSpot: go.Spot.TopBottomSides,
              cursor: 'pointer', stretch: go.GraphObject.Fill
            })
        )
      );


    const nodeSelectionAdornmentTemplate =
      $(go.Adornment, 'Auto',
        $(go.Shape, {fill: null, stroke: 'deepskyblue', strokeWidth: 1.5, strokeDashArray: [4, 2]}),
        $(go.Placeholder)
      );

    const customNodeTemplate =
      $(go.Node, 'Auto', // this resizes the entire shape
        {
          name: 'Node',
          locationSpot: go.Spot.Left,
          resizable: true,
          resizeObjectName: 'PANEL' // Changing this to Picture resizes the images, however links are a problem
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding('group', 'containedInContainer'),
        {selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate},
        new go.Binding('angle').makeTwoWay(),
        // the main object is a Panel that surrounds a TextBlock with a Shape

        $(go.Panel, 'Auto',
          {
            name: 'PANEL',
            angle: 0
          },
          new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
          new go.Binding('angle'),
          $(go.Shape, 'Rectangle',  // default figure
            {
              name: 'SHAPE',
              portId: '', // the default port: if no spot on link data, use closest side
              fromLinkable: true, toLinkable: true, cursor: 'pointer',
              fill: '#000000',  // default color
              // width: 835, height: 575,
              strokeWidth: 0
            },
            new go.Binding('fill')),
          new go.Binding('width'),
          new go.Binding('height'),
          $(go.Picture,
            {
              name: 'Picture',
              source: '/assets/images/BPMN-CMMN/Collapsed_Subprocess.png',
              margin: 4, // increase margin if text alignment is changed to bottom
              stretch: go.GraphObject.Fill // stretch image to fill whole area of shape
              // imageStretch: go.GraphObject.Fill //do not distort the image
            },
            new go.Binding('source'),
            new go.Binding('desiredSize')),
          self.getArrowShape(8),
          $(go.TextBlock,
            {
              font: '11pt Helvetica, Arial, sans-serif',
              margin: 8,
              maxSize: new go.Size(200, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true,
              alignment: go.Spot.Bottom // or go.Spot.Bottom
            },
            new go.Binding('text').makeTwoWay(),
            new go.Binding('alignment')
          )
        )
      );

    function convertFieldExistenceToLinkVisibility(obj) {
      return obj != undefined;
    }

    const subProcessGroupTemplate =
      $(go.Group, 'Spot',
        {
          locationSpot: go.Spot.Center,
          locationObjectName: 'PH',
          // locationSpot: go.Spot.Center,
          isSubGraphExpanded: false,
          subGraphExpandedChanged: function (grp: go.Group) {
            if (grp.isSubGraphExpanded) {
              grp.isSelected = true;
            }
            BpmnLaneHelpers.assignGroupLayer(grp);
          },
          selectionChanged: BpmnLaneHelpers.assignGroupLayer,
          computesBoundsAfterDrag: true,
          memberValidation: function (group: go.Group, part: go.Part) {
            return !(part instanceof go.Group) ||
              (part.category !== 'Pool' && part.category !== 'Lane');
          },
          mouseDrop: function (e: go.InputEvent, grp: go.GraphObject) {
            if (e.shift || !(grp instanceof go.Group) || grp.diagram === null) {
              return;
            }
            const ok = grp.addMembers(grp.diagram.selection, true);
            if (!ok) {
              grp.diagram.currentTool.doCancel();
            } else {
              BpmnLaneHelpers.assignGroupLayer(grp);
            }
          },
          contextMenu: activityNodeMenu,
          itemTemplate: boundaryEventItemTemplate,
          avoidable: false
        },
        new go.Binding('itemArray', 'boundaryEventArray'),
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Auto',
          $(go.Shape, 'RoundedRectangle',
            {
              name: 'PH', fill: BpmnConstantsClass.SubprocessNodeFill, stroke: BpmnConstantsClass.SubprocessNodeStroke,
              minSize: new go.Size(BpmnConstantsClass.ActivityNodeWidth, BpmnConstantsClass.ActivityNodeHeight),
              portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
              fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide
            },
            new go.Binding('strokeWidth', 'isCall', function (s) {
              return s ? BpmnConstantsClass.ActivityNodeStrokeWidthIsCall : BpmnConstantsClass.ActivityNodeStrokeWidth;
            })
          ),
          $(go.Panel, 'Vertical',
            {defaultAlignment: go.Spot.Left},
            $(go.TextBlock,  // label
              {margin: 3, editable: true},
              new go.Binding('text', 'text').makeTwoWay(),
              new go.Binding('alignment', 'isSubGraphExpanded', function (s) {
                return s ? go.Spot.TopLeft : go.Spot.Center;
              })),
            // create a placeholder to represent the area where the contents of the group are
            $(go.Panel, 'Auto',
              $(go.Shape, {opacity: 0.0}),
              $(go.Placeholder,
                {padding: new go.Margin(5, 5)})
            ),  // end nested Auto Panel
            this.bpmnTemplateService.makeMarkerPanel(true, 1)  // sub-process,  loop, parallel, sequential, ad doc and compensation markers
          )  // end Vertical Panel
        )  // end border Panel
      );  // end Group

    // ------------------------ Lanes and Pools ------------------------------------------------------------
    const laneEventMenu =  // context menu for each lane
      $('ContextMenu',
        $('ContextMenuButton',
          $(go.TextBlock, 'Add Lane'),
          // in the click event handler, the obj.part is the Adornment; its adornedObject is the port
          {
            click: function (e: go.InputEvent, obj: go.GraphObject) {
              self.addLaneEvent((obj.part as go.Adornment).adornedObject as go.Node);
            }
          }),
      );

    const swimLanesGroupTemplate =
      $(go.Group, 'Spot', this.groupStyle(),
        {
          name: 'Lane',
          minLocation: new go.Point(NaN, -Infinity),  // only allow vertical movement
          maxLocation: new go.Point(NaN, Infinity),
          selectionObjectName: 'SHAPE',  // selecting a lane causes the body of the lane to be highlit, not the label
          resizable: true, resizeObjectName: 'SHAPE',  // the custom resizeAdornmentTemplate only permits two kinds of resizing
          layout: $(go.LayeredDigraphLayout,  // automatically lay out the lane's subgraph
            {
              isInitial: false,  // don't even do initial layout
              isOngoing: false,  // don't invalidate layout when nodes or links are added or removed
              direction: 0,
              columnSpacing: 10,
              layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource
            }),
          computesBoundsAfterDrag: true,  // needed to prevent recomputing Group.placeholder bounds too soon
          computesBoundsIncludingLinks: false,  // to reduce occurrences of links going briefly outside the lane
          computesBoundsIncludingLocation: true,  // to support empty space at top-left corner of lane
          handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
          mouseDrop: function (e: go.InputEvent, grp: go.GraphObject) {  // dropping a copy of some Nodes and Links onto this Group adds them to this Group
            // don't allow drag-and-dropping a mix of regular Nodes and Groups
            if (!e.diagram.selection.any((n) => (n instanceof go.Group && n.category !== 'subprocess') || n.category === 'privateProcess')) {
              if (!(grp instanceof go.Group) || grp.diagram === null) {
                return;
              }
              const ok = grp.addMembers(grp.diagram.selection, true);
              const containedShapes = grp.data.element.containedShapes || [];
              if (ok) {
                self.updateCrossLaneLinks(grp);
                self.relayoutDiagram();
                grp.diagram.selection.each(p => {
                  if (!containedShapes.includes(p?.data?.element?.modelingLanguageConstructInstance)) {
                    containedShapes.push(p.data.element.modelingLanguageConstructInstance);
                    grp.data.element.containedShapes = containedShapes;
                    if (p.data.element.group) {
                      const oldLane = self.myDiagram.model.findNodeDataForKey(p.data.element.group);
                      if (oldLane) {
                        const indexToRemove = oldLane.element.containedShapes.indexOf(p.data.modelingLanguageConstructInstance);
                        if (indexToRemove >= 0) {
                          oldLane.element.containedShapes.splice(indexToRemove, 1);
                          self.mService.updateElement(oldLane.element, self.selectedModel.id);
                        }
                      }
                    }
                    self.mService.updateElement(grp.data.element, self.selectedModel.id);
                    p.data.element.group = grp.data.element.id;
                  }
                });
              } else {
                grp.diagram.currentTool.doCancel();
              }
            }
          },
          subGraphExpandedChanged: function (grp: go.Group) {
            if (grp.diagram === null) {
              return;
            }
            if (grp.diagram.undoManager.isUndoingRedoing) {
              return;
            }
            const shp = grp.resizeObject;
            if (grp.isSubGraphExpanded) {
              shp.height = grp.data.savedBreadth;
            } else {
              if (!isNaN(shp.height)) {
                grp.diagram.model.set(grp.data, 'savedBreadth', shp.height);
              }
              shp.height = NaN;
            }
            self.updateCrossLaneLinks(grp);
          }
        },
        // new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),

        $(go.Shape, 'Rectangle',  // this is the resized object
          {name: 'SHAPE', fill: 'white', stroke: null},  // need stroke null here or you gray out some of pool border.
          new go.Binding('fill', 'color'),
          new go.Binding('desiredSize', 'size').makeTwoWay(go.Size.stringify)),
        self.getArrowShape(),

        // the lane header consisting of a Shape and a TextBlock
        $(go.Panel, 'Horizontal',
          {
            name: 'HEADER',
            angle: 270,  // maybe rotate the header to read sideways going up
            alignment: go.Spot.LeftCenter, alignmentFocus: go.Spot.LeftCenter
          },
          $(go.TextBlock,  // the lane label
            {editable: true, margin: new go.Margin(2, 0, 0, 8)},
            new go.Binding('visible', 'isSubGraphExpanded').ofObject(),
            new go.Binding('text', 'text').makeTwoWay()),
          $('SubGraphExpanderButton', {margin: 4, angle: -270})  // but this remains always visible!
        ),  // end Horizontal Panel
        $(go.Placeholder,
          {padding: 12, alignment: go.Spot.TopLeft, alignmentFocus: go.Spot.TopLeft}),
        $(go.Panel, 'Horizontal', {alignment: go.Spot.TopLeft, alignmentFocus: go.Spot.TopLeft},
          $(go.TextBlock,  // this TextBlock is only seen when the swimlane is collapsed
            {
              name: 'LABEL',
              editable: true, visible: false,
              angle: 0, margin: new go.Margin(6, 0, 0, 20)
            },
            new go.Binding('visible', 'isSubGraphExpanded', function (e) {
              return !e;
            }).ofObject()),
          // TODO get vertical text working again. It will display , but the edit of the label won't work if you uncomment this
          // new go.Binding('text', 'text').makeTwoWay())
        )
      );  // end swimLanesGroupTemplate

    // define a custom resize adornment that has two resize handles if the group is expanded
    // this.myDiagram.groupTemplate.resizeAdornmentTemplate =
    swimLanesGroupTemplate.resizeAdornmentTemplate =
      $(go.Adornment, 'Spot',
        $(go.Placeholder),
        $(go.Shape,  // for changing the length of a lane
          {
            alignment: go.Spot.Right,
            desiredSize: new go.Size(7, 50),
            fill: 'lightblue', stroke: 'dodgerblue',
            cursor: 'col-resize'
          },
          new go.Binding('visible', '', function (ad) {
            if (ad.adornedPart === null) {
              return false;
            }
            return ad.adornedPart.isSubGraphExpanded;
          }).ofObject()),
        $(go.Shape,  // for changing the breadth of a lane
          {
            alignment: go.Spot.Bottom,
            desiredSize: new go.Size(50, 7),
            fill: 'lightblue', stroke: 'dodgerblue',
            cursor: 'row-resize'
          },
          new go.Binding('visible', '', function (ad) {
            if (ad.adornedPart === null) {
              return false;
            }
            return ad.adornedPart.isSubGraphExpanded;
          }).ofObject())
      );

    const poolGroupTemplate =
      $(go.Group, 'Auto', this.groupStyle(),
        {
          contextMenu: laneEventMenu,
          computesBoundsIncludingLinks: false,
          // use a simple layout that ignores links to stack the "lane" Groups on top of each other
          layout: $(PoolLayout, {spacing: new go.Size(0, 0)})  // no space between lanes
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape,
          {fill: 'white'},
          new go.Binding('fill', 'color')),
        $(go.Panel, 'Table',
          {defaultColumnSeparatorStroke: 'black'},
          self.getArrowShape(),
          $(go.Panel, 'Horizontal',
            {column: 0, angle: 270},
            $(go.TextBlock,
              {editable: true, margin: new go.Margin(5, 0, 5, 0)},  // margin matches private process (black box pool)
              new go.Binding('text').makeTwoWay())
          ),
          $(go.Placeholder,
            {background: 'darkgray', column: 1})
        )
      ); // end poolGroupTemplate

    const customGroupTemplate =
      $(go.Group, 'Auto',
        {
          name: 'GROUP',
          angle: 0,
          resizable: true,
          resizeObjectName: 'PANEL'
        },
        new go.Binding('location', 'loc'),
        new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
        new go.Binding('angle'),
        $(go.Shape, 'Rectangle',  // default figure
          {
            name: 'SHAPE',
            portId: '', // the default port: if no spot on link data, use closest side
            fromLinkable: true, toLinkable: true, cursor: 'pointer',
            fill: '#000000',  // default color
            // width: 835, height: 575,
            strokeWidth: 0
          },
          new go.Binding('fill')),
        new go.Binding('width'),
        new go.Binding('height'),
        $(go.Picture,
          {
            name: 'Picture',
            source: '/assets/images/BPMN-CMMN/Collapsed_Subprocess.png',
            margin: 4, // increase margin if text alignment is changed to bottom
            stretch: go.GraphObject.Fill // stretch image to fill whole area of shape
            // imageStretch: go.GraphObject.Fill //do not distort the image
          },
          new go.Binding('source'),
          new go.Binding('desiredSize')),
        self.getArrowShape(8),
        $(go.TextBlock,
          {
            font: '11pt Helvetica, Arial, sans-serif',
            margin: 8,
            maxSize: new go.Size(200, NaN),
            wrap: go.TextBlock.WrapFit,
            editable: true,
            alignment: go.Spot.Bottom // or go.Spot.Bottom
          },
          new go.Binding('text').makeTwoWay(),
          new go.Binding('alignment')
        )
      );

    // ------------------------------------------  Template Maps  ----------------------------------------------

    // create the nodeTemplateMap, holding main view node templates:
    const nodeTemplateMap = new go.Map<string, go.Node>();
    // for each of the node categories, specify which template to use
    nodeTemplateMap.add('activity', activityNodeTemplate);
    nodeTemplateMap.add('event', eventNodeTemplate);
    nodeTemplateMap.add('gateway', gatewayNodeTemplate);
    nodeTemplateMap.add('annotation', annotationNodeTemplate);
    nodeTemplateMap.add('dataobject', dataObjectNodeTemplate);
    nodeTemplateMap.add('datastore', dataStoreNodeTemplate);
    nodeTemplateMap.add('privateProcess', privateProcessNodeTemplate);
    nodeTemplateMap.add('customNode', customNodeTemplate);
    // for the default category, "", use the same template that Diagrams use by default
    // this just shows the key value as a simple TextBlock

    const groupTemplateMap = new go.Map<string, go.Group>();
    groupTemplateMap.add('subprocess', subProcessGroupTemplate);
    groupTemplateMap.add('Lane', swimLanesGroupTemplate);
    groupTemplateMap.add('Pool', poolGroupTemplate);
    groupTemplateMap.add('customGroup', customGroupTemplate);

    // ------------------------------------------  Link Templates   ----------------------------------------------

    const sequenceLinkTemplate =
      $(go.Link,
        {
          contextMenu:
            $('ContextMenu',
              $('ContextMenuButton',
                $(go.TextBlock, 'Default Flow'),
                // in the click event handler, the obj.part is the Adornment; its adornedObject is the port
                {
                  click: function (e: go.InputEvent, obj: go.GraphObject) {
                    self.setSequenceLinkDefaultFlow((obj.part as go.Adornment).adornedObject as go.Link);
                  }
                }),
              $('ContextMenuButton',
                $(go.TextBlock, 'Conditional Flow'),
                // in the click event handler, the obj.part is the Adornment; its adornedObject is the port
                {
                  click: function (e: go.InputEvent, obj: go.GraphObject) {
                    self.setSequenceLinkConditionalFlow((obj.part as go.Adornment).adornedObject as go.Link);
                  }
                })
            ),
          routing: go.Link.AvoidsNodes, curve: go.Link.JumpGap, corner: 10,
          // fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide,
          reshapable: true, relinkableFrom: true, relinkableTo: true, toEndSegmentLength: 20
        },
        new go.Binding('points').makeTwoWay(),
        $(go.Shape, {stroke: 'black', strokeWidth: 1}),
        $(go.Shape, {toArrow: 'Triangle', scale: 1.2, fill: 'black', stroke: null}),
        $(go.Shape, {fromArrow: '', scale: 1.5, stroke: 'black', fill: 'white'},
          new go.Binding('fromArrow', 'isDefault', function (s) {
            if (s === null) {
              return '';
            }
            return s ? 'BackSlash' : 'StretchedDiamond';
          }),
          new go.Binding('segmentOffset', 'isDefault', function (s) {
            return s ? new go.Point(5, 0) : new go.Point(0, 0);
          })),

        $(go.TextBlock, { // this is a Link label
            name: 'Label', editable: true, text: 'label', segmentOffset: new go.Point(-10, -10)
          },
          new go.Binding('text').makeTwoWay()),
        this.getArrowShape(0, new go.Point(25, -10)),
      );


    const messageFlowLinkTemplate =
      $(PoolLink, // defined in BPMNClasses.js
        {
          routing: go.Link.Orthogonal, curve: go.Link.JumpGap, corner: 10,
          fromSpot: go.Spot.TopBottomSides, toSpot: go.Spot.TopBottomSides,
          reshapable: true, relinkableTo: true, toEndSegmentLength: 20
        },
        new go.Binding('points').makeTwoWay(),
        $(go.Shape, {stroke: 'black', strokeWidth: 1, strokeDashArray: [6, 2]}),
        $(go.Shape, {toArrow: 'Triangle', scale: 1, fill: 'white', stroke: 'black'}),
        $(go.Shape, {fromArrow: 'Circle', scale: 1, visible: true, stroke: 'black', fill: 'white'}),
        this.getArrowShape(),
        $(go.TextBlock, {
            editable: true, text: 'label'
          }, // Link label
          new go.Binding('text').makeTwoWay()),
        this.getArrowShape(0, new go.Point(25, -10)),
      );

    const dataAssociationLinkTemplate =
      $(go.Link,
        {
          routing: go.Link.AvoidsNodes, curve: go.Link.JumpGap, corner: 10,
          fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
          reshapable: true, relinkableFrom: true, relinkableTo: true
        },
        new go.Binding('points').makeTwoWay(),

        $(go.Shape, {stroke: 'black', strokeWidth: 1, strokeDashArray: [1, 3]}),
        $(go.Shape, {toArrow: 'OpenTriangle', scale: 1, fill: null, stroke: 'blue'}),
        this.getArrowShape(0, new go.Point(25, -10)),
      );

    const annotationAssociationLinkTemplate =
      $(go.Link,
        {
          reshapable: true, relinkableFrom: true, relinkableTo: true,
          toSpot: go.Spot.AllSides,
          toEndSegmentLength: 20, fromEndSegmentLength: 40
        },
        new go.Binding('points').makeTwoWay(),
        $(go.Shape, {stroke: 'black', strokeWidth: 1, strokeDashArray: [1, 3]}),
        $(go.Shape, {toArrow: 'OpenTriangle', scale: 1, stroke: 'black'}),
        this.getArrowShape(0, new go.Point(25, -10)),
      );

    const customLinkTemplate =
      $(go.Link,  // the whole link panel
        new go.Binding('routing', 'routing'),
        $(go.Shape,  // the link shape
          {
            stroke: 'transparent',
            strokeWidth: 3
          },
          new go.Binding('pathPattern', 'pathPattern', this.convertGeometryToShape)
        ),
        $(go.Shape,  // the "from" arrowhead
          new go.Binding('fromArrow', 'fromArrow'),
          {scale: 2}),
        $(go.Shape,  // the "to" arrowhead
          new go.Binding('toArrow', 'toArrow'),
          {scale: 2}),
        self.getArrowShape(),
        $(go.TextBlock,
          {
            font: '11pt Helvetica, Arial, sans-serif',
            wrap: go.TextBlock.WrapFit,
            editable: true,
            textAlign: 'center',
            segmentOffset: new go.Point(0, -10),
            alignment: go.Spot.Left // or go.Spot.Bottom
          },
          new go.Binding('text').makeTwoWay()
        )
      );

    const linkTemplateMap = new go.Map<string, go.Link>();
    linkTemplateMap.add('msg', messageFlowLinkTemplate);
    linkTemplateMap.add('annotation', annotationAssociationLinkTemplate);
    linkTemplateMap.add('data', dataAssociationLinkTemplate);
    linkTemplateMap.add('customLink', customLinkTemplate);
    linkTemplateMap.add('', sequenceLinkTemplate);  // default

    // ------------------------------------------the main Diagram----------------------------------------------
    this.overrideContextMenu(nodeTemplateMap, linkTemplateMap, groupTemplateMap);
    this.addCustomShapes(nodeTemplateMap, linkTemplateMap, groupTemplateMap, convertFieldExistenceToLinkVisibility);


    this.myDiagram =
      $(go.Diagram, 'myDiagramDiv',
        {
          nodeTemplateMap: nodeTemplateMap,
          linkTemplateMap: linkTemplateMap,
          groupTemplateMap: groupTemplateMap,
          'undoManager.isEnabled': true, // enable Ctrl-Z to undo and Ctrl-Y to redo

          commandHandler: new DrawCommandHandlerClass(),  // defined in DrawCommandHandlerClass.js
          // default to having arrow keys move selected nodes
          'commandHandler.arrowKeyBehavior': 'move',

          mouseDrop: (e) => {
            return self.diagramOnMouseDrop(self);
          },
          resizingTool: new LaneResizingTool(() => {
            self.relayoutDiagram();
          }),
          linkingTool: new BPMNLinkingTool(), // defined in BPMNClasses.js
          relinkingTool: new BPMNRelinkingTool(), // defined in BPMNClasses.js
          'SelectionMoved': () => self.relayoutDiagram(),
          'SelectionCopied': () => self.relayoutDiagram(),
          'LinkDrawn': function (e) {
            BpmnLaneHelpers.assignGroupLayer(e.subject.containingGroup);
          },
          'LinkRelinked': function (e) {
            BpmnLaneHelpers.assignGroupLayer(e.subject.containingGroup);
          }
        });


    this.myDiagram.addDiagramListener('LinkDrawn', function (e) {
      if (e.subject.fromNode.category === 'annotation') {
        e.subject.category = 'annotation'; // annotation association
      } else if (e.subject.fromNode.category === 'dataobject' || e.subject.toNode.category === 'dataobject') {
        e.subject.category = 'data'; // data association
      } else if (e.subject.fromNode.category === 'datastore' || e.subject.toNode.category === 'datastore') {
        e.subject.category = 'data'; // data association
      } else if (e.subject.fromNode.category === 'customNode' || e.subject.toNode.category === 'customNode') {
        e.subject.category = 'customLink'; // data association
      }
    });

    this.myDiagram.addModelChangedListener((evt: ChangedEvent) => {
      // ignore unimportant Transaction events
      if (!evt.isTransactionFinished) {
        return;
      }
      const txn = evt.object;  // a Transaction
      if (txn === null) {
        return;
      }

      if (txn.name === 'Move') {
        this.handleNodeMove(txn);
      }

      if (txn.name === 'TextEditing') {
        this.handleNodeTextEditing(txn);
      }

      if (txn.name === 'Delete') {
        this.handleNodeDeleted(txn);
      }

      if (txn.name === 'Linking') {
        this.handleNodeLinking(txn);
      }

      if (txn.name === 'Resizing') {
        this.handleNodeResizing(txn);
      }

      if (txn.name === 'Paste') {
        this.handleNodePaste(txn);
      }
    });
  }


  // changes the item of the object
  public rename(obj: go.GraphObject) {
    if (obj === null || obj.part === null || obj.part.data === null) {
      return;
    }
    this.myDiagram.startTransaction('rename');
    const newName = prompt('Rename ' + obj.part.data.item + ' to:');
    this.myDiagram.model.setDataProperty(obj.part.data, 'item', newName);
    this.myDiagram.commitTransaction('rename');
  }

  // shows/hides gridlines
  // to be implemented onclick of a button
  public updateGridOption() {
    this.myDiagram.startTransaction('grid');
    const grid = document.getElementById('grid') as any;
    this.myDiagram.grid.visible = grid.checked;
    this.myDiagram.commitTransaction('grid');
  }

  // enables/disables snapping tools, to be implemented by buttons
  public updateSnapOption() {
    // no transaction needed, because we are modifying tools for future use
    const snap = document.getElementById('snap') as any;
    if (snap.checked) {
      this.myDiagram.toolManager.draggingTool.isGridSnapEnabled = true;
      this.myDiagram.toolManager.resizingTool.isGridSnapEnabled = true;
    } else {
      this.myDiagram.toolManager.draggingTool.isGridSnapEnabled = false;
      this.myDiagram.toolManager.resizingTool.isGridSnapEnabled = false;
    }
  }

  // user specifies the amount of space between nodes when making rows and column
  public askSpace(): number {
    const space = parseFloat(prompt('Desired space between nodes (in pixels):') || '0');
    return space;
  }

  public undo() {
    this.myDiagram.commandHandler.undo();
  }

  public redo() {
    this.myDiagram.commandHandler.redo();
  }

  public cutSelection() {
    this.myDiagram.commandHandler.cutSelection();
  }

  public copySelection() {
    this.myDiagram.commandHandler.copySelection();
  }

  public pasteSelection() {
    this.myDiagram.commandHandler.pasteSelection();
  }

  public deleteSelection() {
    this.myDiagram.commandHandler.deleteSelection();
  }

  public selectAll() {
    this.myDiagram.commandHandler.selectAll();
  }

  public alignLeft() {
    (this.myDiagram.commandHandler as DrawCommandHandlerClass).alignLeft();
  }

  public alignRight() {
    (this.myDiagram.commandHandler as DrawCommandHandlerClass).alignRight();
  }

  public alignTop() {
    (this.myDiagram.commandHandler as DrawCommandHandlerClass).alignTop();
  }

  public alignBottom() {
    (this.myDiagram.commandHandler as DrawCommandHandlerClass).alignBottom();
  }

  public alignCemterX() {
    (this.myDiagram.commandHandler as DrawCommandHandlerClass).alignCenterX();
  }

  public alignCenterY() {
    (this.myDiagram.commandHandler as DrawCommandHandlerClass).alignCenterY();
  }

  public alignRows() {
    (this.myDiagram.commandHandler as DrawCommandHandlerClass).alignRow(this.askSpace());
  }

  public alignColumns() {
    (this.myDiagram.commandHandler as DrawCommandHandlerClass).alignColumn(this.askSpace());
  }

  public overrideContextMenu(nodeTemplateMap: go.Map<string, go.Node>, linkTemplateMap: go.Map<string, go.Link>, groupTemplateMap: go.Map<string, go.Group>) {
    const self = this;
    // override context menu
    const contextMenu = $('ContextMenu',
      $('ContextMenuButton',
        $(go.TextBlock, 'Model Element Attributes'),
        {
          click: (e, obj) => {
            const node = obj.part.adornedPart;
            if (node != null) {
              const element = node.data.element;

              const modelElementAndModel = new ModelElementDetailAndModel();
              modelElementAndModel.modelId = this.selectedModel.id;
              modelElementAndModel.elementDetail = element;

              this.dialog.open(ModalViewElementDetail, {
                data: modelElementAndModel
              });
            }
          }
        }
      ),
      $('ContextMenuButton',
        $(go.TextBlock, 'Model Link'),
        {
          click: (e, obj) => {
            const node = obj.part.adornedPart;
            if (node != null) {
              const element = node.data.element;

              const modelElementDetailAndModel = new ModelElementDetailAndModel();
              modelElementDetailAndModel.modelId = this.selectedModel.id;
              modelElementDetailAndModel.elementDetail = element;

              const dialogRef = this.dialog.open(ModalModelLink, {
                data: modelElementDetailAndModel
              });

              dialogRef.afterClosed().pipe(take(1)).subscribe(result => {

                if (result === undefined) {
                  return;
                }

                if (result.action === 'Delete') {
                  delete element.shapeRepresentsModel;
                  this.mService.updateElement(element, this.selectedModel.id);
                } else if (result.action === 'Save') {
                  element.shapeRepresentsModel = result.selectedModelId;
                  this.myDiagram.model.setDataProperty(node.data, 'element', element);
                  this.myDiagram.model.setDataProperty(node.data, 'shapeRepresentsModel', element.shapeRepresentsModel);
                  this.mService.updateElement(element, this.selectedModel.id);
                }

                this.myDiagram.rebuildParts();
              });
            }
          }
        }
      ),
      $('ContextMenuButton',
        $(go.TextBlock, 'Note'),
        {
          click: (e, obj) => {
            const node = obj.part.adornedPart;
            if (node != null) {
              const element = node.data.element;

              const modelElementDetailAndModel = new ModelElementDetailAndModel();
              modelElementDetailAndModel.modelId = this.selectedModel.id;
              modelElementDetailAndModel.elementDetail = element;

              this.dialog.open(ModalElementNote, {
                data: modelElementDetailAndModel
              });
            }
          }
        }
      ),
      $('ContextMenuButton',
        $(go.TextBlock, 'Visualisations of same element'),
        {
          click: (e, obj) => {
            const node = obj.part.adornedPart;
            if (node != null) {
              const element = node.data.element;

              const otherVisualisationsData = new VisualisationLinksData();
              otherVisualisationsData.modelingLanguageConstructInstanceId = element.modelingLanguageConstructInstance;
              otherVisualisationsData.otherVisualisations = [];

              // referenced shapes
              if (element.otherVisualisationsOfSameLanguageConstruct !== undefined) {
                this.models.forEach(model => {
                  const modelElementDetail = model.elements.find(modelElement => element.otherVisualisationsOfSameLanguageConstruct.includes(modelElement.id));
                  if (modelElementDetail !== undefined) {
                    const data = new ModelElementDetailAndModel();
                    data.modelId = model.id;
                    data.modelLabel = model.label;
                    data.elementDetail = modelElementDetail;
                    otherVisualisationsData.otherVisualisations.push(data);
                  }
                });
              }

              // current element
              const data = new ModelElementDetailAndModel();
              data.modelId = this.selectedModel.id;
              data.modelLabel = this.selectedModel.label;
              data.elementDetail = element;
              otherVisualisationsData.otherVisualisations.push(data);

              this.dialog.open(ModalModellingLanguageConstructInstanceLink, {
                data: otherVisualisationsData
              });
            }
          }
        }
      ),
      $('ContextMenuButton',
        $(go.TextBlock, 'Visualisation'),
        {
          click: (e, obj) => {
            const node = obj.part.adornedPart;
            if (node != null) {
              const element = node.data.element;

              const modelElementDetailAndModel = new ModelElementDetailAndModel();
              modelElementDetailAndModel.modelId = this.selectedModel.id;
              modelElementDetailAndModel.elementDetail = element;

              const dialogRef = this.dialog.open(ModalPaletteVisualisation, {
                data: modelElementDetailAndModel
              });

              dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
                if (result !== 'Cancel') {
                  element.paletteConstruct = result.paletteConstruct;
                  this.mService.updateElement(element, this.selectedModel.id);
                  this.myDiagram.rebuildParts();
                }
              });

            }
          }
        }
      ),
      // TODO add this back when backend also changes the instatiation type in the PUT request
      // $('ContextMenuButton',
      //   $(go.TextBlock, 'Change instantion type'),
      //   {
      //     click: (e, obj) => {
      //       const node = obj.part.adornedPart;
      //       if (node != null) {
      //         const element = node.data.element;
      //
      //         const modelElementDetailAndModel = new ModelElementDetailAndModel();
      //         modelElementDetailAndModel.modelId = this.selectedModel.id;
      //         modelElementDetailAndModel.elementDetail = element;
      //
      //         const dialogRef = this.dialog.open(ModalInstantiationTypeComponent, {
      //           data: modelElementDetailAndModel
      //         });
      //
      //         dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      //           if (result && result !== 'Cancel') {
      //             element.abstractElementAttributes.instantiationType = result.selectedModel;
      //             this.mService.updateElement(element, this.selectedModel.id);
      //             this.myDiagram.rebuildParts();
      //           }
      //         });
      //       }
      //     }
      //   }
      // ),
      $('ContextMenuButton',
        $(go.TextBlock, 'Add Lane'),
        // in the click event handler, the obj.part is the Adornment; its adornedObject is the port
        {
          click: function (e: go.InputEvent, obj: go.GraphObject) {
            self.addLaneEvent((obj.part as go.Adornment).adornedObject as go.Node);
          }
        },
        new go.Binding('visible', '', self.isLaneMenuVisible),
      ),
    );

    nodeTemplateMap.iteratorValues.each(n => n.contextMenu = contextMenu);
    linkTemplateMap.iteratorValues.each(n => n.contextMenu = contextMenu);
    groupTemplateMap.iterator.each((n) => n.value.contextMenu = contextMenu);
  }

  private isLaneMenuVisible(m) {
    return m?.element?.modellingLanguageConstruct === 'Pool';
  }

  private addCustomShapes(nodeTemplateMap: go.Map<string, go.Node>, linkTemplateMap: go.Map<string, go.Link>, groupTemplateMap: go.Map<string, go.Group>, convertFieldExistenceToLinkVisibility: (obj) => boolean) {
    nodeTemplateMap.iteratorValues.each(x => {
      this.addVisualisationsOfSameLanguageConstructShape(x, convertFieldExistenceToLinkVisibility);
    });
    linkTemplateMap.iteratorValues.each(x => {
      this.addVisualisationsOfSameLanguageConstructShape(x, convertFieldExistenceToLinkVisibility);
    });
    groupTemplateMap.iteratorValues.each(x => {
      this.addVisualisationsOfSameLanguageConstructShape(x, convertFieldExistenceToLinkVisibility);
    });
  }

  private getArrowShape(margin = 2, segmentOffset = new go.Point(0, 0)): go.GraphObject {
    const self = this;
    return $(go.Shape,
      {
        alignment: go.Spot.TopRight,
        alignmentFocus: go.Spot.TopRight,
        width: 12, height: 12, fill: 'orange',
        visible: false,
        figure: 'Arrow',
        margin: margin,
        cursor: 'pointer',
        click: self.navigateToLinkedModel(),
        segmentOffset: segmentOffset
      },
      new go.Binding('visible', 'shapeRepresentsModel', (e) => !!e));
  }

  private addVisualisationsOfSameLanguageConstructShape(x: go.Node | go.Link | go.Group, convertFieldExistenceToLinkVisibility: (obj) => boolean) {
    x.add($(go.Shape,
      {
        alignment: go.Spot.BottomLeft,
        alignmentFocus: go.Spot.BottomLeft,
        width: 12, height: 12, fill: 'orange',
        visible: false,
        margin: 8,
        figure: 'MultiDocument'
      },
      new go.Binding('visible', 'otherVisualisationsOfSameLanguageConstruct', convertFieldExistenceToLinkVisibility)
    ));
  }

  validateSHACL() {
    console.log("Validating SHACL for model: " + this.selectedModel.id + " with name: " + this.selectedModel.label);
    this.mService.validateShacl(this.selectedModel.id).subscribe(
      (response: any[]) => {
        console.log(response);
        let message: string;
        if (response.length === 0) {
          //message = 'Validation successful';
          this.toastr.success(message, 'Validation Success', {positionClass: 'toast-bottom-center', timeOut: 5000, tapToDismiss: true});
        } else {
          message= response.map(obj => `FocusNode: ${obj.FocusNode}<br>Message: ${obj.Message}<br>Path: ${obj.Path}<br>Severity: ${obj.Severity}<br>`).join('<br>');
          this.toastr.warning(message, 'Validation Results', {enableHtml: true, disableTimeOut: true, positionClass: 'toast-bottom-full-width', tapToDismiss: true, closeButton: true});
        }
      }
    )

  }
}

//  uncomment this if you want a subprocess to expand on drop.  We decided we didn't like this behavior
//  this.myDiagram.addDiagramListener("ExternalObjectsDropped", function(e) {
//    // e.subject is the collection that was just dropped
//    e.subject.each(function(part) {
//        if (part instanceof go.Node && part.data.item === "end") {
//          part.move(new go.Point(part.location.x  + 350, part.location.y))
//        }
// this.myDiagram.addDiagramListener('Modified', function (e) {
//   const currentFile = document.getElementById('currentFile') as HTMLDivElement;
//   const idx = currentFile.textContent!.indexOf('*');
//   if (this.myDiagram.isModified) {
//     if (idx < 0) { currentFile.textContent = currentFile.textContent + '*'; }
//   } else {
//     if (idx >= 0) { currentFile.textContent = currentFile.textContent!.slice(0, idx); }
//   }
// }); //      });
//    this.myDiagram.commandHandler.expandSubGraph();
//  });

// change the title to indicate that the diagram has been modified


// ------------------------------------------  Palette   ----------------------------------------------

// Make sure the pipes are ordered by their key in the palette inventory
// function keyCompare(a: go.Part, b: go.Part) {
//   const at = a.data.key;
//   const bt = b.data.key;
//   if (at < bt) { return -1; }
//   if (at > bt) { return 1; }
//   return 0;
// }
//
// // initialize the first Palette, BPMN Spec Level 1
// const myPaletteLevel1 =
//   $(go.Palette, 'myPaletteLevel1',
//     { // share the templates with the main Diagram
//       nodeTemplateMap: palNodeTemplateMap,
//       groupTemplateMap: palGroupTemplateMap,
//       layout: $(go.GridLayout,
//         {
//           cellSize: new go.Size(1, 1),
//           spacing: new go.Size(5, 5),
//           comparer: keyCompare
//         })
//     });
//
// // initialize the second Palette, BPMN Spec Level 2
// const myPaletteLevel2 =
//   $(go.Palette, 'myPaletteLevel2',
//     { // share the templates with the main Diagram
//       nodeTemplateMap: palNodeTemplateMap,
//       groupTemplateMap: palGroupTemplateMap,
//       layout: $(go.GridLayout,
//         {
//           cellSize: new go.Size(1, 1),
//           spacing: new go.Size(5, 5),
//           comparer: keyCompare
//         })
//     });
//
// // initialize the third Palette, random other stuff
// const myPaletteLevel3 =
//   $(go.Palette, 'myPaletteLevel3',
//     { // share the templates with the main Diagram
//       nodeTemplateMap: palNodeTemplateMap,
//       groupTemplateMap: palGroupTemplateMap,
//       layout: $(go.GridLayout,
//         {
//           cellSize: new go.Size(1, 1),
//           spacing: new go.Size(5, 5),
//           comparer: keyCompare
//         })
//     });
//
// myPaletteLevel1.model = $(go.GraphLinksModel,
//   {
//     copiesArrays: true,
//     copiesArrayObjects: true,
//     nodeDataArray: [
//       // -------------------------- Event Nodes
//       { key: 101, category: 'event', text: 'Start', eventType: 1, eventDimension: 1, item: 'start' },
//       { key: 102, category: 'event', text: 'Message', eventType: 2, eventDimension: 2, item: 'Message' }, // BpmnTaskMessage
//       { key: 103, category: 'event', text: 'Timer', eventType: 3, eventDimension: 3, item: 'Timer' },
//       { key: 104, category: 'event', text: 'End', eventType: 1, eventDimension: 8, item: 'End' },
//       { key: 107, category: 'event', text: 'Message', eventType: 2, eventDimension: 8, item: 'Message' }, // BpmnTaskMessage
//       { key: 108, category: 'event', text: 'Terminate', eventType: 13, eventDimension: 8, item: 'Terminate' },
//       // -------------------------- Task/Activity Nodes
//       { key: 131, category: 'activity', text: 'Task', item: 'generic task', taskType: 0 },
//       { key: 132, category: 'activity', text: 'User Task', item: 'User task', taskType: 2 },
//       { key: 133, category: 'activity', text: 'Service\nTask', item: 'service task', taskType: 6 },
//       // subprocess and start and end
//       { key: 134, category: 'subprocess', loc: '0 0', text: 'Subprocess', isGroup: true, isSubProcess: true, taskType: 0 },
//       { key: -802, category: 'event', loc: '0 0', group: 134, text: 'Start', eventType: 1, eventDimension: 1, item: 'start' },
//       { key: -803, category: 'event', loc: '350 0', group: 134, text: 'End', eventType: 1, eventDimension: 8, item: 'end', name: 'end' },
//       // -------------------------- Gateway Nodes, Data, Pool and Annotation
//       { key: 201, category: 'gateway', text: 'Parallel', gatewayType: 1 },
//       { key: 204, category: 'gateway', text: 'Exclusive', gatewayType: 4 },
//       { key: 301, category: 'dataobject', text: 'Data\nObject' },
//       { key: 302, category: 'datastore', text: 'Data\nStorage' },
//       { key: 401, category: 'privateProcess', text: 'Black Box' },
//       { key: '501', 'text': 'Pool 1', 'isGroup': 'true', 'category': 'Pool' },
//       { key: 'Lane5', 'text': 'Lane 1', 'isGroup': 'true', 'group': '501', 'color': 'lightyellow', 'category': 'Lane' },
//       { key: 'Lane6', 'text': 'Lane 2', 'isGroup': 'true', 'group': '501', 'color': 'lightgreen', 'category': 'Lane' },
//       { key: 701, category: 'annotation', text: 'note' }
//     ]  // end nodeDataArray
//   });  // end model
//
// // an activity with a boundary event:
// //        {
// //          key: 1,
// //          category: "activity",
// //          text: "Message",
// //          taskType: 1,
// //          item: "Message Task",
// //          boundaryEventArray: [{ "portId": "be0", alignmentIndex: 0, eventType: 2, color: "white" }]   // portId # and alignmentIndex should match
// //        },
//
// myPaletteLevel2.model = $(go.GraphLinksModel,
//   {
//     copiesArrays: true,
//     copiesArrayObjects: true,
//     nodeDataArray: [
//       { key: 1, category: 'activity', taskType: 1, text: 'Receive Task', item: 'Receive Task' },
//       { key: 2, category: 'activity', taskType: 5, text: 'Send Task', item: 'Send Task' },
//       { key: 3, category: 'activity', taskType: 7, text: 'Business\nRule Task', item: 'Business Rule Task' },
//       { key: 4, category: 'activity', taskType: 2, text: 'User Task', item: 'User Task', isCall: true },
//
//       { key: 101, text: 'Adhoc\nSubprocess', isGroup: true, isSubProcess: true, category: 'subprocess', isAdHoc: true, taskType: 0, loc: '0 0' },
//       { key: -812, group: 101, category: 'event', text: 'Start', eventType: 1, eventDimension: 1, item: 'start', loc: '0 0' },
//       { key: -813, group: 101, category: 'event', text: 'End', eventType: 1, eventDimension: 8, item: 'end', name: 'end' },
//
//       { key: 102, text: 'Transactional\nSubprocess', isGroup: true, isSubProcess: true, category: 'subprocess', isTransaction: true, taskType: 0, loc: '0 0' },
//       { key: -822, group: 102, category: 'event', text: 'Start', eventType: 1, eventDimension: 1, item: 'start', loc: '0 0' },
//       { key: -823, group: 102, category: 'event', text: 'End', eventType: 1, eventDimension: 8, item: 'end', name: 'end', loc: '350 0' },
//
//       { key: 103, text: 'Looping\nActivity', isGroup: true, isLoop: true, isSubProcess: true, category: 'subprocess', taskType: 0, loc: '0 0' },
//       { key: -831, group: 103, category: 'event', text: 'Start', eventType: 1, eventDimension: 1, item: 'start', loc: '0 0' },
//       { key: -832, group: 103, category: 'event', text: 'End', eventType: 1, eventDimension: 8, item: 'end', name: 'end', loc: '350 0' },
//
//       { key: 104, text: 'Multi-Instance\nActivity', isGroup: true, isSubProcess: true, isParallel: true, category: 'subprocess', taskType: 0, loc: '0 0' },
//       { key: -841, group: 104, category: 'event', text: 'Start', eventType: 1, eventDimension: 1, item: 'start', loc: '0 0' },
//       { key: -842, group: 104, category: 'event', text: 'End', eventType: 1, eventDimension: 8, item: 'end', name: 'end', loc: '350 0' },
//
//       { key: 105, text: 'Call\nSubprocess', isGroup: true, isSubProcess: true, category: 'subprocess', isCall: true, taskType: 0, loc: '0 0' },
//       { key: -861, group: 105, category: 'event', text: 'Start', eventType: 1, eventDimension: 1, item: 'start', loc: '0 0' },
//       { key: -862, group: 105, category: 'event', text: 'End', eventType: 1, eventDimension: 8, item: 'end', name: 'end', loc: '350 0' },
//
//       // gateway nodes
//       { key: 301, category: 'gateway', gatewayType: 2, text: 'Inclusive' },
//       { key: 302, category: 'gateway', gatewayType: 5, text: 'Event\nGateway' },
//
//       // events
//       { key: 401, category: 'event', eventType: 5, eventDimension: 1, text: 'Conditional\nStart', item: 'BpmnEventConditional' },
//       { key: 402, category: 'event', eventType: 10, eventDimension: 1, text: 'Signal\nStart', item: 'BpmnEventSignal' },  // start signal
//       { key: 403, category: 'event', eventType: 10, eventDimension: 8, text: 'Signal\nEnd', item: 'end signal' },
//       { key: 404, category: 'event', eventType: 7, eventDimension: 8, text: 'Error', item: 'BpmnEventError' },
//       { key: 405, category: 'event', eventType: 4, eventDimension: 8, text: 'Escalation', item: 'BpmnEventEscalation' },
//       // throwing / catching intermedicate events
//       { key: 502, category: 'event', eventType: 6, eventDimension: 4, text: 'Catch\nLink', item: 'BpmnEventOffPage' },
//       { key: 503, category: 'event', eventType: 6, eventDimension: 7, text: 'Throw\nLink', item: 'BpmnEventOffPage' },
//       { key: 504, category: 'event', eventType: 2, eventDimension: 4, text: 'Catch\nMessage', item: 'Message' },
//       { key: 505, category: 'event', eventType: 2, eventDimension: 7, text: 'Throw\nMessage', item: 'Message' },
//       { key: 506, category: 'event', eventType: 5, eventDimension: 4, text: 'Catch\nConditional', item: '' },
//       { key: 507, category: 'event', eventType: 3, eventDimension: 4, text: 'Catch\nTimer', item: '' },
//       { key: 508, category: 'event', eventType: 4, eventDimension: 7, text: 'Throw\nEscalation', item: 'Escalation' },
//       { key: 509, category: 'event', eventType: 10, eventDimension: 4, text: 'Catch\nSignal', item: '' },
//       { key: 510, category: 'event', eventType: 10, eventDimension: 7, text: 'Throw\nSignal', item: '' }
//     ]  // end nodeDataArray
//   });  // end model
//
// myPaletteLevel3.model = $(go.GraphLinksModel,
//   {
//     copiesArrays: true,
//     copiesArrayObjects: true,
//     nodeDataArray: [
//       { key: 108, category: 'event', eventType: 8, eventDimension: 5, text: 'Cancel', item: 'BpmnEventCancel' },
//       { key: 109, category: 'event', eventType: 9, eventDimension: 5, text: 'Compensation', item: 'BpmnEventCompensation' },
//
//       { key: 111, category: 'event', eventType: 11, eventDimension: 1, text: 'Multiple', item: 'Multiple' },
//       { key: 112, category: 'event', eventType: 12, eventDimension: 1, text: 'Parallel', item: 'Parallel' },
//       // activity nodes
//       { key: 203, category: 'activity', taskType: 3, isAdHoc: true, text: 'Manual', item: 'Manual Task' },
//       { key: 204, category: 'activity', taskType: 4, isSequential: true, text: 'Script', item: 'Script Task' },
//       { key: 205, category: 'activity', taskType: 5, isParallel: true, text: 'Send Msg', item: 'Send Msg Task' },
//       { key: 206, category: 'activity', taskType: 6, isLoop: true, isSubProcess: true, isTransaction: true, text: 'Service', item: 'service task' },
//
//       // gateway nodes not in Level 1 or Level 2
//       { key: 603, category: 'gateway', text: 'Complex', gatewayType: 3 },
//       { key: 606, category: 'gateway', text: 'Exclusive Start', gatewayType: 6 },
//       { key: 607, category: 'gateway', text: 'Parallel Start', gatewayType: 7 },
//
//       {
//         key: 4, category: 'activity', taskType: 2, text: 'User Task', item: 'User Task',
//         isCall: true, isLoop: true, isParallel: true, isSequential: true
//       }
//     ]  // end nodeDataArray
//   });  // end model

import {Inject, Injectable} from '@angular/core';
import * as go from 'gojs';
import {Mappers} from '../mappers';
import {ModelElementDetail} from '../../../../shared/models/ModelElementDetail.model';
import {AdditionalCreateOptions} from '../../models/additional-create-options.interface';
import {BpmnConstantsClass} from './bpmn-constants.class';
import {PaletteElementModel} from '../../../../shared/models/PaletteElement.model';

const $ = go.GraphObject.make;

@Injectable({providedIn: 'root'})
export class BpmnTemplateService {
  public addGoJsBPMNNodeFields(nodeData: any, modellingLanguageConstruct: string) {
    const dicEntry = Mappers.dictionaryAOAMEBPMNElementToGoJsNode.get(modellingLanguageConstruct);
    if (!dicEntry) {
      nodeData.category = 'customNode';
      return;
    }
    // nodeData.key = dicEntry.key;
    nodeData.category = dicEntry.category;
    nodeData.taskType = dicEntry.taskType;
    nodeData.isLoop = dicEntry.isLoop;
    nodeData.isSubProcess = dicEntry.isSubProcess;
    nodeData.isTransaction = dicEntry.isTransaction;
    nodeData.isGroup = dicEntry.isGroup;
    nodeData.isSequential = dicEntry.isSequential;
    nodeData.isAdHoc = dicEntry.isAdHoc;
    nodeData.eventType = dicEntry.eventType;
    nodeData.eventDimension = dicEntry.eventDimension;
    nodeData.gatewayType = dicEntry.gatewayType;
  }

  public addGoJsBPMNLinkFields(nodeData: any, element: ModelElementDetail) {
    const dicEntry = Mappers.dictionaryGoJsAOAMELinkIdToLinkCategory.get(element.modellingLanguageConstruct);
    if (dicEntry === undefined || !this.isMappableBPMNConnection(element.fromShape, element.toShape)) {
      nodeData.category = 'customLink';
      return;
    }
    // nodeData.key = dicEntry.key;
    nodeData.category = dicEntry;
  }

  public addGoJsBPMNGroupFields(nodeData: any, modellingLanguageConstruct: string) {
    const dicEntry = Mappers.dictionaryAOAMEBPMNGroupToGoJsGroup.get(modellingLanguageConstruct);
    if (!dicEntry) {
      nodeData.category = 'customGroup';
      return;
    }
    // nodeData.key = dicEntry.key;
    nodeData.category = dicEntry.category;
    nodeData.isGroup = dicEntry.isGroup;
    // nodeData.group = dicEntry.group;
    nodeData.color = dicEntry.color;
  }

  public addAdditionalCreateOptions(toData: any, additionalCreateOptions: AdditionalCreateOptions) {
    toData.loc = additionalCreateOptions.loc;
    toData.size = additionalCreateOptions.size;
    toData.group = additionalCreateOptions.group;
  }

  public isMappableBPMNConnection(fromShape: string, toShape: string): boolean {
    const from = fromShape.split('_')[0];
    const to = toShape.split('_')[0];
    const goJsNodeFrom = Mappers.dictionaryAOAMEBPMNElementToGoJsNode.get(from);
    const goJsNodeTo = Mappers.dictionaryAOAMEBPMNElementToGoJsNode.get(to);
    const goJsGroupFrom = Mappers.dictionaryAOAMEBPMNGroupToGoJsGroup.get(from);
    const goJsGroupTo = Mappers.dictionaryAOAMEBPMNGroupToGoJsGroup.get(to);

    if (goJsNodeFrom?.category === 'annotation') {
      return true;
    } else if (goJsNodeFrom?.category === 'dataobject' || goJsNodeTo?.category === 'dataobject') {
      return true;
    } else if (goJsNodeFrom?.category === 'datastore' || goJsNodeTo?.category === 'datastore') {
      return true;
    } else if ((goJsNodeFrom || goJsGroupFrom) && (goJsNodeTo || goJsGroupTo)) {
      return true;
    }
    return false;
  }

  // conversion functions used by data Bindings
  nodeActivityTaskTypeConverter(s: number): Array<string> | string {
    const tasks = ['Empty',
      'BpmnTaskMessage',
      'BpmnTaskUser',
      'BpmnTaskManual',   // Custom hand symbol
      'BpmnTaskScript',
      'BpmnTaskMessage',  // should be black on white
      'BpmnTaskService',  // Custom gear symbol
      'InternalStorage'];
    if (s < tasks.length) {
      console.log(tasks[s]);
      return tasks[s];
    }
    return 'NotAllowed'; // error
  }

  public nodeActivityTaskTypeColorConverter(s: number) {
    return (s === 5) ? 'dimgray' : 'white';
  }

  public nodeEventTypeConverter(s: number) {  // order here from BPMN 2.0 poster
    const tasks = ['NotAllowed',
      'Empty',
      'BpmnTaskMessage',
      'BpmnEventTimer',
      'BpmnEventEscalation',
      'BpmnEventConditional',
      'Arrow',
      'BpmnEventError',
      'ThinX',
      'BpmnActivityCompensation',
      'Triangle',
      'Pentagon',
      'ThinCross',
      'Circle'];
    if (s < tasks.length) {
      return tasks[s];
    }
    return 'NotAllowed'; // error
  }

  public nodeEventDimensionStrokeColorConverter(s: number) {
    if (s === 8) {
      return BpmnConstantsClass.EventDimensionStrokeEndColor;
    }
    return BpmnConstantsClass.EventDimensionStrokeColor;
  }

  public nodeEventDimensionSymbolFillConverter(s: number) {
    if (s <= 6) {
      return BpmnConstantsClass.EventSymbolLightFill;
    }
    return BpmnConstantsClass.EventSymbolDarkFill;
  }

  // sub-process,  loop, parallel, sequential, ad doc and compensation markers in horizontal array
  public makeMarkerPanel(sub: boolean, scale: number) {
    return $(go.Panel, 'Horizontal',
      {alignment: go.Spot.MiddleBottom, alignmentFocus: go.Spot.MiddleBottom},
      $(go.Shape, 'BpmnActivityLoop',
        {
          width: 12 / scale,
          height: 12 / scale,
          margin: 2,
          visible: false,
          strokeWidth: BpmnConstantsClass.ActivityMarkerStrokeWidth
        },
        new go.Binding('visible', 'isLoop')),
      $(go.Shape, 'BpmnActivityParallel',
        {
          width: 12 / scale,
          height: 12 / scale,
          margin: 2,
          visible: false,
          strokeWidth: BpmnConstantsClass.ActivityMarkerStrokeWidth
        },
        new go.Binding('visible', 'isParallel')),
      $(go.Shape, 'BpmnActivitySequential',
        {
          width: 12 / scale,
          height: 12 / scale,
          margin: 2,
          visible: false,
          strokeWidth: BpmnConstantsClass.ActivityMarkerStrokeWidth
        },
        new go.Binding('visible', 'isSequential')),
      $(go.Shape, 'BpmnActivityAdHoc',
        {
          width: 12 / scale,
          height: 12 / scale,
          margin: 2,
          visible: false,
          strokeWidth: BpmnConstantsClass.ActivityMarkerStrokeWidth
        },
        new go.Binding('visible', 'isAdHoc')),
      $(go.Shape, 'BpmnActivityCompensation',
        {
          width: 12 / scale,
          height: 12 / scale,
          margin: 2,
          visible: false,
          strokeWidth: BpmnConstantsClass.ActivityMarkerStrokeWidth,
          fill: null
        },
        new go.Binding('visible', 'isCompensation')),
      this.makeSubButton(sub)
    ); // end activity markers horizontal panel
  }

  // sub-process,  loop, parallel, sequential, ad doc and compensation markers in horizontal array
  private makeSubButton(sub: boolean) {
    if (sub) {
      return [$('SubGraphExpanderButton'),
        {margin: 2, visible: false},
        new go.Binding('visible', 'isSubProcess')];
    }
    return [];
  }

  public nodeGatewaySymbolTypeConverter(s: number) {
    const tasks = ['NotAllowed',
      'ThinCross',      // 1 - Parallel
      'Circle',         // 2 - Inclusive
      'AsteriskLine',   // 3 - Complex
      'ThinX',          // 4 - Exclusive  (exclusive can also be no symbol, just bind to visible=false for no symbol)
      'Pentagon',       // 5 - double cicle event based gateway
      'Pentagon',       // 6 - exclusive event gateway to start a process (single circle)
      'ThinCross'];   // 7 - parallel event gateway to start a process (single circle)
    if (s < tasks.length) {
      return tasks[s];
    }
    return 'NotAllowed'; // error
  }

  // tweak the size of some of the gateway icons
  public nodeGatewaySymbolSizeConverter(s: number) {
    const size = new go.Size(BpmnConstantsClass.GatewayNodeSymbolSize, BpmnConstantsClass.GatewayNodeSymbolSize);
    if (s === 4) {
      size.width = size.width / 4 * 3;
      size.height = size.height / 4 * 3;
    } else if (s > 4) {
      size.width = size.width / 1.6;
      size.height = size.height / 1.6;
    }
    return size;
  }

  public nodePalGatewaySymbolSizeConverter(s: number) {
    const size = this.nodeGatewaySymbolSizeConverter(s);
    size.width = size.width / BpmnConstantsClass.Palscale;
    size.height = size.height / BpmnConstantsClass.Palscale;
    return size;
  }

  getActivityNodeTemplateForPalette() {
    return $(go.Node, 'Vertical',
      {
        locationObjectName: 'SHAPE',
        locationSpot: go.Spot.Center,
        selectionAdorned: false
      },
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Panel, 'Spot',
        {
          name: 'PANEL',
          // tslint:disable-next-line:max-line-length
          desiredSize: new go.Size(BpmnConstantsClass.ActivityNodeWidth / BpmnConstantsClass.Palscale, BpmnConstantsClass.ActivityNodeHeight / BpmnConstantsClass.Palscale)
        },
        $(go.Shape, 'RoundedRectangle',  // the outside rounded rectangle
          {
            name: 'SHAPE',
            fill: BpmnConstantsClass.ActivityNodeFill, stroke: BpmnConstantsClass.ActivityNodeStroke,
            parameter1: 10 / BpmnConstantsClass.Palscale  // corner size (default 10)
          },
          new go.Binding('strokeWidth', 'isCall',
            function (s) {
              return s ? BpmnConstantsClass.ActivityNodeStrokeWidthIsCall : BpmnConstantsClass.ActivityNodeStrokeWidth;
            })),
        $(go.Shape, 'RoundedRectangle',  // the inner "Transaction" rounded rectangle
          {
            margin: 3,
            stretch: go.GraphObject.Fill,
            stroke: BpmnConstantsClass.ActivityNodeStroke,
            parameter1: 8 / BpmnConstantsClass.Palscale, fill: null, visible: false
          },
          new go.Binding('visible', 'isTransaction')),
        // task icon
        $(go.Shape, 'BpmnTaskScript',    // will be None, Script, Manual, Service, etc via converter
          {
            alignment: new go.Spot(0, 0, 5, 5), alignmentFocus: go.Spot.TopLeft,
            width: 22 / BpmnConstantsClass.Palscale, height: 22 / BpmnConstantsClass.Palscale
          },
          new go.Binding('fill', 'taskType', this.nodeActivityTaskTypeColorConverter),
          new go.Binding('figure', 'taskType', this.nodeActivityTaskTypeConverter)),
        // sub-process,  loop, parallel, sequential, ad doc and compensation markers
        this.makeMarkerPanel(false, BpmnConstantsClass.Palscale)
      ), // End Spot panel
      $(go.TextBlock,  // the center text
        {alignment: go.Spot.Center, textAlign: 'center', margin: 2},
        new go.Binding('text'))
    );  // End Node
  }

  getTooltipTemplate() {
    return $('ToolTip',
      $(go.TextBlock,
        {margin: 3, editable: true},
        new go.Binding('text', '', function (data) {
          if (data.item !== undefined) {
            return data.item;
          }
          return '(unnamed item)';
        }))
    );
  }

  getEventNodeTemplate(tooltiptemplate, sizeConverter = 1, getArrowShape = $(go.Shape, {visible: false})) {
    const self = this;
    return $(go.Node, 'Vertical',
      {
        locationObjectName: 'SHAPE',
        locationSpot: go.Spot.Center,
        toolTip: tooltiptemplate
      },
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      // can be resided according to the user's desires
      {resizable: false, resizeObjectName: 'SHAPE'},
      getArrowShape,
      $(go.Panel, 'Spot',
        $(go.Shape, 'Circle',  // Outer circle
          {
            strokeWidth: 1,
            name: 'SHAPE',
            desiredSize: new go.Size(BpmnConstantsClass.EventNodeSize / sizeConverter, BpmnConstantsClass.EventNodeSize / sizeConverter),
            portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
            fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide
          },
          // allows the color to be determined by the node data
          new go.Binding('fill', 'eventDimension', function (s) {
            return (s === 8) ? BpmnConstantsClass.EventEndOuterFillColor : BpmnConstantsClass.EventBackgroundColor;
          }),
          new go.Binding('strokeWidth', 'eventDimension', function (s) {
            return s === 8 ? BpmnConstantsClass.EventNodeStrokeWidthIsEnd : 1;
          }),
          new go.Binding('stroke', 'eventDimension', (s) => self.nodeEventDimensionStrokeColorConverter(s)),
          new go.Binding('strokeDashArray', 'eventDimension', function (s) {
            return (s === 3 || s === 6) ? [4, 2] : null;
          }),
          // TODO maybe uncomment this
          // new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)
        ),  // end main shape
        $(go.Shape, 'Circle',  // Inner circle
          {
            alignment: go.Spot.Center,
            desiredSize: new go.Size(BpmnConstantsClass.EventNodeInnerSize / sizeConverter, BpmnConstantsClass.EventNodeInnerSize / sizeConverter),
            fill: null
          },
          new go.Binding('stroke', 'eventDimension', (s) => self.nodeEventDimensionStrokeColorConverter(s)),
          new go.Binding('strokeDashArray', 'eventDimension', function (s) {
            return (s === 3 || s === 6) ? [4, 2] : null;
          }), // dashes for non-interrupting
          new go.Binding('visible', 'eventDimension', function (s) {
            return s > 3 && s <= 7;
          }) // inner  only visible for 4 thru 7
        ),
        $(go.Shape, 'NotAllowed',
          {
            alignment: go.Spot.Center,
            desiredSize: new go.Size(BpmnConstantsClass.EventNodeSymbolSize / sizeConverter, BpmnConstantsClass.EventNodeSymbolSize / sizeConverter),
            stroke: 'black'
          },
          new go.Binding('figure', 'eventType', (s) => self.nodeEventTypeConverter(s)),
          new go.Binding('fill', 'eventDimension', (s) => self.nodeEventDimensionSymbolFillConverter(s))
        ),
      ),  // end Auto Panel
      $(go.TextBlock,
        {alignment: go.Spot.Center, textAlign: 'center', margin: 5, editable: true},
        new go.Binding('text').makeTwoWay())
    ); // end go.Node Vertical
  }

  getGatewayNodeTemplateForPalette(tooltiptemplate) {
    const self = this;
    return $(go.Node, 'Vertical',
      {
        toolTip: tooltiptemplate,
        resizable: false,
        locationObjectName: 'SHAPE',
        locationSpot: go.Spot.Center,
        resizeObjectName: 'SHAPE'
      },
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Panel, 'Spot',
        $(go.Shape, 'Diamond',
          {
            strokeWidth: 1,
            fill: BpmnConstantsClass.GatewayNodeFill,
            stroke: BpmnConstantsClass.GatewayNodeStroke,
            name: 'SHAPE',
            desiredSize: new go.Size(BpmnConstantsClass.GatewayNodeSize / BpmnConstantsClass.Palscale, BpmnConstantsClass.GatewayNodeSize / BpmnConstantsClass.Palscale)
          }),
        $(go.Shape, 'NotAllowed',
          {
            alignment: go.Spot.Center,
            stroke: BpmnConstantsClass.GatewayNodeSymbolStroke,
            strokeWidth: BpmnConstantsClass.GatewayNodeSymbolStrokeWidth,
            fill: BpmnConstantsClass.GatewayNodeSymbolFill
          },
          new go.Binding('figure', 'gatewayType', (s) => self.nodeGatewaySymbolTypeConverter(s)),
          // tslint:disable-next-line:max-line-length
          // new go.Binding("visible", "gatewayType", function(s) { return s !== 4; }),   // comment out if you want exclusive gateway to be X instead of blank.
          new go.Binding('strokeWidth', 'gatewayType', function (s) {
            return (s <= 4) ? BpmnConstantsClass.GatewayNodeSymbolStrokeWidth : 1;
          }),
          new go.Binding('desiredSize', 'gatewayType', (s) => self.nodePalGatewaySymbolSizeConverter(s))),
        // the next 2 circles only show up for event gateway
        $(go.Shape, 'Circle',  // Outer circle
          {
            strokeWidth: 1,
            stroke: BpmnConstantsClass.GatewayNodeSymbolStroke,
            fill: null,
            desiredSize: new go.Size(BpmnConstantsClass.EventNodeSize / BpmnConstantsClass.Palscale, BpmnConstantsClass.EventNodeSize / BpmnConstantsClass.Palscale)
          },
          // new go.Binding("desiredSize", "gatewayType", new go.Size(this.EventNodeSize/2, this.EventNodeSize/2)),
          new go.Binding('visible', 'gatewayType', function (s) {
            return s >= 5;
          }) // only visible for > 5
        ),  // end main shape
        $(go.Shape, 'Circle',  // Inner circle
          {
            alignment: go.Spot.Center, stroke: BpmnConstantsClass.GatewayNodeSymbolStroke,
            desiredSize: new go.Size(BpmnConstantsClass.EventNodeInnerSize / BpmnConstantsClass.Palscale, BpmnConstantsClass.EventNodeInnerSize / BpmnConstantsClass.Palscale),
            fill: null
          },
          new go.Binding('visible', 'gatewayType', function (s) {
            return s === 5;
          }) // inner  only visible for == 5
        )),

      $(go.TextBlock,
        {alignment: go.Spot.Center, textAlign: 'center', margin: 5, editable: false},
        new go.Binding('text'))
    );
  }

  getAnnotationNodeTemplate(linkedArrowShape = $(go.Shape, {visible: false})) {
    return $(go.Node, 'Auto',
      {background: BpmnConstantsClass.GradientLightGray, locationSpot: go.Spot.Center},
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      linkedArrowShape,
      $(go.Shape, 'Annotation', // A left bracket shape
        {
          portId: '', fromLinkable: true, cursor: 'pointer', fromSpot: go.Spot.Left,
          strokeWidth: 2, stroke: 'gray', fill: 'transparent'
        }),
      $(go.TextBlock,
        {margin: 5, editable: true},
        new go.Binding('text').makeTwoWay())
    );
  }

  getDataObjectNodeTemplate(linkedArrowShape = $(go.Shape, {visible: false})) {
    return $(go.Node, 'Vertical',
      {locationObjectName: 'SHAPE', locationSpot: go.Spot.Center},
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      linkedArrowShape,
      $(go.Shape, 'File',
        {
          name: 'SHAPE',
          portId: '',
          fromLinkable: true,
          toLinkable: true,
          cursor: 'pointer',
          fill: BpmnConstantsClass.DataFill,
          desiredSize: new go.Size(BpmnConstantsClass.EventNodeSize * 0.8, BpmnConstantsClass.EventNodeSize)
        }),
      $(go.TextBlock,
        {
          margin: 5,
          editable: true
        },
        new go.Binding('text').makeTwoWay())
    );
  }

  getDataStoreNodeTemplate(linkedArrowShape = $(go.Shape, {visible: false})) {
    return $(go.Node, 'Vertical',
      {locationObjectName: 'SHAPE', locationSpot: go.Spot.Center},
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      linkedArrowShape,
      $(go.Shape, 'Database',
        {
          name: 'SHAPE',
          portId: '',
          fromLinkable: true,
          toLinkable: true,
          cursor: 'pointer',
          fill: BpmnConstantsClass.DataFill,
          desiredSize: new go.Size(BpmnConstantsClass.EventNodeSize, BpmnConstantsClass.EventNodeSize)
        }),
      $(go.TextBlock,
        {margin: 5, editable: true},
        new go.Binding('text').makeTwoWay())
    );
  }

  getPrivateProcessingNodeTempalteForPalette() {
    return $(go.Node, 'Vertical',
      {locationSpot: go.Spot.Center},
      $(go.Shape, 'Process',
        {
          fill: BpmnConstantsClass.DataFill,
          desiredSize: new go.Size(BpmnConstantsClass.GatewayNodeSize / 2, BpmnConstantsClass.GatewayNodeSize / 4)
        }),
      $(go.TextBlock,
        {margin: 5, editable: true},
        new go.Binding('text'))
    );
  }

  getSubProcessGroupTemplateForPalette() {
    return $(go.Group, 'Vertical',
      {
        locationObjectName: 'SHAPE',
        locationSpot: go.Spot.Center,
        isSubGraphExpanded: false,
        selectionAdorned: false
      },
      $(go.Panel, 'Spot',
        {
          name: 'PANEL',
          desiredSize: new go.Size(
            BpmnConstantsClass.ActivityNodeWidth / BpmnConstantsClass.Palscale,
            BpmnConstantsClass.ActivityNodeHeight / BpmnConstantsClass.Palscale)
        },
        $(go.Shape, 'RoundedRectangle',  // the outside rounded rectangle
          {
            name: 'SHAPE',
            fill: BpmnConstantsClass.ActivityNodeFill, stroke: BpmnConstantsClass.ActivityNodeStroke,
            parameter1: 10 / BpmnConstantsClass.Palscale  // corner size (default 10)
          },
          new go.Binding('strokeWidth', 'isCall', function (s) {
            return s ? BpmnConstantsClass.ActivityNodeStrokeWidthIsCall : BpmnConstantsClass.ActivityNodeStrokeWidth;
          })
        ),
        $(go.Shape, 'RoundedRectangle',  // the inner "Transaction" rounded rectangle
          {
            margin: 3,
            stretch: go.GraphObject.Fill,
            stroke: BpmnConstantsClass.ActivityNodeStroke,
            parameter1: 8 / BpmnConstantsClass.Palscale, fill: null, visible: false
          },
          new go.Binding('visible', 'isTransaction')),
        this.makeMarkerPanel(true, BpmnConstantsClass.Palscale) // sub-process,  loop, parallel, sequential, ad doc and compensation markers
      ), // end main body rectangles spot panel
      $(go.TextBlock,  // the center text
        {alignment: go.Spot.Center, textAlign: 'center', margin: 2},
        new go.Binding('text'))
    );  // end go.Group
  }

  getPoolTemplateForPalette() {
    return $(go.Group, 'Vertical',
      {
        locationSpot: go.Spot.Center,
        computesBoundsIncludingLinks: false,
        isSubGraphExpanded: false
      },
      $(go.Shape, 'Process',
        {
          fill: 'white',
          desiredSize: new go.Size(BpmnConstantsClass.GatewayNodeSize / 2, BpmnConstantsClass.GatewayNodeSize / 4)
        }),
      $(go.Shape, 'Process',
        {
          fill: 'white',
          desiredSize: new go.Size(BpmnConstantsClass.GatewayNodeSize / 2, BpmnConstantsClass.GatewayNodeSize / 4)
        }),
      $(go.TextBlock,
        {margin: 5, editable: true},
        new go.Binding('text'))
    );
  }

  getSwimLanesGroupTemplateForPalette() {
    return $(go.Group, 'Vertical'); // empty in the palette
  }

  isElementMappedToBPMNMappers(element: PaletteElementModel): boolean {
    const elementType = PaletteElementModel.getProbableElementType(element);
    if (elementType === 'ModelingElement' || elementType === 'ModelingContainer') {
      const modellingLanguageConstruct = PaletteElementModel.getProbableModellingConstruct(element);
      return !!Mappers.dictionaryAOAMEBPMNElementToGoJsNode.get(modellingLanguageConstruct)
        || !!Mappers.dictionaryAOAMEBPMNGroupToGoJsGroup.get(modellingLanguageConstruct);
    }
    return false;
  }

  isElementBlacklisted(element: PaletteElementModel) {
    if (PaletteElementModel.getProbableElementType(element) === 'ModelingContainer'
      && PaletteElementModel.getProbableModellingConstruct(element) === 'Lane') {
      return true;
    }
    return false;
  }
}

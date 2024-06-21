import * as go from 'gojs';
const $ = go.GraphObject.make;

export class BpmnConstantsClass {
  // constants for design choices
  static GradientYellow = $(go.Brush, 'Linear', {0: 'LightGoldenRodYellow', 1: '#FFFF66'});
  static GradientLightGreen = $(go.Brush, 'Linear', { 0: '#E0FEE0', 1: 'PaleGreen' });
  static GradientLightGray = $(go.Brush, 'Linear', {0: 'White', 1: '#DADADA'});

  static ActivityNodeFill = $(go.Brush, 'Linear', {0: 'OldLace', 1: 'PapayaWhip'});
  static ActivityNodeStroke = '#CDAA7D';
  static ActivityMarkerStrokeWidth = 1.5;
  static ActivityNodeWidth = 120;
  static ActivityNodeHeight = 80;
  static ActivityNodeStrokeWidth = 1;
  static ActivityNodeStrokeWidthIsCall = 4;

  static SubprocessNodeFill = BpmnConstantsClass.ActivityNodeFill;
  static SubprocessNodeStroke = BpmnConstantsClass.ActivityNodeStroke;

  static EventNodeSize = 42;
  static EventNodeInnerSize = BpmnConstantsClass.EventNodeSize - 6;
  static EventNodeSymbolSize = BpmnConstantsClass.EventNodeInnerSize - 14;
  static EventEndOuterFillColor = 'pink';
  static EventBackgroundColor = BpmnConstantsClass.GradientLightGreen;
  static EventSymbolLightFill = 'white';
  static EventSymbolDarkFill = 'dimgray';
  static EventDimensionStrokeColor = 'green';
  static EventDimensionStrokeEndColor = 'red';
  static EventNodeStrokeWidthIsEnd = 4;

  static GatewayNodeSize = 80;
  static GatewayNodeSymbolSize = 45;
  static GatewayNodeFill = BpmnConstantsClass.GradientYellow;
  static GatewayNodeStroke = 'darkgoldenrod';
  static GatewayNodeSymbolStroke = 'darkgoldenrod';
  static GatewayNodeSymbolFill = BpmnConstantsClass.GradientYellow;
  static GatewayNodeSymbolStrokeWidth = 3;

  static DataFill = BpmnConstantsClass.GradientLightGray;

  static Palscale = 2;
}

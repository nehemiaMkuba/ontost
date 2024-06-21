import * as go from 'gojs';
import {BPMNLinkingTool} from './bpmn-linking-tool.class';

/**
 * BPMNRelinkingTool, a custom relinking tool to switch the class of the link reconnected.
 *
 * Used in the <a href="../../projects/bpmn/BPMN.html">BPMN extension</a>.
 */
export class BPMNRelinkingTool extends go.RelinkingTool {
  constructor() {
    super();
    // orthogonal routing during linking
    this.temporaryLink.routing = go.Link.Orthogonal;
    // link validation using the validate methods defined below
    this.linkValidation = (fromnode: go.Node, fromport: go.GraphObject, tonode: go.Node, toport: go.GraphObject) => {
      return BPMNLinkingTool.validateSequenceLinkConnection(fromnode, fromport, tonode, toport) ||
        BPMNLinkingTool.validateMessageLinkConnection(fromnode, fromport, tonode, toport);
    };
  }

  /**
   * Override {@link RelinkingTool#reconnectLink} to do some extra BPMN-specific processing.
   */
  public reconnectLink(existinglink: go.Link, newnode: go.Node | null, newport: go.GraphObject | null, toend: boolean): boolean {
    const diagram = existinglink.diagram;
    if (diagram === null) {
      return false;
    }
    const model = diagram.model as go.GraphLinksModel;
    if (model === null) {
      return false;
    }

    function recreateLinkData(data: any, cat: string) {
      // Copy existing data, then set from, to, and category
      const copy = model.copyLinkData(data) as any;
      copy.from = data.from;
      copy.to = data.to;
      copy.category = cat;
      copy.points = undefined; // don't keep points from existing link
      model.removeLinkData(data);
      model.addLinkData(copy);
    }

    if (super.reconnectLink(existinglink, newnode, newport, toend)) {
      const data = existinglink.data;
      const fromnode = existinglink.fromNode;
      const fromport = existinglink.fromPort;
      const tonode = existinglink.toNode;
      const toport = existinglink.toPort;
      if (fromnode !== null && fromport !== null && tonode !== null && toport !== null) {
        diagram.startTransaction('Relink updates');
        if (BPMNLinkingTool.validateMessageLinkConnection(fromnode, fromport, tonode, toport)) {
          // Recreate the link if the category changed, since it is a different class
          if (existinglink.category !== 'msg') {
            recreateLinkData(data, 'msg');
          }
        }

        // maybe make the label visible
        if (fromnode.category === 'gateway') {
          const label = existinglink.findObject('Label');
          if (label !== null) {
            label.visible = true;
          }
        }
        diagram.commitTransaction('Relink updates');
      }
      return true;
    }
    return false;
  }
}

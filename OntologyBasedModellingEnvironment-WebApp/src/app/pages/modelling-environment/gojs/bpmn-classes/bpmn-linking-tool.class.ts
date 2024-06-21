import * as go from 'gojs';
/**
 * BPMNLinkingTool, a custom linking tool to switch the class of the link created.
 *
 * Used in the <a href="../../projects/bpmn/BPMN.html">BPMN extension</a>.
 * @category Extension
 */
export class BPMNLinkingTool extends go.LinkingTool {
  constructor() {
    super();
    // don't allow user to create link starting on the To node
    this.direction = go.LinkingTool.ForwardsOnly;
    // orthogonal routing during linking
    this.temporaryLink.routing = go.Link.Orthogonal;
    // link validation using the validate methods defined below
    this.linkValidation = (fromnode: go.Node, fromport: go.GraphObject, tonode: go.Node, toport: go.GraphObject) => {
      return BPMNLinkingTool.validateSequenceLinkConnection(fromnode, fromport, tonode, toport) ||
        BPMNLinkingTool.validateMessageLinkConnection(fromnode, fromport, tonode, toport);
    };
  }

  /**
   * Override {@link LinkingTool#insertLink} to do some extra BPMN-specific processing.
   */
  public insertLink(fromnode: go.Node, fromport: go.GraphObject, tonode: go.Node, toport: go.GraphObject): go.Link | null {
    let lsave = null;
    // maybe temporarily change the link data that is copied to create the new link
    if (BPMNLinkingTool.validateMessageLinkConnection(fromnode, fromport, tonode, toport)) {
      lsave = this.archetypeLinkData;
      this.archetypeLinkData = { category: 'msg' };
    }

    // create the link in the standard manner by calling the base method
    const newlink = super.insertLink(fromnode, fromport, tonode, toport);

    // maybe make the label visible
    if (newlink !== null && fromnode.category === 'gateway') {
      const label = newlink.findObject('Label');
      if (label !== null) label.visible = true;
    }

    // maybe restore the original archetype link data
    if (lsave !== null) this.archetypeLinkData = lsave;
    return newlink;
  }

  // static utility validation routines for linking & relinking as well as insert link logic

  /**
   * Validate that sequence links don't cross subprocess or pool boundaries.
   */
  public static validateSequenceLinkConnection(fromnode: go.Node, fromport: go.GraphObject, tonode: go.Node, toport: go.GraphObject): boolean {
    if (fromnode.category === null || tonode.category === null) return true;

    // if either node is in a subprocess, both nodes must be in same subprocess (even for Message Flows)
    if ((fromnode.containingGroup !== null && fromnode.containingGroup.category === 'subprocess') ||
      (tonode.containingGroup !== null && tonode.containingGroup.category === 'subprocess')) {
      if (fromnode.containingGroup !== tonode.containingGroup) return false;
    }

    if (fromnode.containingGroup === tonode.containingGroup) return true;  // a valid Sequence Flow
    // also check for children in common pool
    const common = fromnode.findCommonContainingGroup(tonode);
    return common != null;
  }

  /**
   * Validate that message links cross pool boundaries.
   */
  public static validateMessageLinkConnection(fromnode: go.Node, fromport: go.GraphObject, tonode: go.Node, toport: go.GraphObject): boolean {
    if (fromnode.category === null || tonode.category === null) return true;

    if (fromnode.category === 'privateProcess' || tonode.category === 'privateProcess') return true;

    // if either node is in a subprocess, both nodes must be in same subprocess (even for Message Flows)
    if ((fromnode.containingGroup !== null && fromnode.containingGroup.category === 'subprocess') ||
      (tonode.containingGroup !== null && tonode.containingGroup.category === 'subprocess')) {
      if (fromnode.containingGroup !== tonode.containingGroup) return false;
    }

    if (fromnode.containingGroup === tonode.containingGroup) return false;  // an invalid Message Flow

    // also check if fromnode and tonode are in same pool
    const common = fromnode.findCommonContainingGroup(tonode);
    return common === null;
  }
}

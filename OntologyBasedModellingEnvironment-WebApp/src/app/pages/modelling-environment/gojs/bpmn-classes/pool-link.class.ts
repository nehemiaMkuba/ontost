import * as go from 'gojs';

// Contains PoolLink and BPMNLinkingTool classes for the BPMN sample

/**
 * PoolLink, a special Link class for message flows from edges of pools
 *
 * Used in the <a href="../../projects/bpmn/BPMN.html">BPMN extension</a>.
 */
export class PoolLink extends go.Link {
  /**
   * @hidden @internal
   */
  public getLinkPoint(node: go.Node, port: go.GraphObject, spot: go.Spot, from: boolean, ortho: boolean, othernode: go.Node, otherport: go.GraphObject): go.Point {
    const r = new go.Rect(port.getDocumentPoint(go.Spot.TopLeft), port.getDocumentPoint(go.Spot.BottomRight));
    const op = super.getLinkPoint(othernode, otherport, spot, from, ortho, node, port);

    const below = op.y > r.centerY;
    const y = below ? r.bottom : r.top;
    if (node.category === 'privateProcess') {
      if (op.x < r.left) return new go.Point(r.left, y);
      if (op.x > r.right) return new go.Point(r.right, y);
      return new go.Point(op.x, y);
    } else { // otherwise get the standard link point by calling the base class method
      return super.getLinkPoint(node, port, spot, from, ortho, othernode, otherport);
    }
  }

  /**
   * @hidden @internal
   * If there are two links from & to same node... and pool is offset in X from node... the link toPoints collide on pool
   */
  public computeOtherPoint(othernode: go.Node, otherport: go.GraphObject): go.Point {
    const op = super.computeOtherPoint(othernode, otherport);
    let node = this.toNode;
    if (node === othernode) node = this.fromNode;
    if (node !== null) {
      if (othernode.category === 'privateProcess') {
        op.x = node.getDocumentPoint(go.Spot.MiddleBottom).x;
      } else {
        if ((node === this.fromNode) !== (node.actualBounds.centerY < othernode.actualBounds.centerY)) {
          op.x -= 1;
        } else {
          op.x += 1;
        }
      }
    }
    return op;
  }

  /**
   * @hidden @internal
   */
  public getLinkDirection(node: go.Node, port: go.GraphObject, linkpoint: go.Point, spot: go.Spot,
                          from: boolean, ortho: boolean, othernode: go.Node, otherport: go.GraphObject): number {
    if (node.category === 'privateProcess') {
      const p = port.getDocumentPoint(go.Spot.Center);
      const op = otherport.getDocumentPoint(go.Spot.Center);
      const below = op.y > p.y;
      return below ? 90 : 270;
    } else {
      return super.getLinkDirection.call(this, node, port, linkpoint, spot, from, ortho, othernode, otherport);
    }
  }
}

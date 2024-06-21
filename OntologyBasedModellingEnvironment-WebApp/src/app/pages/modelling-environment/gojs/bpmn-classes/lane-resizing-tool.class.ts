import * as go from 'gojs';
import {BpmnLaneHelpers} from './bpmn-lane-helpers';

// define a custom ResizingTool to limit how far one can shrink a lane Grou
export class LaneResizingTool extends go.ResizingTool {
  private relayoutDiagram: Function;

  constructor(private relayoutDiagramHandler: Function
              ) {
    super();
    this.relayoutDiagram = relayoutDiagramHandler;
  }

  public isLengthening() {
    return (this.handle !== null && this.handle.alignment === go.Spot.Right);
  }

  public computeMinSize(): go.Size {
    if (this.adornedObject === null) {
      return new go.Size(BpmnLaneHelpers.MINLENGTH, BpmnLaneHelpers.MINBREADTH);
    }
    const lane = this.adornedObject.part;
    if (!(lane instanceof go.Group)) {
      // @ts-ignore
      return go.ResizingTool.prototype.computeMinSize.call(this);
    }
    // assert(lane instanceof go.Group && lane.category !== "Pool");
    const msz = BpmnLaneHelpers.computeMinLaneSize(lane);  // get the absolute minimum size
    if (lane.containingGroup !== null && this.isLengthening()) {  // compute the minimum length of all lanes
      const sz = BpmnLaneHelpers.computeMinPoolSize(lane.containingGroup);
      msz.width = Math.max(msz.width, sz.width);
    } else {  // find the minimum size of this single lane
      const sz = BpmnLaneHelpers.computeLaneSize(lane);
      msz.width = Math.max(msz.width, sz.width);
      msz.height = Math.max(msz.height, sz.height);
    }
    return msz;
  }

  public resize(newr: go.Rect): void {
    if (this.adornedObject === null) {
      return;
    }
    const lane = this.adornedObject.part;
    if (!(lane instanceof go.Group)) {
      return go.ResizingTool.prototype.resize.call(this, newr);
    }
    if (lane instanceof go.Group && lane.containingGroup !== null && this.isLengthening()) {  // changing the length of all of the lanes
      lane.containingGroup.memberParts.each((l) => {
        if (!(l instanceof go.Group)) {
          return;
        }
        const shape = l.resizeObject;
        if (shape !== null) {  // set its desiredSize length, but leave each breadth alone
          shape.width = newr.width;
        }
      });
    } else {  // changing the breadth of a single lane
      super.resize.call(this, newr);
    }
    this.relayoutDiagram();  // now that the lane has changed size, layout the pool again
  }
}

// end LaneResizingTool class

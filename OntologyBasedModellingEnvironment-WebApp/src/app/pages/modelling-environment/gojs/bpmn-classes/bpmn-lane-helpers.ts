import * as go from 'gojs';

export class BpmnLaneHelpers {
  static MINLENGTH = 400;  // this controls the minimum length of any swimlane
  static MINBREADTH = 20;  // this controls the minimum breadth of any non-collapsed swimlane

  // compute the minimum size of a Pool Group needed to hold all of the Lane Groups
  static computeMinPoolSize(pool: go.Group) {
    // assert(pool instanceof go.Group && pool.category === "Pool");
    let len = BpmnLaneHelpers.MINLENGTH;
    pool.memberParts.each(function (lane) {
      // pools ought to only contain lanes, not plain Nodes
      if (!(lane instanceof go.Group)) { return; }
      const holder = lane.placeholder;
      if (holder !== null) {
        const sz = holder.actualBounds;
        len = Math.max(len, sz.width);
      }
    });
    return new go.Size(len, NaN);
  }

  static assignGroupLayer(grp: go.Part): void {
    if (!(grp instanceof go.Group)) { return; }
    let lay = grp.isSelected ? 'Foreground' : '';
    grp.layerName = lay;
    grp.findSubGraphParts().each(function(m: go.Part) { m.layerName = lay; });
  }

  // compute the minimum size for a particular Lane Group
  static computeLaneSize(lane: go.Group) {
    // assert(lane instanceof go.Group && lane.category !== "Pool");
    const sz = BpmnLaneHelpers.computeMinLaneSize(lane);
    if (lane.isSubGraphExpanded) {
      const holder = lane.placeholder;
      if (holder !== null) {
        const hsz = holder.actualBounds;
        sz.height = Math.max(sz.height, hsz.height);
      }
    }
    // minimum breadth needs to be big enough to hold the header
    const hdr = lane.findObject('HEADER');
    if (hdr !== null) { sz.height = Math.max(sz.height, hdr.actualBounds.height); }
    return sz;
  }

  // determine the minimum size of a Lane Group, even if collapsed
  static computeMinLaneSize(lane: go.Group) {
    if (!lane.isSubGraphExpanded) { return new go.Size(BpmnLaneHelpers.MINLENGTH, 1); }
    return new go.Size(BpmnLaneHelpers.MINLENGTH, BpmnLaneHelpers.MINBREADTH);
  }
}

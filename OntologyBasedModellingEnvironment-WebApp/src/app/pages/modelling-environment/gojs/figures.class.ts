import * as go from 'gojs';

export class FiguresClass {
  private goRef: any;

  private KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
  private _CachedPoints = [];
  defaultValue: any;
  minimum: any;
  maximum: any;

  private GeneratorEllipseSpot1 = new go.Spot(0.156, 0.156);
  private GeneratorEllipseSpot2 = new go.Spot(0.844, 0.844);

  constructor() {
  }

  private tempPoint() {
    const temp = this._CachedPoints.pop();
    if (temp === undefined) {
      return new go.Point();
    }
    return temp;
  }

  private freePoint(temp) {
    this._CachedPoints.push(temp);
  }

  private breakUpBezier(startx, starty, c1x, c1y, c2x, c2y, endx, endy, fraction, curve1cp1, curve1cp2, midpoint, curve2cp1, curve2cp2) {
    const fo = 1 - fraction;
    const so = fraction;
    const m1x = (startx * fo + c1x * so);
    const m1y = (starty * fo + c1y * so);
    const m2x = (c1x * fo + c2x * so);
    const m2y = (c1y * fo + c2y * so);
    const m3x = (c2x * fo + endx * so);
    const m3y = (c2y * fo + endy * so);
    const m12x = (m1x * fo + m2x * so);
    const m12y = (m1y * fo + m2y * so);
    const m23x = (m2x * fo + m3x * so);
    const m23y = (m2y * fo + m3y * so);
    const m123x = (m12x * fo + m23x * so);
    const m123y = (m12y * fo + m23y * so);
    curve1cp1.x = m1x;
    curve1cp1.y = m1y;
    curve1cp2.x = m12x;
    curve1cp2.y = m12y;
    midpoint.x = m123x;
    midpoint.y = m123y;
    curve2cp1.x = m23x;
    curve2cp1.y = m23y;
    curve2cp2.x = m3x;
    curve2cp2.y = m3y;
  }

  getIntersection(p1x, p1y, p2x, p2y, q1x, q1y, q2x, q2y, result) {
    const dx1 = p1x - p2x;
    const dx2 = q1x - q2x;
    let x;
    let y;
    if (dx1 === 0 || dx2 === 0) {
      if (dx1 === 0) {
        const m2 = (q1y - q2y) / dx2;
        const b2 = q1y - m2 * q1x;
        x = p1x;
        y = m2 * x + b2;
      } else {
        const m1 = (p1y - p2y) / dx1;
        const b1 = p1y - m1 * p1x;
        x = q1x;
        y = m1 * x + b1;
      }
    } else {
      const m1 = (p1y - p2y) / dx1;
      const m2 = (q1y - q2y) / dx2;
      const b1 = p1y - m1 * p1x;
      const b2 = q1y - m2 * q1x;
      x = (b2 - b1) / (m1 - m2);
      y = m1 * x + b1;
    }
    result.x = x;
    result.y = y;
    return result;
  }

  defineShapes() {
    const self = this;
    const handGeo = go.Geometry.parse('F1M18.13,10.06 C18.18,10.07 18.22,10.07 18.26,10.08 18.91,' +
      '10.20 21.20,10.12 21.28,12.93 21.36,15.75 21.42,32.40 21.42,32.40 21.42,' +
      '32.40 21.12,34.10 23.08,33.06 23.08,33.06 22.89,24.76 23.80,24.17 24.72,' +
      '23.59 26.69,23.81 27.19,24.40 27.69,24.98 28.03,24.97 28.03,33.34 28.03,' +
      '33.34 29.32,34.54 29.93,33.12 30.47,31.84 29.71,27.11 30.86,26.56 31.80,' +
      '26.12 34.53,26.12 34.72,28.29 34.94,30.82 34.22,36.12 35.64,35.79 35.64,' +
      '35.79 36.64,36.08 36.72,34.54 36.80,33.00 37.17,30.15 38.42,29.90 39.67,' +
      '29.65 41.22,30.20 41.30,32.29 41.39,34.37 42.30,46.69 38.86,55.40 35.75,' +
      '63.29 36.42,62.62 33.47,63.12 30.76,63.58 26.69,63.12 26.69,63.12 26.69,' +
      '63.12 17.72,64.45 15.64,57.62 13.55,50.79 10.80,40.95 7.30,38.95 3.80,' +
      '36.95 4.24,36.37 4.28,35.35 4.32,34.33 7.60,31.25 12.97,35.75 12.97,' +
      '35.75 16.10,39.79 16.10,42.00 16.10,42.00 15.69,14.30 15.80,12.79 15.96,' +
      '10.75 17.42,10.04 18.13,10.06z ');
    handGeo.rotate(90, 0, 0);
    handGeo.normalize();

    go.Shape.defineFigureGenerator('BpmnTaskManual', function (shape, w, h) {
      const geo = handGeo.copy();
      // calculate how much to scale the Geometry so that it fits in w x h
      const bounds = geo.bounds;
      const scale = Math.min(w / bounds.width, h / bounds.height);
      geo.scale(scale, scale);
      // guess where text should go (in the hand)
      geo.spot1 = new go.Spot(0, 0.6, 10, 0);
      geo.spot2 = new go.Spot(1, 1);
      return geo;
    });

    go.Shape.defineFigureGenerator('NotAllowed', function (shape, w, h) {
      const geo = new go.Geometry();
      let cpOffset = self.KAPPA * .5;
      let radius = .5;
      const centerx = .5;
      const centery = .5;
      const fig = new go.PathFigure(centerx * w, (centery - radius) * h);
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Bezier, (centerx - radius) * w, centery * h, (centerx - cpOffset) * w, (centery - radius) * h, (centerx - radius) * w, (centery - cpOffset) * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, centerx * w, (centery + radius) * h, (centerx - radius) * w, (centery + cpOffset) * h, (centerx - cpOffset) * w, (centery + radius) * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, (centerx + radius) * w, centery * h, (centerx + cpOffset) * w, (centery + radius) * h, (centerx + radius) * w, (centery + cpOffset) * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, centerx * w, (centery - radius) * h, (centerx + radius) * w, (centery - cpOffset) * h, (centerx + cpOffset) * w, (centery - radius) * h));
      // Inner circle, composed of two parts, separated by
      // a beam across going from top-right to bottom-left.
      radius = .40;
      cpOffset = self.KAPPA * .40;
      // First we cut up the top right 90 degree curve into two smaller
      // curves.
      // Since its clockwise, StartOfArrow is the first of the two points
      // on the circle. EndOfArrow is the other one.
      const startOfArrowc1 = self.tempPoint();
      const startOfArrowc2 = self.tempPoint();
      const startOfArrow = self.tempPoint();
      const unused = self.tempPoint();
      self.breakUpBezier(centerx, centery - radius, centerx + cpOffset, centery - radius, centerx + radius, centery - cpOffset, centerx + radius, centery, .42, startOfArrowc1, startOfArrowc2, startOfArrow, unused, unused);
      const endOfArrowc1 = self.tempPoint();
      const endOfArrowc2 = self.tempPoint();
      const endOfArrow = self.tempPoint();
      self.breakUpBezier(centerx, centery - radius, centerx + cpOffset, centery - radius, centerx + radius, centery - cpOffset, centerx + radius, centery, .58, unused, unused, endOfArrow, endOfArrowc1, endOfArrowc2);
      // Cut up the bottom left 90 degree curve into two smaller curves.
      const startOfArrow2c1 = self.tempPoint();
      const startOfArrow2c2 = self.tempPoint();
      const startOfArrow2 = self.tempPoint();
      self.breakUpBezier(centerx, centery + radius, centerx - cpOffset, centery + radius, centerx - radius, centery + cpOffset, centerx - radius, centery, .42, startOfArrow2c1, startOfArrow2c2, startOfArrow2, unused, unused);
      const endOfArrow2c1 = self.tempPoint();
      const endOfArrow2c2 = self.tempPoint();
      const endOfArrow2 = self.tempPoint();
      self.breakUpBezier(centerx, centery + radius, centerx - cpOffset, centery + radius, centerx - radius, centery + cpOffset, centerx - radius, centery, .58, unused, unused, endOfArrow2, endOfArrow2c1, endOfArrow2c2);
      fig.add(new go.PathSegment(go.PathSegment.Move, endOfArrow2.x * w, endOfArrow2.y * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, (centerx - radius) * w, centery * h, endOfArrow2c1.x * w, endOfArrow2c1.y * h, endOfArrow2c2.x * w, endOfArrow2c2.y * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, centerx * w, (centery - radius) * h, (centerx - radius) * w, (centery - cpOffset) * h, (centerx - cpOffset) * w, (centery - radius) * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, startOfArrow.x * w, startOfArrow.y * h, startOfArrowc1.x * w, startOfArrowc1.y * h, startOfArrowc2.x * w, startOfArrowc2.y * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, endOfArrow2.x * w, endOfArrow2.y * h).close());
      fig.add(new go.PathSegment(go.PathSegment.Move, startOfArrow2.x * w, startOfArrow2.y * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, endOfArrow.x * w, endOfArrow.y * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, (centerx + radius) * w, centery * h, endOfArrowc1.x * w, endOfArrowc1.y * h, endOfArrowc2.x * w, endOfArrowc2.y * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, centerx * w, (centery + radius) * h, (centerx + radius) * w, (centery + cpOffset) * h, (centerx + cpOffset) * w, (centery + radius) * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, startOfArrow2.x * w, startOfArrow2.y * h, startOfArrow2c1.x * w, startOfArrow2c1.y * h, startOfArrow2c2.x * w, startOfArrow2c2.y * h).close());
      self.freePoint(startOfArrowc1);
      self.freePoint(startOfArrowc2);
      self.freePoint(startOfArrow);
      self.freePoint(unused);
      self.freePoint(endOfArrowc1);
      self.freePoint(endOfArrowc2);
      self.freePoint(endOfArrow);
      self.freePoint(startOfArrow2c1);
      self.freePoint(startOfArrow2c2);
      self.freePoint(startOfArrow2);
      self.freePoint(endOfArrow2c1);
      self.freePoint(endOfArrow2c2);
      self.freePoint(endOfArrow2);
      geo.defaultStretch = go.GraphObject.Uniform;
      return geo;
    });

    go.Shape.defineFigureGenerator('BpmnTaskScript', function (shape, w, h) {
      const geo = new go.Geometry();
      const fig = new go.PathFigure(.7 * w, h, true);
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Line, .3 * w, h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, 0.3 * w, 0, .6 * w, .5 * h, 0, .5 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, .7 * w, 0));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, .7 * w, h, .4 * w, .5 * h, w, .5 * h).close());
      const fig2 = new go.PathFigure(.45 * w, .73 * h, false);
      geo.add(fig2);
      // Lines on script
      fig2.add(new go.PathSegment(go.PathSegment.Line, .7 * w, .73 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Move, .38 * w, .5 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, .63 * w, .5 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Move, .31 * w, .27 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, .56 * w, .27 * h));
      return geo;
    });

    go.Shape.defineFigureGenerator('BpmnActivityLoop', function (shape, w, h) {
      const geo = new go.Geometry();
      const r = .5;
      const cx = 0; // offset from Center x
      const cy = 0; // offset from Center y
      const d = r * self.KAPPA;
      const mx1 = (.4 * Math.SQRT2 / 2 + .5);
      const my1 = (.5 - .5 * Math.SQRT2 / 2);
      const x1 = 1;
      const y1 = .5;
      const x2 = .5;
      const y2 = 0;
      const fig = new go.PathFigure(mx1 * w, (1 - my1) * h, false);
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Bezier, x1 * w, y1 * h, x1 * w, .7 * h, x1 * w, y1 * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, (x2 + cx) * w, (y2 + cx) * h, (.5 + r + cx) * w, (.5 - d + cx) * h, (.5 + d + cx) * w, (.5 - r + cx) * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, (.5 - r + cx) * w, (.5 + cy) * h, (.5 - d + cx) * w, (.5 - r + cy) * h, (.5 - r + cx) * w, (.5 - d + cy) * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, (.35 + cx) * w, .9 * h, (.5 - r + cx) * w, (.5 + d + cy) * h, (.5 - d + cx) * w, .9 * h));
      // Arrowhead
      fig.add(new go.PathSegment(go.PathSegment.Move, (.25 + cx) * w, 0.8 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, (.35 + cx) * w, 0.9 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, (.20 + cx) * w, 0.95 * h));
      return geo;
    });

    go.Shape.defineFigureGenerator('BpmnActivityParallel', function (shape, w, h) {
      const geo = new go.Geometry();
      const fig = new go.PathFigure(0, 0, false);
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Line, 0, h));
      fig.add(new go.PathSegment(go.PathSegment.Move, .5 * w, 0));
      fig.add(new go.PathSegment(go.PathSegment.Line, .5 * w, h));
      fig.add(new go.PathSegment(go.PathSegment.Move, w, 0));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
      return geo;
    });

    go.Shape.defineFigureGenerator('BpmnActivitySequential', function (shape, w, h) {
      const geo = new go.Geometry();
      const fig = new go.PathFigure(0, 0, false);
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Line, w, 0));
      fig.add(new go.PathSegment(go.PathSegment.Move, 0, .5 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, .5 * h));
      fig.add(new go.PathSegment(go.PathSegment.Move, 0, h));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
      return geo;
    });

    go.Shape.defineFigureGenerator('BpmnActivityAdHoc', function (shape, w, h) {
      const geo = new go.Geometry();
      const fig = new go.PathFigure(0, 0, false);
      geo.add(fig);
      const fig2 = new go.PathFigure(w, h, false);
      geo.add(fig2);
      const fig3 = new go.PathFigure(0, .5 * h, false);
      geo.add(fig3);
      fig3.add(new go.PathSegment(go.PathSegment.Bezier, .5 * w, .5 * h, .2 * w, .35 * h, .3 * w, .35 * h));
      fig3.add(new go.PathSegment(go.PathSegment.Bezier, w, .5 * h, .7 * w, .65 * h, .8 * w, .65 * h));
      return geo;
    });

    go.Shape.defineFigureGenerator('BpmnActivityCompensation', function (shape, w, h) {
      const geo = new go.Geometry();
      const fig = new go.PathFigure(0, .5 * h, true);
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Line, .5 * w, 0));
      fig.add(new go.PathSegment(go.PathSegment.Line, .5 * w, .5 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, 0));
      fig.add(new go.PathSegment(go.PathSegment.Line, .5 * w, .5 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, .5 * w, h).close());
      return geo;
    });
    go.Shape.defineFigureGenerator('BpmnTaskMessage', function (shape, w, h) {
      const geo = new go.Geometry();
      let fig = new go.PathFigure(0, .2 * h, true);
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Line, w, .2 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, .8 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, 0, .8 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, 0, .8 * h).close());
      fig = new go.PathFigure(0, .2 * h, false);
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Line, .5 * w, .5 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, .2 * h));
      return geo;
    });
    go.Shape.defineFigureGenerator('BpmnTaskScript', function (shape, w, h) {
      const geo = new go.Geometry();
      const fig = new go.PathFigure(.7 * w, h, true);
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Line, .3 * w, h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, 0.3 * w, 0, .6 * w, .5 * h, 0, .5 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, .7 * w, 0));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, .7 * w, h, .4 * w, .5 * h, w, .5 * h).close());
      const fig2 = new go.PathFigure(.45 * w, .73 * h, false);
      geo.add(fig2);
      // Lines on script
      fig2.add(new go.PathSegment(go.PathSegment.Line, .7 * w, .73 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Move, .38 * w, .5 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, .63 * w, .5 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Move, .31 * w, .27 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, .56 * w, .27 * h));
      return geo;
    });
    go.Shape.defineFigureGenerator('BpmnTaskUser', function (shape, w, h) {
      const geo = new go.Geometry();
      const fig = new go.PathFigure(0, 0, false);
      geo.add(fig);
      const fig2 = new go.PathFigure(.335 * w, (1 - .555) * h, true);
      geo.add(fig2);
      // Shirt
      fig2.add(new go.PathSegment(go.PathSegment.Line, .335 * w, (1 - .405) * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, (1 - .335) * w, (1 - .405) * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, (1 - .335) * w, (1 - .555) * h));
      fig2.add(new go.PathSegment(go.PathSegment.Bezier, w, .68 * h, (1 - .12) * w, .46 * h, (1 - .02) * w, .54 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, w, h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, 0, h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, 0, .68 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Bezier, .335 * w, (1 - .555) * h, .02 * w, .54 * h, .12 * w, .46 * h));
      // Start of neck
      fig2.add(new go.PathSegment(go.PathSegment.Line, .365 * w, (1 - .595) * h));
      const radiushead = .5 - .285;
      const centerx = .5;
      const centery = radiushead;
      const alpha2 = Math.PI / 4;
      const KAPPA2 = ((4 * (1 - Math.cos(alpha2))) / (3 * Math.sin(alpha2)));
      const cpOffset = KAPPA2 * .5;
      const radiusw = radiushead;
      const radiush = radiushead;
      const offsetw = KAPPA2 * radiusw;
      const offseth = KAPPA2 * radiush;
      // Circle (head)
      fig2.add(new go.PathSegment(go.PathSegment.Bezier, (centerx - radiusw) * w, centery * h, (centerx - ((offsetw + radiusw) / 2)) * w, (centery + ((radiush + offseth) / 2)) * h, (centerx - radiusw) * w, (centery + offseth) * h));
      fig2.add(new go.PathSegment(go.PathSegment.Bezier, centerx * w, (centery - radiush) * h, (centerx - radiusw) * w, (centery - offseth) * h, (centerx - offsetw) * w, (centery - radiush) * h));
      fig2.add(new go.PathSegment(go.PathSegment.Bezier, (centerx + radiusw) * w, centery * h, (centerx + offsetw) * w, (centery - radiush) * h, (centerx + radiusw) * w, (centery - offseth) * h));
      fig2.add(new go.PathSegment(go.PathSegment.Bezier, (1 - .365) * w, (1 - .595) * h, (centerx + radiusw) * w, (centery + offseth) * h, (centerx + ((offsetw + radiusw) / 2)) * w, (centery + ((radiush + offseth) / 2)) * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, (1 - .365) * w, (1 - .595) * h));
      // Neckline
      fig2.add(new go.PathSegment(go.PathSegment.Line, (1 - .335) * w, (1 - .555) * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, (1 - .335) * w, (1 - .405) * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, .335 * w, (1 - .405) * h));
      const fig3 = new go.PathFigure(.2 * w, h, false);
      geo.add(fig3);
      // Arm lines
      fig3.add(new go.PathSegment(go.PathSegment.Line, .2 * w, .8 * h));
      const fig4 = new go.PathFigure(.8 * w, h, false);
      geo.add(fig4);
      fig4.add(new go.PathSegment(go.PathSegment.Line, .8 * w, .8 * h));
      return geo;
    });

    go.Shape.defineFigureGenerator('File', function (shape, w, h) {
      const geo = new go.Geometry();
      const fig = new go.PathFigure(0, 0, true); // starting point
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Line, .75 * w, 0));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
      fig.add(new go.PathSegment(go.PathSegment.Line, 0, h).close());
      const fig2 = new go.PathFigure(.75 * w, 0, false);
      geo.add(fig2);
      // The Fold
      fig2.add(new go.PathSegment(go.PathSegment.Line, .75 * w, .25 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
      geo.spot1 = new go.Spot(0, .25);
      geo.spot2 = go.Spot.BottomRight;
      return geo;
    });

    go.Shape.defineFigureGenerator('Database', function (shape, w, h) {
      const geo = new go.Geometry();
      const cpxOffset = self.KAPPA * .5;
      const cpyOffset = self.KAPPA * .1;
      const fig = new go.PathFigure(w, .1 * h, true);
      geo.add(fig);
      // Body
      fig.add(new go.PathSegment(go.PathSegment.Line, w, .9 * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, .5 * w, h, w, (.9 + cpyOffset) * h, (.5 + cpxOffset) * w, h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, 0, .9 * h, (.5 - cpxOffset) * w, h, 0, (.9 + cpyOffset) * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, 0, .1 * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, .5 * w, 0, 0, (.1 - cpyOffset) * h, (.5 - cpxOffset) * w, 0));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, w, .1 * h, (.5 + cpxOffset) * w, 0, w, (.1 - cpyOffset) * h));
      const fig2 = new go.PathFigure(w, .1 * h, false);
      geo.add(fig2);
      // Rings
      fig2.add(new go.PathSegment(go.PathSegment.Bezier, .5 * w, .2 * h, w, (.1 + cpyOffset) * h, (.5 + cpxOffset) * w, .2 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Bezier, 0, .1 * h, (.5 - cpxOffset) * w, .2 * h, 0, (.1 + cpyOffset) * h));
      fig2.add(new go.PathSegment(go.PathSegment.Move, w, .2 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Bezier, .5 * w, .3 * h, w, (.2 + cpyOffset) * h, (.5 + cpxOffset) * w, .3 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Bezier, 0, .2 * h, (.5 - cpxOffset) * w, .3 * h, 0, (.2 + cpyOffset) * h));
      fig2.add(new go.PathSegment(go.PathSegment.Move, w, .3 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Bezier, .5 * w, .4 * h, w, (.3 + cpyOffset) * h, (.5 + cpxOffset) * w, .4 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Bezier, 0, .3 * h, (.5 - cpxOffset) * w, .4 * h, 0, (.3 + cpyOffset) * h));
      geo.spot1 = new go.Spot(0, .4);
      geo.spot2 = new go.Spot(1, .9);
      return geo;
    });

    go.Shape.defineFigureGenerator('Process', function (shape, w, h) {
      const geo = new go.Geometry();
      let param1 = shape ? shape.parameter1 : NaN;
      if (isNaN(param1)) {
        param1 = .1;
      } // Distance of left  line from left edge
      const fig = new go.PathFigure(0, 0, true);
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Line, w, 0));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
      fig.add(new go.PathSegment(go.PathSegment.Line, 0, h).close());
      const fig2 = new go.PathFigure(param1 * w, 0, false);
      geo.add(fig2);
      fig2.add(new go.PathSegment(go.PathSegment.Line, param1 * w, h));
      // ??? geo.spot1 = new go.Spot(param1, 0);
      geo.spot2 = go.Spot.BottomRight;
      return geo;
    });

    go.Shape.defineFigureGenerator('Arrow', function (shape, w, h) {
      let param1 = shape ? shape.parameter1 : NaN; // % width of arrowhead
      if (isNaN(param1)) {
        param1 = .3;
      }
      let param2 = shape ? shape.parameter2 : NaN; // % height of tail
      if (isNaN(param2)) {
        param2 = .3;
      }
     const x = (1 - param1) * w;
     const y1 = (.5 - param2 / 2) * h;
     const y2 = (.5 + param2 / 2) * h;
     const geo = new go.Geometry();
     const fig = new go.PathFigure(0, y1, true);
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Line, x, y1));
      fig.add(new go.PathSegment(go.PathSegment.Line, x, 0));
      fig.add(new go.PathSegment(go.PathSegment.Line, x, 0));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, .5 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, x, h));
      fig.add(new go.PathSegment(go.PathSegment.Line, x, y2));
      fig.add(new go.PathSegment(go.PathSegment.Line, 0, y2).close());
      geo.spot1 = new go.Spot(0, y1 / h);
      const temp = self.getIntersection(0, y2 / h, 1, y2 / h, x / w, 1, 1, .5, self.tempPoint());
      geo.spot2 = new go.Spot(temp.x, temp.y);
      self.freePoint(temp);
      return geo;
    });

    go.Shape.defineFigureGenerator('MultiDocument', function (shape, w, h) {
      const geo = new go.Geometry();
      h = h / .8;
      const fig = new go.PathFigure(w, 0, true);
      geo.add(fig);
      // Outline
      fig.add(new go.PathSegment(go.PathSegment.Line, w, .5 * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, .9 * w, .44 * h, .96 * w, .47 * h, .93 * w, .45 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, .9 * w, .6 * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, .8 * w, .54 * h, .86 * w, .57 * h, .83 * w, .55 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, .8 * w, .7 * h));
      fig.add(new go.PathSegment(go.PathSegment.Bezier, 0, .7 * h, .4 * w, .4 * h, .4 * w, h));
      fig.add(new go.PathSegment(go.PathSegment.Line, 0, .2 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, .1 * w, .2 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, .1 * w, .1 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, .2 * w, .1 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, .2 * w, 0).close());
      const fig2 = new go.PathFigure(.1 * w, .2 * h, false);
      geo.add(fig2);
      // Inside lines
      fig2.add(new go.PathSegment(go.PathSegment.Line, .8 * w, .2 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, .8 * w, .54 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Move, .2 * w, .1 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, .9 * w, .1 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, .9 * w, .44 * h));
      geo.spot1 = new go.Spot(0, .25);
      geo.spot2 = new go.Spot(.8, .77);
      return geo;
    });

    go.Shape.defineFigureGenerator('Border', 'RoundedRectangle');  // predefined in 2.0
    go.Shape.defineFigureGenerator('Ellipse', (shape, w, h) => {  // predefined in 2.0
     const geo = new go.Geometry(go.Geometry.Ellipse);
     geo.startX = 0;
     geo.startY = 0;
     geo.endX = w;
     geo.endY = h;
     geo.spot1 = self.GeneratorEllipseSpot1;
     geo.spot2 = self.GeneratorEllipseSpot2;
     return geo;
    });
    go.Shape.defineFigureGenerator('Circle', (shape, w, h) => {  // predefined in 2.0
     const geo = new go.Geometry(go.Geometry.Ellipse);
     geo.startX = 0;
     geo.startY = 0;
     geo.endX = w;
     geo.endY = h;
     geo.spot1 = self.GeneratorEllipseSpot1;
     geo.spot2 = self.GeneratorEllipseSpot2;
     geo.defaultStretch = go.GraphObject.Uniform;
     return geo;
    });

    go.Shape.defineFigureGenerator('Empty', function (shape, w, h) {
      return new go.Geometry();
    });

    go.Shape.defineFigureGenerator('Annotation', function (shape, w, h) {
      const len = Math.min(w, 10);
      return new go.Geometry()
        .add(new go.PathFigure(len, 0)
          .add(new go.PathSegment(go.PathSegment.Line, 0, 0))
          .add(new go.PathSegment(go.PathSegment.Line, 0, h))
          .add(new go.PathSegment(go.PathSegment.Line, len, h)));
    });

    const gearStr = 'F M 391,5L 419,14L 444.5,30.5L 451,120.5L 485.5,126L 522,141L 595,83L 618.5,92L 644,106.5' +
      'L 660.5,132L 670,158L 616,220L 640.5,265.5L 658.122,317.809L 753.122,322.809L 770.122,348.309L 774.622,374.309' +
      'L 769.5,402L 756.622,420.309L 659.122,428.809L 640.5,475L 616.5,519.5L 670,573.5L 663,600L 646,626.5' +
      'L 622,639L 595,645.5L 531.5,597.5L 493.192,613.462L 450,627.5L 444.5,718.5L 421.5,733L 393,740.5L 361.5,733.5' +
      'L 336.5,719L 330,627.5L 277.5,611.5L 227.5,584.167L 156.5,646L 124.5,641L 102,626.5L 82,602.5L 78.5,572.5' +
      'L 148.167,500.833L 133.5,466.833L 122,432.5L 26.5,421L 11,400.5L 5,373.5L 12,347.5L 26.5,324L 123.5,317.5' +
      'L 136.833,274.167L 154,241L 75.5,152.5L 85.5,128.5L 103,105.5L 128.5,88.5001L 154.872,82.4758L 237,155' +
      'L 280.5,132L 330,121L 336,30L 361,15L 391,5 Z M 398.201,232L 510.201,275L 556.201,385L 505.201,491L 399.201,537' +
      'L 284.201,489L 242.201,385L 282.201,273L 398.201,232 Z';
    const gearGeo = go.Geometry.parse(gearStr);
    gearGeo.normalize();

    go.Shape.defineFigureGenerator('BpmnTaskService', function (shape, w, h) {
      const geo = gearGeo.copy();
      // calculate how much to scale the Geometry so that it fits in w x h
      const bounds = geo.bounds;
      const scale = Math.min(w / bounds.width, h / bounds.height);
      geo.scale(scale, scale);
      // text should go in the hand
      geo.spot1 = new go.Spot(0, 0.6, 10, 0);
      geo.spot2 = new go.Spot(1, 1);
      return geo;
    });
  }
}

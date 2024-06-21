import {ModelElementAttributes} from './ModelElementAttributes.model';

export class ModelElementDetail {
  id: string
  label: string
  note: string
  x: number
  y: number
  width: number
  height: number
  modelingLanguageConstructInstance: string
  shapeRepresentsModel: string
  paletteConstruct: string
  modellingLanguageConstruct: string
  abstractElementAttributes: ModelElementAttributes
  fromArrow: string
  toArrow: string
  arrowStroke: string
  imageUrl: string
  fromShape: string
  toShape: string
  containedShapes: string[]
  modelElementType: string
  otherVisualisationsOfSameLanguageConstruct: string[]
}

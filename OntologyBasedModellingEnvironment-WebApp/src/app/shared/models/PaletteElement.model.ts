import {QueryAnswerModel} from "./QueryAnswer.model";
import * as go from 'gojs';

export class PaletteElementModel {
  id: string;
  uuid: string;
  label: string;
  paletteCategory: string;
  categoryLabel: string;
  parentElement: string;
  parentLanguageClass: string;
  hiddenFromPalette: boolean;
  childElements: PaletteElementModel[];
  representedLanguageClass: string;
  representedDomainClass: string[];
  languageSubclasses: QueryAnswerModel[];
  languagePrefix: string;
  comment: string;
  /*datatypePropertyId: string;
  datatypePropertyLabel: string;
  datatypePropertyValue: string;*/
  shape: string;
  backgroundColor: string;
  height: number;
  width: number;
  labelPosition: string;
  iconURL: string;
  iconPosition: string;
  usesImages: boolean;
  imageURL: string;
  thumbnailURL: string;

  toArrow: string;
  fromArrow: string;
  arrowStroke: string;

  type: string;

  tempLabel;
  tempUuid;
  routing: go.EnumValue;

  static getProbableElementType(element: PaletteElementModel): string {
    if (element.id.includes('Lane') || element.id.includes('Pool')) {
      return 'ModelingContainer';
    }
    if (element.id.includes('Association') || element.id.includes('MessageFlow') || element.id.includes('SequenceFlow')) {
      return 'ModelingRelation';
    }
    return 'ModelingElement';
  }

  static getProbableModellingConstruct(element: PaletteElementModel): string {
    const segments = element.representedLanguageClass.split('#');
    return segments[segments.length - 1];
  }
}

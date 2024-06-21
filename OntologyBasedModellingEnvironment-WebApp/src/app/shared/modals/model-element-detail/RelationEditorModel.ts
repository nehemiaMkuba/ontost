import {Relation} from '../../models/Relation.model';
import {ValueModel} from './ValueModel';

export class RelationEditorModel {
  relation: Relation
  selectorOptions: ValueModel[]
  selectedValue: ValueModel
  isPrimitive: boolean
  primitiveTypeRange: string

  constructor(relation: Relation) {
    this.relation = relation;
    this.selectorOptions = undefined;
    this.isPrimitive = false;
    this.primitiveTypeRange = '';
  }
}

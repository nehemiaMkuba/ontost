import {Relation} from './Relation.model';
import {RelationOption} from './RelationOption.model';

export class ModelElementAttributes {
  options: RelationOption[];
  values: Relation[];
  instantiationType: string;
}

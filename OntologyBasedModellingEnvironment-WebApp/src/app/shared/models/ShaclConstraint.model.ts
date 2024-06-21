export class ShaclConstraintModel {
  id: string;
  name: string;
  description: string;
  path: string;
  datatype: string;
  pattern: string;
  minCount: number;
  maxCount: number;

  targetClass: string;

  range: string;
  defaultValue: string;
}

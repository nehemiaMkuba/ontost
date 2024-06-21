export class ValueModel {
  id: string // for the api
  value: string // for the human

  constructor(id: string, value: string) {
    this.id = id;
    this.value = value;
  }
}

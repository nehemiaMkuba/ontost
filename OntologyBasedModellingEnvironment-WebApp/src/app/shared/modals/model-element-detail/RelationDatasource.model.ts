import {DataSource} from '@angular/cdk/collections';
import {RelationEditorModel} from './RelationEditorModel';
import {BehaviorSubject, Observable} from "rxjs";

export class RelationDatasource extends DataSource<RelationEditorModel> {

  data: BehaviorSubject<RelationEditorModel[]>;

  public constructor(private entries: RelationEditorModel[]) {
    super();
    this.data = new BehaviorSubject<RelationEditorModel[]>(entries);
  }

  /** Stream of data that is provided to the table. */


  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<RelationEditorModel[]> {
    return this.data;
  }

  disconnect() {}
}

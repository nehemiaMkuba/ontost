import {Injectable} from '@angular/core';
import {EndpointSettings} from '../../../_settings/endpoint.settings';
//import {ModalModelMultipleExport} from './modal-model-multiple-export';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {of} from 'rxjs';
// import 'rxjs/operator/delay';
// import 'rxjs/operator/mergeMap';
// import 'rxjs/operator/switchMap';

import {PaletteCategoryModel} from '../../../shared/models/PaletteCategory.model';
import {PaletteElementModel} from '../../../shared/models/PaletteElement.model';
import {QueryAnswerModel} from '../../../shared/models/QueryAnswer.model';
import {DatatypePropertyModel} from '../../../shared/models/DatatypeProperty.model';
import {DomainElementModel} from '../../../shared/models/DomainElement.model';
import {ModelingLanguageModel} from '../../../shared/models/ModelingLanguage.model';
import {ObjectPropertyModel} from '../../../shared/models/ObjectProperty.model';
import {Model} from '../../../shared/models/Model.model';
import {ModelElementDetail} from '../../../shared/models/ModelElementDetail.model';
import {ArrowStructures} from '../../../shared/models/ArrowStructures.model';
import {InstantiationTargetType} from '../../../shared/models/InstantiationTargetType.model';
import {RelationOptions} from '../../../shared/models/RelationOptions.model';
import ModellingLanguageConstructInstance from '../../../shared/models/ModellingLanguageConstructInstance.model';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ModelingViewModel} from '../../../shared/models/ModelingView.model';
//import { saveAs } from  'file-saver';
import * as fileSaver from 'file-saver';
import {saveAs} from 'file-saver';
import {ModalModelMultipleExport} from '../../../shared/modals/modal-model-multiple-export/modal-model-multiple-export.component';
import {promise} from 'protractor';
import * as go from 'gojs';
import {ShaclConstraintModel} from '../../../shared/models/ShaclConstraint.model';


@Injectable()
export class ModellerService {
  public modelingLanguage$: Observable<ModelingLanguageModel[]> = of([]);
  public paletteCategorie$: Observable<PaletteCategoryModel[]> = of([]);
  public paletteCategories: PaletteCategoryModel[] = [];
  public paletteElement$: Observable<PaletteElementModel[]> = of([]);
  public paletteElements: PaletteElementModel[] = [];
  public domainClasse$: Observable<DomainElementModel[]> = of([]);
  public domainClasses: DomainElementModel[] = [];
  public modelingLanguageClasse$: Observable<QueryAnswerModel[]> = of([]);
  public modelingLanguageClasses: QueryAnswerModel[] = [];
  public allProperties$: Observable<ObjectPropertyModel[]> = of([]);
  public allProperties: ObjectPropertyModel[] = [];
  public datatypeProperties$: Observable<DatatypePropertyModel[]> = of([]);
  public namespacePrefixe$: Observable<string[]> = of([]);
  public namespacePrefixes: string[] = [];
  public modelAndLanguage$: Observable<string> = of();
  public modelAndLanguage: string;
  public modelAndLanguageAdvanced$: Observable<string> = of();
  public modelAndLanguageAdvanced: string;

  public prefixAdvanced$: Observable<string> = of();
  public prefixAdvanced: string;

  public prefixAdvancedGithub: string[];


  public modalModelMultipleExport: ModalModelMultipleExport;


  // public namespaceMap$: Observable<Map<string, string>> = of({});

  public selectedModelingLanguage;
  private models: Model[];

  constructor(private httpClient: HttpClient, private endpointSettings: EndpointSettings) {
    this.models = [];
  }

  queryModelingLanguages() {
    return this.httpClient.get<ModelingLanguageModel[]>(this.endpointSettings.getModelingLanguagesEndpoint()); /*.subscribe(
      data => {
        //console.log('PaletteElements received: ' + JSON.stringify(data));
        //this.modelingLanguage$ = of(data);
        //console.log(this.modelingLanguage$);
      }, error => console.log('Could not query PaletteElements'));*/
  }

  queryModelingViews(langId) {
    this.selectedModelingLanguage = langId;

    return this.httpClient.get<ModelingViewModel[]>(this.endpointSettings.getModelingViewsEndpoint(langId));
  }

  queryPaletteElements(): Observable<PaletteElementModel[]> {
    return this.httpClient.get<PaletteElementModel[]>(this.endpointSettings.getPaletteElementsEndpoint()).pipe(tap(paletteElements => {
      const data = paletteElements.filter(e => e.type === 'PaletteConnector').map(p => {
        p.routing = go.Link.Orthogonal;
        return p;
      });
      // console.log('PaletteElements received: ' + JSON.stringify(data));
      this.paletteElement$ = of(paletteElements);
      this.paletteElements = paletteElements;
      console.log(this.paletteElements);
    }));
  }

  queryPaletteCategories(viewId) {
    return this.httpClient.get<PaletteCategoryModel[]>(this.endpointSettings.getPaletteCategoriesEndpoint(viewId)); /*.subscribe(
      data => {
        //console.log('PaletteCategories received: ' + JSON.stringify(data));
        this.paletteCategorie$ = Observable.of(data);
        this.paletteCategories = data;
      }, error => console.log('Could not query PaletteElements'));*/
  }

  createElementInOntology(oImg) {
    // console.log(JSON.stringify(oImg));
    const querySuccess: Boolean = false;
    let returnStr: string;
    console.log(oImg);
    return this.httpClient.post(this.endpointSettings.getCreateElementEndpoint(), oImg);
  }

  deletePaletteElement(oImg) {
    // console.log(JSON.stringify(oImg));
    const querySuccess: Boolean = false;
    console.log(oImg);
    return this.httpClient.post(this.endpointSettings.getDeletePaletteElementEndpoint(), oImg); // Do not subscribe here, subscribe where the method is called to make the call synchronous
    /*.subscribe(
      data => {
        querySuccess = (data == 'true');
      }
    );
    return querySuccess;*/
  }

  hidePaletteElement(oImg) {
    // console.log(JSON.stringify(oImg));
    const querySuccess: Boolean = false;
    console.log(oImg);
    return this.httpClient.post(this.endpointSettings.getHidePaletteElementEndpoint(), oImg); /*.subscribe(
      data => {
        querySuccess = (data == 'true');
      }
    );
    return querySuccess;*/
  }

  createDomainElementInOntology(oImg): Boolean {
    // console.log(JSON.stringify(oImg));
    let querySuccess: Boolean = false;
    console.log(oImg);
    this.httpClient.post(this.endpointSettings.getCreateDomainElementEndpoint(), oImg)
      .subscribe(
        data => {
          querySuccess = (data == 'true');
        }
      );
    return querySuccess;
  }

  createNewDatatypeProperty(oImg) {
    // console.log(JSON.stringify(oImg));
    const querySuccess: Boolean = false;
    console.log(oImg);
    return this.httpClient.post(this.endpointSettings.getCreateDatatypePropertyEndpoint(), oImg);
  }

  createNewBridgingConnector(oImg) {
    const querySuccess: Boolean = false;
    console.log(oImg);
    return this.httpClient.post(this.endpointSettings.getCreateBridgeConnectorEndpoint(), oImg);
  }

  createNewSemanticMapping(oImg) {
    const querySuccess: Boolean = false;
    console.log(oImg);
    return this.httpClient.post(this.endpointSettings.getCreateSemanticMappingEndpoint(), oImg);
  }

  createNewShaclConstraint(oImg) {
    const querySuccess: Boolean = false;
    console.log(oImg);
    return this.httpClient.post(this.endpointSettings.getCreateShaclConstraintEndpoint(), oImg);
  }

  validateShacl(modelId: string) {
    const querySuccess: Boolean = false;
    console.log();
    return this.httpClient.get<any[]>(this.endpointSettings.getValidateShaclEndpoint(modelId));
  }

  editElement(element: PaletteElementModel, modifiedElement: PaletteElementModel) {
    const querySuccess: Boolean = false;
    const params = new URLSearchParams();
    params.append('element', JSON.stringify(element));
    params.append('modifiedElement', JSON.stringify(modifiedElement)); // passing multiple parameters in POST

    //url encoding headers added
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

    return this.httpClient.post(this.endpointSettings.getModifyElementEndpoint(), params.toString(), {headers: headers})

    }

  editDatatypeProperty(property: DatatypePropertyModel, editedProperty: DatatypePropertyModel) {
    const querySuccess: Boolean = false;
    console.log(property);
    const params = new URLSearchParams();
    params.append('property', JSON.stringify(property));
    params.append('editedProperty', JSON.stringify(editedProperty)); // passing multiple parameters in POST


    //url encoding headers added
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

    return this.httpClient.post(this.endpointSettings.getModifyElementEndpoint(), params.toString(), {headers: headers})
  }

  editObjectProperty(property: ObjectPropertyModel, editedProperty: ObjectPropertyModel) {
    const querySuccess: Boolean = false;
    console.log(property);
    const params = new URLSearchParams();
    params.append('property', JSON.stringify(property));
    params.append('editedProperty', JSON.stringify(editedProperty)); // passing multiple parameters in POST


    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
    return this.httpClient.post(this.endpointSettings.getModifyElementEndpoint(), params.toString(), {headers: headers})
  }

  deleteDatatypeProperty(property: DatatypePropertyModel) {
    const querySuccess: Boolean = false;
    console.log(property);
    return this.httpClient.post(this.endpointSettings.getDeleteDatatypePropertyEndpoint(), JSON.stringify(property));
  }

  deleteObjectProperty(property: ObjectPropertyModel) {
    const querySuccess: Boolean = false;
    console.log(property);
    return this.httpClient.post(this.endpointSettings.getDeleteObjectPropertyEndpoint(), JSON.stringify(property));
  }

  createLanguageSubclasses(oImg) {
    // console.log(JSON.stringify(oImg));
    const querySuccess: Boolean = false;
    console.log(oImg);
    return this.httpClient.post(this.endpointSettings.getCreateLanguageSubclassesEndpoint(), oImg);
  }

  queryDomainClasses(): void {


    this.httpClient.get<DomainElementModel[]>(this.endpointSettings.getDomainClassesEndpoint())
      .subscribe(data => {
        // console.log('PaletteElements received: ' + JSON.stringify(data));
        this.domainClasse$ = of(data);
        this.domainClasses = data;
      }, error => console.log('Could not query Domain Classes'));

  }

  queryModelingElementClasses(): void {
    this.httpClient.get<QueryAnswerModel[]>(this.endpointSettings.getModelingElementClassesEndpoint())
      .subscribe(data => {
        // console.log('PaletteElements received: ' + JSON.stringify(data));
        this.modelingLanguageClasse$ = of(data);
        this.modelingLanguageClasses = data;
      }, error => console.log('Could not query Modeling Language Classes'));
  }

  queryAllProperties(domainName): void {
    this.httpClient.get<ObjectPropertyModel[]>(this.endpointSettings.getAllPropertiesEndpoint(domainName))
      .subscribe(data => {
          // console.log('PaletteElements received: ' + JSON.stringify(data));
          this.allProperties$ = of(data);
          this.allProperties = data;
          console.log("Properties were pulled "+this.allProperties);
        },
        error => console.log('Could not query All Properties'));
  }

  queryDatatypeProperties(domainName) {
    return this.httpClient.get<DatatypePropertyModel[]>(this.endpointSettings.getDatatypePropertyEndpoint(domainName));
  }

  queryBridgingConnectors(domainName) {
    return this.httpClient.get<ObjectPropertyModel[]>(this.endpointSettings.getBridgeConnectorEndpoint(domainName));
  }

  querySemanticMappings(domainName) {
    return this.httpClient.get<ObjectPropertyModel[]>(this.endpointSettings.getSemanticMappingEndpoint(domainName));
  }

  queryShaclConstraints(domainName) {
    console.log("Querying shacl constraints. DomainName: " + domainName+ " Endpoint: " + this.endpointSettings.getShaclConstraintEndpoint(domainName));
    return this.httpClient.get<ShaclConstraintModel[]>(this.endpointSettings.getShaclConstraintEndpoint(domainName));
  }

  queryNamespacePrefixes(): void {
    this.httpClient.get<string[]>(this.endpointSettings.getGetAllNamespacePrefixesEndpoint())
      .subscribe(
        data => {
          // console.log('PaletteCategories received: ' + JSON.stringify(data));
          this.namespacePrefixe$ = of(data);
          this.namespacePrefixes = data;
        }, error => console.log('Could not query Namespace prefixes'));
  }

  queryNamespaceMap(): Observable<Map<string, string>> {
    return this.httpClient.get<Map<string, string>>(this.endpointSettings.getNamespaceMapEndpoint());
  }

  /*queryDomainConcepts() {
    return this.http.get(this.endpointSettings.getDomainConceptsEndpoint())
      .map(response => response.json());
  }*/

  getArrowStructures(): Promise<ArrowStructures> {
    return this.httpClient.get<ArrowStructures>(this.endpointSettings.getArrowsEndpoint())
      .toPromise();
  }

  getModels(): Observable<Model[]> {
    return this.httpClient.get<Model[]>(this.endpointSettings.getModelsEndpoint());
  }

  createModel(label: string): Observable<Model> {
    const dto: Model = new Model();
    dto.label = label;

    return this.httpClient.post<Model>(this.endpointSettings.getModelsEndpoint(), dto).pipe(
      tap(model => {
        this.models.push(model);
      })
    );
  }

  createElement(modelId: string, shapeId: string, label: string, x: number, y: number, paletteConstruct: string, instantiationTargetType: InstantiationTargetType): Promise<ModelElementDetail> {
    const payload: Object = {
      x: Math.trunc(x),
      y: Math.trunc(y),
      paletteConstruct,
      uuid: shapeId,
      label,
      instantiationType: instantiationTargetType
    };

    return this.httpClient.put<ModelElementDetail>(this.endpointSettings.getElementEndpoint(modelId), payload)
      .toPromise();
  }

  copyElement(existingElement: ModelElementDetail, modelId: string): Promise<ModelElementDetail> {
    const payload: Object = {
      paletteConstruct: existingElement.paletteConstruct,
      x: existingElement.x,
      y: existingElement.y,
      w: existingElement.width,
      h: existingElement.height,
      uuid: existingElement.id,
      label: existingElement.label,
      modelingLanguageConstructInstance: existingElement.modelingLanguageConstructInstance,
      note: existingElement.note,
      shapeRepresentsModel: existingElement.shapeRepresentsModel
    };

    return this.httpClient.put<ModelElementDetail>(this.endpointSettings.getElementEndpoint(modelId), payload)
      .toPromise();
  }

  createConnection(modelId: string, shapeId: string, x: number, y: number, from: string, to: string, paletteConstruct: string, instantiationTargetType: InstantiationTargetType): Promise<ModelElementDetail> {
    const payload: Object = {
      x: Math.trunc(x),
      y: Math.trunc(y),
      paletteConstruct,
      uuid: shapeId,
      from,
      to,
      instantiationType: instantiationTargetType
    };

    return this.httpClient.put<ModelElementDetail>(this.endpointSettings.getConnectionEndpoint(modelId), payload)
      .toPromise();
  }

  getElements(modelId: string): Observable<ModelElementDetail[]> {
    // getElementEndpoint starts the process of retrieving the elements
    // getElementStatusEndpoint is used to poll the status of the retrieval every n seconds
    // This is necessary to avoid Heroku server timeout after 30 seconds when this process takes longer
     return  new Observable<ModelElementDetail[]>(observer => {
      this.httpClient.get<string>(this.endpointSettings.getElementEndpoint(modelId)).subscribe(taskId => {
        const interval = setInterval(() => {
          this.httpClient.get<ModelElementDetail[]>(this.endpointSettings.getElementStatusEndpoint(modelId), {observe: 'response'})
            .subscribe(
              response => {
                if (response.status === 200) { // Success status received from server
                  console.log(response.body)
                  observer.next(response.body);
                  observer.complete();
                  clearInterval(interval);
                } else if (response.status >= 400) { // Error status received from server
                  observer.error('Error status received: ' + response.status);
                  observer.complete();
                  clearInterval(interval);
                } else {
                  console.log(response.body); // current status
                }
              },
              error => { // Error occurred during polling
                console.error('Error occurred during polling: ' + error.toString());
                observer.error(error);
                observer.complete();
                clearInterval(interval);
              }
            );
        }, 5000); // Poll every n seconds to check status
      });
    });
  }

  updateElement(elementDetail: ModelElementDetail, modelId: string) {
    this.httpClient.put(this.endpointSettings.getElementDetailEndpoint(modelId, elementDetail.id), elementDetail)
      .toPromise()
      .then(response => console.log(response));
  }

  deleteElement(modelId: string, shapeId: string) {
    this.httpClient.delete(this.endpointSettings.getElementDetailEndpoint(modelId, shapeId))
      .toPromise()
      .then(response => console.log(response));
  }

  deleteModel(modelId: string): Observable<Object> {
    return this.httpClient.delete(this.endpointSettings.getModelEndpoint(modelId));
  }

  updateModel(model: Model) {
    this.httpClient.put(this.endpointSettings.getModelEndpoint(model.id), {
      id: model.id,
      label: model.label
    }).toPromise()
      .then(response => console.log(response));
  }

  getOptionsForRelation(relationId: string): Promise<RelationOptions> {
    return this.httpClient.get<RelationOptions>(this.endpointSettings.getRelationOptionsEndpoint(relationId))
      .toPromise();
  }

  getInstancesOfConceptualElements(id: string): Promise<ModellingLanguageConstructInstance[]> {
    return this.httpClient.post<ModellingLanguageConstructInstance[]>(this.endpointSettings.getConceptualElementInstances(), {
      id
    })
      .toPromise();
  }

  uploadNewImageToBackend(image: File, fileName: string, prefix: string) {

    const formData = new FormData();

    formData.append('prefix', prefix);
    formData.append('fileName', fileName);
    //Make sure that the other fields are populated first.
    formData.append('image', image);

    this.httpClient.post('/upload', formData).toPromise().then(response => console.log(response));
  }

  async getUploadedImages(): Promise<Object> {

    return await this.httpClient.get('/images').toPromise();
  }

//Full export : get all data from fuseki and download
  queryModelsAndLanguage(): void {
    this.httpClient.get<string>(this.endpointSettings.getModelAndLanguageFromFuseki()).subscribe(
      data => {
        this.modelAndLanguage$ = of(data);
        this.modelAndLanguage = data;
        console.log(this.modelAndLanguage);
        //var FileSaver = require('file-saver');
        const filename = 'Export.ttl';
        var myblob = new Blob([this.modelAndLanguage], {
          type: 'text/trig'
        });
        saveAs(myblob, filename);
        // FileSaver.saveAs(myblob, "hello world.txt");

      }, error => console.log('Could not query models and language from endpoint fuseki')
    );
  }

//Not used: Old function to retrieve only one data from one prefix
  queryModelsAndLanguageADVANCEDwithDistinction(sPrefix: string) {
    this.httpClient.post<string>(this.endpointSettings.getModelAndLanguageFromFusekiAdvancedwithDistinction(), sPrefix).subscribe(
      data => {
        this.modelAndLanguageAdvanced$ = of(data);
        this.modelAndLanguageAdvanced = data;
        console.log(this.modelAndLanguageAdvanced);
        //var FileSaver = require('file-saver');
        //const filename = "cmmnadvancedwithDistinction.ttl";
        const filename = 'AOAME_' + sPrefix + '.ttl';
        var myblob = new Blob([this.modelAndLanguageAdvanced], {
          type: 'text/trig'
        });
        saveAs(myblob, filename);
        // FileSaver.saveAs(myblob, "hello world.txt");

      }, error => console.log(error)
    );

  }

  //Get data from fuseki based on the prefix provided in the dropdownlist and then download as a .ttl
  queryModelsAndLanguageADVANCEDwithDistinctionMultipleSelection(sPrefix: string []) {
    this.httpClient.post<string>(this.endpointSettings.getModelAndLanguageFromFusekiAdvancedwithDistinction2(), sPrefix).subscribe(
      data => {
        this.modelAndLanguageAdvanced$ = of(data);
        this.modelAndLanguageAdvanced = data;
        console.log(this.modelAndLanguageAdvanced);

        const filename = 'AOAME_.ttl';
        var myblob = new Blob([this.modelAndLanguageAdvanced], {
          type: 'text/trig'
        });
        saveAs(myblob, filename);
        // FileSaver.saveAs(myblob, "hello world.txt");

      }, error => console.log(error)
    );

  }

  queryUploadLanguagesSelectedOnFuseki(sPrefix: string []): Observable<any> {
    return this.httpClient.post(this.endpointSettings.postLanguagesToFuseki(), sPrefix);
  }



  //Get prefixes from fuseki
  async queryLanguagesFromFuseki(): Promise<void> {
    this.httpClient.get<string>(this.endpointSettings.getPrefixFromFuseki()).subscribe(
      data => {
        this.prefixAdvanced$ = of(data);
        this.prefixAdvanced = data;
      }, error => console.log(error)
    );
  }

  queryLanguagesFromGithub(): Observable<string[]> {
    return this.httpClient.get<string[]>(this.endpointSettings.getPrefixFromGithub()).pipe(tap(
      data => {
        this.prefixAdvancedGithub = data;
      },
    ));
  }

  uploadFromDesktop(sTtlFromDesktop: string){

      this.httpClient.post(this.endpointSettings.uploadTtlFromDesktop(), sTtlFromDesktop).subscribe(data=>{},error => console.log(error));
  }





}

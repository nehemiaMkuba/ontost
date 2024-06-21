import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

export interface Config {
  webserviceEndpoint: string
}

@Injectable()
export class EndpointSettings {

  private static GETMODELINGLANGUAGES       : string = '/ModEnv/getModelingLanguages';
  private static GETMODELINGVIEWS           : string = '/ModEnv/getModelingViews';
  private static PALETTEELEMENTS            : string = '/ModEnv/getPaletteElements';
  private static PALETTECATEGORIES          : string = '/ModEnv/getPaletteCategories';
  private static CREATEELEMENT              : string = '/ModEnv/createPalletteElement';
  private static CREATEINSTANCE             : string = '/ModEnv/createCanvasInstance';
  private static CREATEDOMAINELEMENT        : string = '/ModEnv/createDomainElement';
  private static GETDOMAINCLASSES           : string = '/ModEnv/getDomainOntologyClasses';
  private static GETMODELINGLANGUAGELASSES  : string = '/ModEnv/getModelingLanguageOntologyElements';
  private static CREATEDATATYPEPROPERTY     : string = '/ModEnv/createDatatypeProperty';
  private static CREATEBRIDGECONNECTOR       : string = '/ModEnv/createBridgingConnector';
  private static CREATESEMANTICMAPPING       : string = '/ModEnv/createSemanticMapping';
  private static CREATESHACLCONSTRAINT       : string = '/ModEnv/createShaclConstraint';
  private static GETDATATYPEPROPERTIES      : string = '/ModEnv/getDatatypeProperties';
  private static GETBRIDGECONNECTORS      : string = '/ModEnv/getBridgeConnectors';
  private static GETSEMANTICMAPPINGS      : string = '/ModEnv/getSemanticMappings';
  private static GETALLPROPERTIES      : string = '/ModEnv/getAllProperties';
  private static GETSHACLCONSTRAINTS      : string = '/ModEnv/getShaclConstraints';
  private static VALIDATESHACL            : string = '/ModEnv/validateShacl';
  private static DELETEPALETTEELEMENT       : string = '/ModEnv/deletePaletteElement';
  private static HIDEPALETTEELEMENT         : string = '/ModEnv/hidePaletteElement';
  private static CREATELANGUAGESUBCLASSES   : string = '/ModEnv/createModelingLanguageSubclasses';
  private static GETALLNAMESPACEPREFIXES    : string = '/ModEnv/getAllNamespacePrefixes';
  private static GETNAMESPACEMAP            : string = '/ModEnv/getNamespaceMap';
  private static MODIFYELEMENT              : string = '/ModEnv/modifyElement';
  private static EDITDATATYPEPROPERTY       : string = '/ModEnv/editDatatypeProperty';
  private static EDITOBJECTPROPERTY       : string = '/ModEnv/editObjectProperty';
  private static DELETEDATATYPEPROPERTY     : string = '/ModEnv/deleteDatatypeProperty';
  private static DELETEOBJECTPROPERTY     : string = '/ModEnv/deleteObjectProperty';

  private static GETDOMAINCONCEPTS          : string = '/ModEnv/getDomainConcepts';

  private static MODELS : string = '/ModEnv/model';
  private static ARROWS : string = '/ModEnv/arrow-structures';

  // The URL of the webservice. This gets read on the server side from the environment variable WEBSERVICE_ENDPOINT.
  // http://localhost:8080 is use if this environment variable does not exist.
  private webserviceEndpoint: string = undefined;

  constructor(private http: HttpClient) {
  }

  public load(): Promise<any>{

    //Use localhost as a default endpoint.
    const defaultEndpoint = 'http://localhost:8080';

    // Make a request to the server to retrieve an URL that points to the webservice.
    return this.http.get<Config>('/api').toPromise().then((data:Config) =>{
      if(data.webserviceEndpoint){
        console.log('Received webservice endpoint: ' + data.webserviceEndpoint);
        this.webserviceEndpoint = data.webserviceEndpoint;
      }else{
        console.log('Using default endpoint of ' + defaultEndpoint);
        this.webserviceEndpoint = defaultEndpoint;
      }
      }).catch(error =>{
        console.log('Using default endpoint of ' + defaultEndpoint);
        this.webserviceEndpoint = defaultEndpoint;
    });

  }

  public getModelsEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.MODELS;
  }

  public getModelEndpoint(modelId: string): string {
    return this.webserviceEndpoint + EndpointSettings.MODELS + '/' + modelId;
  }

  public getElementEndpoint(modelId: string): string {
    return this.webserviceEndpoint + EndpointSettings.MODELS + '/' + modelId + '/element';
  }
  public getElementStatusEndpoint(modelId: string): string {
    return this.webserviceEndpoint + EndpointSettings.MODELS + '/' + modelId + '/element/status';
  }

  public getConnectionEndpoint(modelId: string): string {
    return this.webserviceEndpoint + EndpointSettings.MODELS + '/' + modelId + '/connection';
  }

  public getElementDetailEndpoint(modelId: string, id: string): string {
    return this.webserviceEndpoint + EndpointSettings.MODELS + '/' + modelId + '/element/' + id;
  }

  public getArrowsEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.ARROWS;
  }

  public getModelingLanguagesEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.GETMODELINGLANGUAGES;
  }

  public getModelingViewsEndpoint(langId): string {
    return this.webserviceEndpoint + EndpointSettings.GETMODELINGVIEWS + '/' + langId;
  }

  public getPaletteElementsEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.PALETTEELEMENTS;
  }

  public getPaletteCategoriesEndpoint(viewId): string {
    return this.webserviceEndpoint + EndpointSettings.PALETTECATEGORIES + '/' + viewId;
  }

  public getCreateElementEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.CREATEELEMENT;
  }

  public getCreateInstanceEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.CREATEINSTANCE;
  }

  public getCreateDomainElementEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.CREATEDOMAINELEMENT;
  }

  public getDomainClassesEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.GETDOMAINCLASSES;
  }

  public getModelingElementClassesEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.GETMODELINGLANGUAGELASSES;
  }

  public getCreateDatatypePropertyEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.CREATEDATATYPEPROPERTY;
  }

  public getCreateBridgeConnectorEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.CREATEBRIDGECONNECTOR;
  }

  public getCreateSemanticMappingEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.CREATESEMANTICMAPPING;
  }

  public getCreateShaclConstraintEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.CREATESHACLCONSTRAINT;
  }

  public getValidateShaclEndpoint(modelId): string {
    return this.webserviceEndpoint + EndpointSettings.VALIDATESHACL+ '/' + modelId;
  }

  public getDatatypePropertyEndpoint(domainName): string {
    return this.webserviceEndpoint + EndpointSettings.GETDATATYPEPROPERTIES + '/' + domainName;
  }

  public getBridgeConnectorEndpoint(domainName): string {
    return this.webserviceEndpoint + EndpointSettings.GETBRIDGECONNECTORS + '/' + domainName;
  }

  public getSemanticMappingEndpoint(domainName): string {
    return this.webserviceEndpoint + EndpointSettings.GETSEMANTICMAPPINGS + '/' + domainName;
  }

  getAllPropertiesEndpoint(domainName) {
    return this.webserviceEndpoint + EndpointSettings.GETALLPROPERTIES + '/' + domainName;
  }
  public getShaclConstraintEndpoint(domainName): string {
    return this.webserviceEndpoint + EndpointSettings.GETSHACLCONSTRAINTS + '/' + domainName;
  }

  public getDeletePaletteElementEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.DELETEPALETTEELEMENT;
  }

  public getHidePaletteElementEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.HIDEPALETTEELEMENT;
  }

    public getCreateLanguageSubclassesEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.CREATELANGUAGESUBCLASSES;
  }

  public getGetAllNamespacePrefixesEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.GETALLNAMESPACEPREFIXES;
  }

  public getNamespaceMapEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.GETNAMESPACEMAP;
  }

  public getModifyElementEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.MODIFYELEMENT;
  }

  public getEditDatatypePropertyEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.EDITDATATYPEPROPERTY;
  }

  public getEditObjectPropertyEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.EDITOBJECTPROPERTY;
  }

  public getDeleteDatatypePropertyEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.DELETEDATATYPEPROPERTY;
  }

  public getDeleteObjectPropertyEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.DELETEOBJECTPROPERTY;
  }

  public getDomainConceptsEndpoint(): string {
    return this.webserviceEndpoint + EndpointSettings.GETDOMAINCONCEPTS;
  }

  public getRelationOptionsEndpoint(relationid: string) {
    return this.webserviceEndpoint + "/ModEnv/relations/" + relationid + "/options";
  }

  public getConceptualElementInstances() {
    return this.webserviceEndpoint + "/ModEnv/model-elements/search";
  }
  public getModelAndLanguageFromFuseki(){
    return this.webserviceEndpoint + "/ModEnv/getTTL"   ;

  }
  //not used method
  public getModelAndLanguageFromFusekiAdvanced(){
    return this.webserviceEndpoint + "/ModEnv/getTTLAd"   ;

  }
//old endpoint not used anymore
  public getModelAndLanguageFromFusekiAdvancedwithDistinction(){
    return this.webserviceEndpoint + "/ModEnv/getTTLAdwithDistinction"   ;

  }
  public getModelAndLanguageFromFusekiAdvancedwithDistinction2(){
    return this.webserviceEndpoint + "/ModEnv/getTTLAdwithDistinction2"   ;

  }

  public postLanguagesToFuseki(){
    return this.webserviceEndpoint + "/ModEnv/postLanguagesSelectedtoFuseki"   ;

  }


  public getPrefixFromFuseki(){
    return this.webserviceEndpoint + "/ModEnv/getPrefixesFromFuseki2"   ;

  }
  public getPrefixFromGithub(){
    return this.webserviceEndpoint + "/ModEnv/getLanguagesFromGithub"   ;

  }

  public uploadTtlFromDesktop(){
    return this.webserviceEndpoint + "/ModEnv/postTtlFromDesktop"   ;

  }

  public getLogin() :string {
    return this.webserviceEndpoint + "/login";
  }

  public getLogout() :string {
    return this.webserviceEndpoint + "/logout";
  }

  public getAuth() :string {
    return this.webserviceEndpoint + "/auth";
  }
}

export class VariablesSettings{

  public static paletteCategoryConnectorsURI: string = 'http://fhnw.ch/modelingEnvironment/PaletteOntology#Category_Connectors';
  public static paletteCategoryGroupsURI: string = 'http://fhnw.ch/modelingEnvironment/PaletteOntology#Category_Groups';
  public static paletteCatogorySwimlanesURI: string = 'http://fhnw.ch/modelingEnvironment/PaletteOntology#Category_Swimlanes';
  public static iconLocation: string = '../assets/images/';

  /* Set the following property to the root of the images folder */
  public static IMG_ROOT: string = '../assets/images/';

  /* START - BPMN Properties to the names of the categories in the PaletteOntology */
  public static CAT_ACTIVITIES: string = 'Category_Activities4BPMNProcessModelingView';
  public static CAT_EVENTS: string = 'Category_Events4BPMNProcessModelingView';
  public static CAT_GATEWAYS: string = 'Category_Gateways4BPMNProcessModelingView';
  public static CAT_DATA: string = 'Category_Data4BPMNProcessModelingView';
  public static CAT_GROUPS: string = 'Category_Groups4BPMNProcessModelingView';
  public static CAT_CONNECTORS: string = 'Category_Connectors4BPMNProcessModelingView';
  /* END - Properties to the names of the categories in the PaletteOntology */

  /* START - Organizational Model */
  public static CAT_OrganizationalUnit: string = 'Category_OrganizationalUnit';
  public static CAT_Performer: string = 'Category_Performer';
  public static CAT_Role: string = 'Category_Role';
  /* END - Organizational Model */

  /* START - DSML4PTM */
  public static CAT_Document_DSML4PTM: string = 'Category_Document4DSML4PTMDocumentView';

  public static CAT_Data_DSML4PTM: string = 'Category_Data4DSML4PTMProcessModelingView';

  public static CAT_Activities_DSML4PTM: string = 'Category_Activities4DSML4PTMProcessModelingView';

  public static CAT_DocumentConnectors_DSML4PTM: string = 'Category_Connectors4DKModelingView';

  /* END - DSML4PTM  */

  /* START - BPaaS */
  public static CAT_GROUPS4BPaaS: string = 'Category_Groups4BPaaSProcessModelingView';

  /* END - BPaaS  */

  /* START - FloWare */
  public static CAT_FloWare_SystemLayer: string = 'FloWare_SystemLayer';

  /* END - FloWare  */

  /* START - ArchiMate */
  public static CAT_ArchiMate_ApplicationLayer: string = 'ArchiMate_ApplicationLayer';
  public static CAT_ArchiMate_BusinessLayer: string = 'ArchiMate_BusinessLayer';
  public static CAT_ArchiMate_TechnologyLayer: string = 'ArchiMate_TechnologyLayer';
  /* END - ArchiMate  */

  /* START - SAP Scenes */
  public static CAT_SAPSCENES: string = 'SAPScenesElements';
  public static CAT_SAPRELATIONS: string = 'SAPScenesRelations';
  /* END - SAP Scenes */

  /* START - Properties to the complete path of the images for the categories */
  public static eventImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_EVENTS + "/";
  public static activitiesImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_ACTIVITIES + "/";
  public static gatewaysImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_GATEWAYS + "/";
  public static dataObjectImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_DATA + "/";
  public static groupImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_GROUPS + "/";
  public static connectorsImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_CONNECTORS + "/";

  public static documents4DSML4PTMImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_Document_DSML4PTM + "/";
  public static data4DSML4PTMImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_Data_DSML4PTM + "/";
  public static activities4DSML4PTMImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_Activities_DSML4PTM + "/";
  public static connectors4Document4DSML4PTMImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_DocumentConnectors_DSML4PTM + "/";

  public static group4BPaaSImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_GROUPS4BPaaS + "/";

  public static organizationalUnitImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_OrganizationalUnit + "/";
  public static performerImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_Performer + "/";
  public static roleImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_Role + "/";


  public static sapScenesImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_SAPSCENES + "/";
  public static sapRelationsImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_SAPRELATIONS + "/";

  public static archiMateApplicationLayerImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_ArchiMate_ApplicationLayer + "/";
  public static archiMateBusinessLayerImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_ArchiMate_BusinessLayer + "/";
  public static archiMateTechLayerImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_ArchiMate_TechnologyLayer + "/";
  public static floWare_SystemLayerImagePath: string = VariablesSettings.IMG_ROOT + VariablesSettings.CAT_FloWare_SystemLayer + "/";
  /* END - Properties to the complete path of the images for the categories */
}

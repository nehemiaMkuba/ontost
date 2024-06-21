import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {ModellingEnvironmentComponent} from './pages/modelling-environment/modelling-environment.component';
import {PaletteAreaComponent} from './pages/modelling-environment/components/palette-area/palette-area.component';
import {ModellingAreaComponent} from './pages/modelling-environment/components/modelling-area/modelling-area.component';
import {RouterModule, Routes} from '@angular/router';
import {SelectDropDownModule} from 'ngx-select-dropdown';
import {ModellerService} from './core/services/modeller/modeller.service';
import {FlexLayoutModule} from '@angular/flex-layout';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import {MatMenuModule} from '@angular/material/menu';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatOptionModule, MatRippleModule} from '@angular/material/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToolRecursivePaletteElementComponent} from './-tool-recursive-palette-element/-tool-recursive-palette-element.component';
import {ModalInstancePropertiesComponent} from './shared/modals/modal-instance-properties/modal-instance-properties.component';
import {
  ModalPaletteElementPropertiesComponent
} from './shared/modals/modal-palette-element-properties/modal-palette-element-properties.component';
import {ModalExtendPaletteElementComponent} from './shared/modals/modal-extend-palette-element/modal-extend-palette-element.component';
import {
  ModalConnectorElementPropertiesComponent
} from './shared/modals/modal-connector-element-properties/modal-connector-element-properties.component';
import {ModalInsertPropertyComponent} from './shared/modals/modal-insert-datatype-property/modal-insert-datatype-property.component';
import {
  ModalConnectorManageCombinationsComponent
} from './shared/modals/modal-connector-manage-combinations/modal-connector-manage-combinations.component';

import {ModalCreateDomainElementsComponent} from './shared/modals/modal-create-domain-elements/modal-create-domain-elements.component';
import {ModalEditPaletteElementComponent} from './shared/modals/modal-edit-palette-element/modal-edit-palette-element.component';
import {ModalEditPropertiesComponent} from './shared/modals/modal-edit-datatype-property/modal-edit-datatype-property.component';
import {ModalAddPropertiesComponent} from './shared/modals/modal-add-properties/modal-add-properties.component';
import {ModalInsertObjectPropertyComponent} from './shared/modals/modal-insert-object-property/modal-insert-object-property.component';
import {HeaderPaneComponent} from './core/components/header-pane/header-pane.component';
import {ModalEditBCObjectPropertyComponent} from './shared/modals/modal-edit-bc-object-property/modal-edit-bc-object-property.component';
import {
  ModalInsertLangobjectPropertyComponent
} from './shared/modals/modal-insert-langobject-property/modal-insert-langobject-property.component';
import {ModalEditSMObjectPropertyComponent} from './shared/modals/modal-edit-sm-object-property/modal-edit-sm-object-property.component';
import {ModalModelCreation} from './shared/modals/modal-model-creation/modal-model-creation.component';
import {ModalModelLink} from './shared/modals/modal-model-link/modal-model-link';
import {ModalElementNote} from './shared/modals/modal-element-note/modal-element-note.component';
import {
  ModalModellingLanguageConstructInstanceLink
} from './shared/modals/modal-modelling-language-construct-instance-link/modal-modelling-language-construct-instance-link';
import {ModalPaletteVisualisation} from './shared/modals/modal-palette-visualisation/modal-palette-visualisation';
import {ModalModelEdit} from './shared/modals/modal-model-edit/modal-model-edit.component';
import {ModalViewElementDetail} from './shared/modals/model-element-detail/model-element-detail.component';
import {ModalShowLanguageInstances} from './shared/modals/modal-show-language-instances/modal-show-language-instances';
import {EndpointSettings} from './_settings/endpoint.settings';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {ModalModelExport} from './shared/modals/modal-model-export/modal-model-export-component';
import {ImportExportEnvironmentComponent} from './pages/importExport-environment/import-export-environment.component';
import {ModalModelMultipleExport} from './shared/modals/modal-model-multiple-export/modal-model-multiple-export.component';
import {ModalModelMultipleImport} from './shared/modals/modal-model-multiple-import/modal-model-multiple-import.component';
import {FileUploadComponent} from './pages/importExport-environment/components/file-upload/file-upload.component';
import {HomeComponent} from './pages/home/home.component';
import {DiagramManagementComponent} from './pages/diagram-management/diagram-management.component';

import {ModellingAreaBPMNComponent} from './pages/modelling-environment/components/modelling-area-bpmn/modelling-area-bpmn.component';
import {PaletteAreaBPMNComponent} from './pages/modelling-environment/components/palette-area-bpmn/palette-area-bpmn.component';

import {ModalInstantiationTypeComponent} from './shared/modals/modal-instantiation-type/modal-instantiation-type.component';
import {ContextMenuModule} from 'ngx-contextmenu';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import { ModalInsertShaclPropertyComponent } from './shared/modals/modal-insert-shacl-property/modal-insert-shacl-property.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { ToastrModule } from 'ngx-toastr';
import {httpInterceptorProviders} from "./core/services/auth/http-interceptor.service";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


const appRoutes: Routes = [
  {path: 'diagramManagement', component: DiagramManagementComponent},
  {path: 'modeller', component: ModellingEnvironmentComponent},
  {path: 'importExport', component: ImportExportEnvironmentComponent},
  {path: 'home', component: HomeComponent},
  {path: '', component: HomeComponent},
];

export function appInit(endpointSettings: EndpointSettings) {
  return () => endpointSettings.load();
}

@NgModule({
  declarations: [
    ImportExportEnvironmentComponent,
    AppComponent,
    ModellingEnvironmentComponent,
    PaletteAreaComponent,
    PaletteAreaBPMNComponent,
    HeaderPaneComponent,
    ModellingAreaComponent,
    ToolRecursivePaletteElementComponent,
    ModalInstancePropertiesComponent,
    ModalPaletteElementPropertiesComponent,
    ModalExtendPaletteElementComponent,
    ModalConnectorElementPropertiesComponent,
    ModalInsertPropertyComponent,
    ModalConnectorManageCombinationsComponent,
    ModalCreateDomainElementsComponent,
    ModalEditPaletteElementComponent,
    ModalEditPropertiesComponent,
    ModalAddPropertiesComponent,
    ModalInsertObjectPropertyComponent,
    HeaderPaneComponent,
    ModalEditBCObjectPropertyComponent,
    ModalInsertLangobjectPropertyComponent,
    ModalEditSMObjectPropertyComponent,
    ModalModelCreation,
    ModalViewElementDetail,
    ModalModelLink,
    ModalInstantiationTypeComponent,
    ModalElementNote,
    ModalModellingLanguageConstructInstanceLink,
    ModalPaletteVisualisation,
    ModalModelEdit,
    ModalShowLanguageInstances,
    ModalModelExport,
    ModalModelMultipleExport,
    ModalModelMultipleImport,
    FileUploadComponent,
    HomeComponent,
    DiagramManagementComponent,
    ModellingAreaBPMNComponent,
    ModalInsertShaclPropertyComponent,
  ],
  entryComponents: [
    ModalInstancePropertiesComponent,
    ModalPaletteElementPropertiesComponent,
    ModalExtendPaletteElementComponent,
    ModalConnectorElementPropertiesComponent,
    ModalInsertPropertyComponent,
    ModalCreateDomainElementsComponent,
    ModalEditPaletteElementComponent,
    ModalAddPropertiesComponent,
    ModalEditPropertiesComponent,
    ModalEditBCObjectPropertyComponent,
    ModalEditSMObjectPropertyComponent,
    ModalInsertObjectPropertyComponent,
    ModalInsertLangobjectPropertyComponent,
    ModalModelCreation,
    ModalViewElementDetail,
    ModalModelLink,
    ModalElementNote,
    ModalModellingLanguageConstructInstanceLink,
    ModalPaletteVisualisation,
    ModalModelEdit,
    ModalShowLanguageInstances,
    ModalModelExport,
    ModalModelMultipleExport,
    ModalModelMultipleImport,
    ModalInstantiationTypeComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    FlexLayoutModule,
    ContextMenuModule.forRoot(),
    MatListModule,
    MatButtonModule,
    MatToolbarModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatOptionModule,
    MatOptionModule,
    MatCheckboxModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    SelectDropDownModule,
    MatGridListModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatRippleModule,
    MatIconModule,
    MatMenuModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatButtonToggleModule,
    ToastrModule.forRoot(),
    MatProgressSpinnerModule,
  ],
  providers: [
    ModellerService,
    MatSnackBar,
    EndpointSettings,
    httpInterceptorProviders,
    {
      provide: APP_INITIALIZER,
      useFactory: appInit,
      multi: true,
      deps: [EndpointSettings]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

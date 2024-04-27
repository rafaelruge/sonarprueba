import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '@app/modules/core/core.module';
import { MaterialModule } from '@app/modules/material/material.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSelectModule } from 'ngx-select-ex';
import { UiSwitchModule } from 'ngx-toggle-switch';

import { PaisesComponent } from './pages/paises/paises.component';
import { CiudadesComponent } from './pages/ciudades/ciudades.component';
import { DepartamentosComponent } from './pages/departamentos/departamentos.component';
import { SedesComponent } from './pages/sedes/sedes.component';
import { DiccionarioParametrosComponent } from './pages/diccionario-parametros/diccionario-parametros.component';
import { ParametrosGlobalesComponent } from './pages/parametros-globales/parametros-globales.component';
import { GestionLaboratoriosComponent } from './pages/gestion-laboratorios/gestion-laboratorios.component';
import { TipoUsuarioComponent } from './pages/tipo-usuario/tipo-usuario.component';
import { ListarUsuarioComponent } from './pages/tipo-usuario/listar-usuario/listar-usuario.component';
import { AsignacionSedeUsuarioComponent } from './pages/asignacion-sede-usuario/asignacion-sede-usuario.component';
import { LicenciamientoComponent } from './pages/licenciamiento/licenciamiento.component';
import { PermisosEspecialesComponent } from './pages/permisos-especiales/permisos-especiales.component';
import { MatInputModule } from '@angular/material/input';
import { TablaPermisosComponent } from './pages/permisos-especiales/tabla-permisos/tabla-permisos.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';



@NgModule({

  declarations: [

    PaisesComponent,
    CiudadesComponent,
    DepartamentosComponent,
    SedesComponent,
    DiccionarioParametrosComponent,
    ParametrosGlobalesComponent,
    GestionLaboratoriosComponent,
    TipoUsuarioComponent,
    ListarUsuarioComponent,
    AsignacionSedeUsuarioComponent,
    LicenciamientoComponent,
    PermisosEspecialesComponent,
    TablaPermisosComponent

  ],
  imports: [
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    CoreModule,
    UiSwitchModule,
    NgBootstrapFormValidationModule,
    NgbModule,
    ModalModule.forRoot(),
    NgxSelectModule,
    RoundProgressModule,
    MaterialModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule
    

  ],
  exports: [

    TranslateModule,
    PaisesComponent,
    CiudadesComponent,
    DepartamentosComponent,
    SedesComponent,
    DiccionarioParametrosComponent,
    ParametrosGlobalesComponent,
    GestionLaboratoriosComponent,
    TipoUsuarioComponent,
    ListarUsuarioComponent,
    AsignacionSedeUsuarioComponent,
    LicenciamientoComponent

  ]
  

})

export class ConfiguracionModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PagesRouting } from './pages.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSelectModule } from 'ngx-select-ex';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { ModalModule } from 'ngx-bootstrap/modal';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// modules
import { CalidadExternoModule } from './calidad-externo/calidad-externo.module';
import { CalidadInternoModule } from './calidad-interno/calidad-interno.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';

// material
import { MaterialModule } from '../material/material.module';

import { InicioComponent } from './inicio/inicio.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PreAnaliticoModule } from './pre-analitico/pre-analitico.module';
import { PostAnaliticoModule } from './post-analitico/post-analitico.module';
import {mantenimietoCalibradoresModule} from './mantenimiento-calibradores/mantenimiento-callibradores.module';

@NgModule({

  declarations: [

    InicioComponent,
    DashboardComponent,

  ],
  exports: [

    TranslateModule,

  ],
  imports: [

    CommonModule,
    PagesRouting,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    SharedModule,
    CoreModule,
    UiSwitchModule,
    NgBootstrapFormValidationModule,
    NgbModule,
    ModalModule.forRoot(),
    NgxSelectModule,
    RoundProgressModule,
    MaterialModule,
    CalidadExternoModule,
    ConfiguracionModule,
    CalidadInternoModule,
    PreAnaliticoModule,
    PostAnaliticoModule,
    mantenimietoCalibradoresModule,
    MatTooltipModule,
    MatAutocompleteModule
  ]

})

export class PagesModule { }

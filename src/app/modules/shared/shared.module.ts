import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { RouterModule } from '@angular/router';
import { CargadorComponent } from './cargador/cargador.component';
import { FooterComponent } from './footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

import { CoreModule } from '../core/core.module';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { VentanasModalesComponent } from './ventanas-modales/ventanas-modales.component';
import { ReporteConsolidadoComponent } from './graficos/reporte-consolidado/reporte-consolidado.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { AlertUpdateComponent } from './alert-update/alert-update.component';
import { AlertCreateComponent } from './alert-create/alert-create.component';
import { AlertWelcomeComponent } from './alert-welcome/alert-welcome.component';
import { NombreLotePipe } from './pipe/nombre-lote.pipe';
import { NombreControlmaterialPipe } from './pipe/nombre-contmat.pipe';
import { NombreControlmaterialEditPipe } from './pipe/nombre-contmatedit.pipe';
import { NombreSedePipe } from './pipe/nombre-sede.pipe';
import { NombreAnalitoPipe } from './pipe/nombre-analito.pipe';
import { NombreAnalyzerPipe } from './pipe/nombre-analizer.pipe';
import { NombreMetodoPipe } from './pipe/nombre-metodo.pipe';
import { NombreReactivoPipe } from './pipe/nombre-reactivo.pipe';
import { NombreUnidadPipe } from './pipe/nombre-unidad.pipe';
import { NombreSeccionPipe } from './pipe/nombre-seccion.pipe';
import { GraficaLineasComponent } from './graficos/grafica-lineas/grafica-lineas.component';
import { GraficaBarrasComponent } from './graficos/grafica-barras/grafica-barras.component';

@NgModule({

  declarations: [

    MenuComponent,
    CargadorComponent,
    FooterComponent,
    BreadcrumbsComponent,
    VentanasModalesComponent,
    ReporteConsolidadoComponent,
    AlertUpdateComponent,
    AlertCreateComponent,
    AlertWelcomeComponent,
    NombreLotePipe,
    NombreControlmaterialPipe,
    NombreSedePipe,
    NombreAnalitoPipe,
    NombreAnalyzerPipe,
    NombreMetodoPipe,
    NombreReactivoPipe,
    NombreUnidadPipe,
    NombreControlmaterialEditPipe,
    NombreSeccionPipe,
    GraficaLineasComponent,
    GraficaBarrasComponent
  ],
  exports: [

    MenuComponent,
    FooterComponent,
    CargadorComponent,
    BreadcrumbsComponent,
    TranslateModule,
    VentanasModalesComponent,
    ReporteConsolidadoComponent,
    AlertUpdateComponent,
    AlertCreateComponent,
    AlertWelcomeComponent,
    NombreLotePipe,
    NombreControlmaterialPipe,
    NombreSedePipe,
    NombreAnalitoPipe,
    NombreAnalyzerPipe,
    NombreMetodoPipe,
    NombreReactivoPipe,
    NombreUnidadPipe,
    NombreControlmaterialEditPipe,
    NombreSeccionPipe,
    GraficaLineasComponent,
    GraficaBarrasComponent
  ],
  imports: [

    CommonModule,
    RouterModule,
    TranslateModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    NgApexchartsModule
  ],
  bootstrap: [

    MenuComponent,
    
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]

})

export class SharedModule { }

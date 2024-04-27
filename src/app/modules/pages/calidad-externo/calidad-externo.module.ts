import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '@app/modules/core/core.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSelectModule } from 'ngx-select-ex';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { NgApexchartsModule } from "ng-apexcharts";
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';

// material
import { MaterialModule } from '../../material/material.module';

import { UnidadesComponent } from './pages/unidades/unidades.component';
import { ProveedoresComponent } from './pages/proveedores/proveedores.component';
import { RondasComponent } from './pages/configuracion/rondas/rondas.component';
import { ClientesComponent } from './pages/configuracion/clientes/clientes.component';
import { AnalitosComponent } from './pages/configuracion/analitos/analitos.component';
import { AnalizadoresComponent } from './pages/configuracion/analizadores/analizadores.component';
import { MetodosComponent } from './pages/configuracion/metodos/metodos.component';
import { LotesComponent } from './pages/lotes/lotes.component';
import { MuestrasComponent } from './pages/muestras/muestras.component';
import { ProgramasComponent } from './pages/programas/programas.component';
import { CrearProgramaComponent } from './pages/crear-programa/crear-programa.component';
import { MaterialControlComponent } from './pages/material-control/material-control.component';
import { SeccionesComponentQce } from './pages/secciones/secciones.component';
import { DiccionarioResultadosQceComponent } from './pages/diccionario-resultados-qce/diccionario-resultados-qce.component';
import { IngresoDatosExternoComponent } from './pages/ingreso-datos-externo/ingreso-datos-externo.component';
import { ObjetivosCalidadComponent } from './pages/objetivos-calidad/objetivos-calidad.component';
import { FuentesQceComponent } from './pages/fuentes/fuentes-qce.component';
import { ConsolidadoResultadosComponent } from './pages/consolidado-resultados/consolidado-resultados.component';
import { CriteriosDatosAberrantesComponent } from './pages/criterios-datos-aberrantes/criterios-datos-aberrantes.component';
import { FiltroGrubbsComponent } from './pages/filtro-grubbs/filtro-grubbs.component';
import { ConfiguracionResultadosComponent } from './pages/configuracion-resultados/configuracion-resultados.component';
import { IndicadorReportesComponent } from './pages/indicador-reportes/indicador-reportes.component';
import { ReporteResultadoParticipantesComponent } from './pages/reporte-resultado-participantes/reporte-resultado-participantes.component';
import { ReporteClienteCualitativoComponent } from './pages/reporte-cliente-cualitativo/reporte-cliente-cualitativo.component';
import { ReporteCuantitativoComponent } from './pages/reporte-cuantitativo/reporte-cuantitativo.component';
import { AsignacionProgramasComponent } from './pages/asignacion-programas/asignacion-programas.component';
import { AsignacionValorEsperadoComponent } from './pages/asignacion-valor-esperado/asignacion-valor-esperado.component';
import { AsignacionValorEsperado2Component } from './pages/asignacion-valor-esperado-2/asignacion-valor-esperado-2.component';
import { GestionReactivosqceComponent } from './pages/gestion-reactivosqce/gestion-reactivosqce.component';
import { AsignacionValorEsperadoCualitativoComponent } from './pages/asignacion-valor-esperado-cualitativo/asignacion-valor-esperado-cualitativo.component';
import { ReporteDesempenoCualitativoComponent } from './pages/reporte-desempeno-cualitativo/reporte-desempeno-cualitativo.component';
import { ReporteDesempenioCualitativoClienteComponent } from './pages/reporte-desempenio-cualitativo-cliente/reporte-desempenio-cualitativo-cliente.component';
import { ConfiguracionEstadisticasComponent } from './pages/configuracion-estadistica/configuracion-estadisticas.component';
import { ReporteSemicuantitativoComponent } from './pages/reporte-semicuantitativo/reporte-semicuantitativo.component';
import { ReporteSemicuantitativoClienteComponent } from './pages/reporte-semicuantitativo-cliente/reporte-semicuantitativo-cliente.component';
import { ReporteICTEmisorComponent } from './pages/reporte-ict-emisor/reporte-ict-emisor.component';

@NgModule({

  declarations: [

    MaterialControlComponent,
    UnidadesComponent,
    ProveedoresComponent,
    RondasComponent,
    ClientesComponent,
    AnalitosComponent,
    AnalizadoresComponent,
    MetodosComponent,
    LotesComponent,
    MuestrasComponent,
    ProgramasComponent,
    CrearProgramaComponent,
    SeccionesComponentQce,
    DiccionarioResultadosQceComponent,
    IngresoDatosExternoComponent,
    ObjetivosCalidadComponent,
    FuentesQceComponent,
    ConsolidadoResultadosComponent,
    CriteriosDatosAberrantesComponent,
    FiltroGrubbsComponent,
    ConfiguracionResultadosComponent,
    IndicadorReportesComponent,
    ReporteResultadoParticipantesComponent,
    ReporteClienteCualitativoComponent,
    ReporteCuantitativoComponent,
    AsignacionProgramasComponent,
    AsignacionValorEsperadoComponent,
    AsignacionValorEsperado2Component,
    GestionReactivosqceComponent,
    AsignacionValorEsperadoCualitativoComponent,
    ReporteDesempenoCualitativoComponent,
    ReporteDesempenioCualitativoClienteComponent,
    ConfiguracionEstadisticasComponent,
    ReporteSemicuantitativoComponent,
    ReporteSemicuantitativoClienteComponent,
    ReporteICTEmisorComponent
  ],

  imports: [

    CommonModule,
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
    CollapseModule,
    RoundProgressModule,
    MaterialModule,
    NgxSpinnerModule,
    NgApexchartsModule,
    MatTooltipModule,
    MatAutocompleteModule

  ],
  exports: [

    TranslateModule,
    MaterialControlComponent,
    UnidadesComponent,
    ProveedoresComponent,
    RondasComponent,
    ClientesComponent,
    AnalitosComponent,
    AnalizadoresComponent,
    MetodosComponent,
    LotesComponent,
    MuestrasComponent,
    ProgramasComponent,
    CrearProgramaComponent,
    IngresoDatosExternoComponent,
    ConsolidadoResultadosComponent,
    FiltroGrubbsComponent,
    IndicadorReportesComponent


  ]

})

export class CalidadExternoModule { }

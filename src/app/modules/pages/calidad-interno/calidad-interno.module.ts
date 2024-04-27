import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '@app/modules/core/core.module';
import { GraficosModule } from '@app/modules/graficos/graficos.module';
import { MaterialModule } from '@app/modules/material/material.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSelectModule } from 'ngx-select-ex';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AnalitosFuenteComponent } from './pages/analitos-fuente/analitos-fuente.component';
import { ConfiguracionDeObjetivosComponent } from './pages/configuracion-de-objetivos/configuracion-de-objetivos.component';
import { ConfiguracionMediaDsComponent } from './pages/configuracion-media-ds/configuracion-media-ds.component';
import { ConfiguracionObjetivosAnalitoComponent } from './pages/configuracion-objetivos-analito/configuracion-objetivos-analito.component';
import { ConfiguracionWestgardComponent } from './pages/configuracion-westgard/configuracion-westgard.component';
import { DianaCalculateComponent } from './pages/diana-calculate/diana-calculate.component';
import { FuentesComponent } from './pages/fuentes/fuentes.component';
import { GestionAccionesCorrectivasComponent } from './pages/gestion-acciones-correctivas/gestion-acciones-correctivas.component';
import { GestionAnaliticosComponent } from './pages/gestion-analiticos/gestion-analiticos.component';
import { GestionAsociacionesMcComponent } from './pages/gestion-asociaciones-mc/gestion-asociaciones-mc.component';
import { GestionCasasComercialesComponent } from './pages/gestion-casas-comerciales/gestion-casas-comerciales.component';
import { GestionFuentesComponent } from './pages/gestion-fuentes/gestion-fuentes.component';
import { GestionInstrumentosLabComponent } from './pages/gestion-instrumentos-lab/gestion-instrumentos-lab.component';
import { GestionLotMaterialControlComponent } from './pages/gestion-lot-material-control/gestion-lot-material-control.component';
import { GestionLotesComponent } from './pages/gestion-lotes/gestion-lotes.component';
import { GestionMaterialesControlComponent } from './pages/gestion-materiales-control/gestion-materiales-control.component';
import { GestionMetodosComponent } from './pages/gestion-metodos/gestion-metodos.component';
import { GestionReactivosComponent } from './pages/gestion-reactivos/gestion-reactivos.component';
import { GestionTestComponent } from './pages/gestion-test/gestion-test.component';
import { UnidadesMedidaComponent } from './pages/unidades-medida/unidades-medida.component';
import { ValoresDianaComponent } from './pages/valores-diana/valores-diana.component';
import { WestgardComponent } from './pages/westgard/westgard.component';
import { CriteriosAceptacionComponent } from './pages/criterios-aceptacion/criterios-aceptacion.component';
import { SeccionesComponent } from './pages/secciones/secciones.component';
import { DiccionarioResultadosComponent } from './pages/diccionario-resultados/diccionario-resultados.component';
import { ReporteConsolidadoICTComponent } from './pages/reporte-consolidado-ict/reporte-consolidado-ict.component';
import { IndicadoresCompetenciaTecnicaComponent } from './pages/indicadores-competencia-tecnica/indicadores-competencia-tecnica.component';
import { ReporteAnalitosAlertaComponent } from './pages/reporte-analitos-alerta/reporte-analitos-alerta.component';
import { IndicadoresReportesComponent } from './pages/indicadores-reportes/indicadores-reportes.component';
import { IngresoDatosComponent } from './pages/ingreso-datos/ingreso-datos.component';
import { IngresoDatosCualitativoComponent } from './pages/ingreso-datos-cualitativo/ingreso-datos-cualitativo.component';
import { IngresoDatosCuantitativoMultiComponent } from './pages/ingreso-datos-cuantitativo-multi/ingreso-datos-cuantitativo-multi.component';
import { IngresoDatosCualitativoMultiComponent } from './pages/ingreso-datos-cualitativo-multi/ingreso-datos-cualitativo-multi.component';
import { IngresoDatosGraficosComponent} from './pages/ingreso-datos-graficos/ingreso-datos-graficos.component';
import { DatosAberrantesComponent } from './pages/datos-aberrantes/datos-aberrantes.component';
import { FiltroGrubbsInternoComponent } from './pages/FiltrosGrubbsInt/filtros-grubbs-interno.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReporteAnalitoCualitativoComponent } from './pages/reporte-analito-cualitativo/reporte-analito-cualitativo.component';
import { PorcentajeConfianzaComponent } from './pages/porcentaje-confianza/porcentaje-confianza.component';

@NgModule({

  declarations: [

    AnalitosFuenteComponent,
    ConfiguracionDeObjetivosComponent,
    ConfiguracionMediaDsComponent,
    ConfiguracionObjetivosAnalitoComponent,
    ConfiguracionWestgardComponent,
    DianaCalculateComponent,
    FuentesComponent,
    GestionAccionesCorrectivasComponent,
    GestionAnaliticosComponent,
    GestionAsociacionesMcComponent,
    GestionCasasComercialesComponent,
    GestionFuentesComponent,
    GestionInstrumentosLabComponent,
    GestionLotMaterialControlComponent,
    GestionLotesComponent,
    GestionMaterialesControlComponent,
    GestionMetodosComponent,
    GestionReactivosComponent,
    GestionTestComponent,
    UnidadesMedidaComponent,
    ValoresDianaComponent,
    WestgardComponent,
    CriteriosAceptacionComponent,
    SeccionesComponent,
    DiccionarioResultadosComponent,
    ReporteConsolidadoICTComponent,
    IndicadoresCompetenciaTecnicaComponent,
    ReporteAnalitosAlertaComponent,
    IndicadoresReportesComponent,
    IngresoDatosCualitativoComponent,
    IngresoDatosComponent,
    IngresoDatosCuantitativoMultiComponent,
    IngresoDatosCualitativoMultiComponent,
    IngresoDatosGraficosComponent,
    DatosAberrantesComponent,
    FiltroGrubbsInternoComponent,
    ReporteAnalitoCualitativoComponent,
    PorcentajeConfianzaComponent

  ],

  exports: [

    TranslateModule,
    AnalitosFuenteComponent,
    ConfiguracionDeObjetivosComponent,
    ConfiguracionMediaDsComponent,
    ConfiguracionObjetivosAnalitoComponent,
    ConfiguracionWestgardComponent,
    DianaCalculateComponent,
    FuentesComponent,
    GestionAccionesCorrectivasComponent,
    GestionAnaliticosComponent,
    GestionAsociacionesMcComponent,
    GestionCasasComercialesComponent,
    GestionFuentesComponent,
    GestionInstrumentosLabComponent,
    GestionLotMaterialControlComponent,
    GestionLotesComponent,
    GestionMaterialesControlComponent,
    GestionMetodosComponent,
    GestionReactivosComponent,
    GestionTestComponent,
    UnidadesMedidaComponent,
    ValoresDianaComponent,
    WestgardComponent,
    CriteriosAceptacionComponent,
    ReporteConsolidadoICTComponent,
    IndicadoresCompetenciaTecnicaComponent,
    ReporteAnalitosAlertaComponent,
    IndicadoresReportesComponent,
    IngresoDatosCualitativoComponent,
    IngresoDatosComponent,
    IngresoDatosGraficosComponent,
    DatosAberrantesComponent,
    FiltroGrubbsInternoComponent,
    ReporteAnalitoCualitativoComponent,
    PorcentajeConfianzaComponent
  ],
  imports: [

    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    SharedModule,
    CoreModule,
    UiSwitchModule,
    NgxSpinnerModule,
    NgBootstrapFormValidationModule,
    NgbModule,
    ModalModule.forRoot(),
    NgxSelectModule,
    RoundProgressModule,
    MaterialModule,
    GraficosModule,
    MatTooltipModule,
    MatAutocompleteModule
  ]

})

export class CalidadInternoModule { }

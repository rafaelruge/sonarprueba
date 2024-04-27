import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { InicioComponent } from './inicio/inicio.component';
import { DashboardComponent } from './dashboard/dashboard.component';

// pages calidad - externo
import { RondasComponent } from './calidad-externo/pages/configuracion/rondas/rondas.component';
import { ClientesComponent } from './calidad-externo/pages/configuracion/clientes/clientes.component';
import { MetodosComponent } from './calidad-externo/pages/configuracion/metodos/metodos.component';
import { AnalizadoresComponent } from './calidad-externo/pages/configuracion/analizadores/analizadores.component';
import { AnalitosComponent } from './calidad-externo/pages/configuracion/analitos/analitos.component';
import { MaterialControlComponent } from './calidad-externo/pages/material-control/material-control.component';
import { LotesComponent } from './calidad-externo/pages/lotes/lotes.component';
import { MuestrasComponent } from './calidad-externo/pages/muestras/muestras.component';
import { ProgramasComponent } from './calidad-externo/pages/programas/programas.component';
import { TipoUsuarioComponent } from './configuracion/pages/tipo-usuario/tipo-usuario.component';
import { CrearProgramaComponent } from './calidad-externo/pages/crear-programa/crear-programa.component';
import { AsignacionProgramasComponent } from './calidad-externo/pages/asignacion-programas/asignacion-programas.component';
import { AsignacionValorEsperadoComponent } from "./calidad-externo/pages/asignacion-valor-esperado/asignacion-valor-esperado.component";
import { UnidadesComponent } from './calidad-externo/pages/unidades/unidades.component';
import { ProveedoresComponent } from './calidad-externo/pages/proveedores/proveedores.component';
import { IngresoDatosExternoComponent } from './calidad-externo/pages/ingreso-datos-externo/ingreso-datos-externo.component';
import { CriteriosDatosAberrantesComponent } from './calidad-externo/pages/criterios-datos-aberrantes/criterios-datos-aberrantes.component';
import { ObjetivosCalidadComponent } from './calidad-externo/pages/objetivos-calidad/objetivos-calidad.component';
import { ConsolidadoResultadosComponent } from './calidad-externo/pages/consolidado-resultados/consolidado-resultados.component';
import { FiltroGrubbsComponent } from './calidad-externo/pages/filtro-grubbs/filtro-grubbs.component';
import { FuentesQceComponent } from './calidad-externo/pages/fuentes/fuentes-qce.component';
import { SeccionesComponentQce } from './calidad-externo/pages/secciones/secciones.component';
import { DiccionarioResultadosQceComponent } from './calidad-externo/pages/diccionario-resultados-qce/diccionario-resultados-qce.component';
import { IndicadorReportesComponent } from './calidad-externo/pages/indicador-reportes/indicador-reportes.component';
import { GestionReactivosqceComponent } from "./calidad-externo/pages/gestion-reactivosqce/gestion-reactivosqce.component";
// pages configuración
import { ListarUsuarioComponent } from './configuracion/pages/tipo-usuario/listar-usuario/listar-usuario.component';
import { PaisesComponent } from './configuracion/pages/paises/paises.component';
import { DepartamentosComponent } from './configuracion/pages/departamentos/departamentos.component';
import { CiudadesComponent } from './configuracion/pages/ciudades/ciudades.component';
import { DiccionarioParametrosComponent } from './configuracion/pages/diccionario-parametros/diccionario-parametros.component';
import { ParametrosGlobalesComponent } from './configuracion/pages/parametros-globales/parametros-globales.component';
import { SedesComponent } from './configuracion/pages/sedes/sedes.component';
import { AsignacionSedeUsuarioComponent } from './configuracion/pages/asignacion-sede-usuario/asignacion-sede-usuario.component';
import { GestionLaboratoriosComponent } from './configuracion/pages/gestion-laboratorios/gestion-laboratorios.component';
//import { ReporteDesempenioCualitativoClienteComponent } from './calidad-externo/pages/reporte-desempenio-cualitativo-cliente/reporte-desempenio-cualitativo-cliente.component';
import { AsignacionValorEsperado2Component } from './calidad-externo/pages/asignacion-valor-esperado-2/asignacion-valor-esperado-2.component';
import { ReporteICTEmisorComponent } from './calidad-externo/pages/reporte-ict-emisor/reporte-ict-emisor.component';

// pages calidad - interno
import { UnidadesMedidaComponent } from './calidad-interno/pages/unidades-medida/unidades-medida.component';
import { GestionAnaliticosComponent } from './calidad-interno/pages/gestion-analiticos/gestion-analiticos.component';
import { GestionLotesComponent } from './calidad-interno/pages/gestion-lotes/gestion-lotes.component';
import { GestionAsociacionesMcComponent } from './calidad-interno/pages/gestion-asociaciones-mc/gestion-asociaciones-mc.component';
import { GestionMaterialesControlComponent } from './calidad-interno/pages/gestion-materiales-control/gestion-materiales-control.component';
import { GestionReactivosComponent } from './calidad-interno/pages/gestion-reactivos/gestion-reactivos.component';
import { GestionMetodosComponent } from './calidad-interno/pages/gestion-metodos/gestion-metodos.component';
import { GestionInstrumentosLabComponent } from './calidad-interno/pages/gestion-instrumentos-lab/gestion-instrumentos-lab.component';
import { GestionCasasComercialesComponent } from './calidad-interno/pages/gestion-casas-comerciales/gestion-casas-comerciales.component';
import { GestionAccionesCorrectivasComponent } from './calidad-interno/pages/gestion-acciones-correctivas/gestion-acciones-correctivas.component';
import { GestionFuentesComponent } from './calidad-interno/pages/gestion-fuentes/gestion-fuentes.component';
import { GestionLotMaterialControlComponent } from './calidad-interno/pages/gestion-lot-material-control/gestion-lot-material-control.component';
import { GestionTestComponent } from './calidad-interno/pages/gestion-test/gestion-test.component';
import { IngresoDatosComponent } from './calidad-interno/pages/ingreso-datos/ingreso-datos.component';
import { IngresoDatosCualitativoComponent } from './calidad-interno/pages/ingreso-datos-cualitativo/ingreso-datos-cualitativo.component';
import { ConfiguracionMediaDsComponent } from './calidad-interno/pages/configuracion-media-ds/configuracion-media-ds.component';
import { LicenciamientoComponent } from './configuracion/pages/licenciamiento/licenciamiento.component';
import { AnalitosFuenteComponent } from './calidad-interno/pages/analitos-fuente/analitos-fuente.component';
import { WestgardComponent } from './calidad-interno/pages/westgard/westgard.component';
import { ConfiguracionWestgardComponent } from './calidad-interno/pages/configuracion-westgard/configuracion-westgard.component';
import { ConfiguracionDeObjetivosComponent } from './calidad-interno/pages/configuracion-de-objetivos/configuracion-de-objetivos.component';
import { ValoresDianaComponent } from './calidad-interno/pages/valores-diana/valores-diana.component';
import { DianaCalculateComponent } from './calidad-interno/pages/diana-calculate/diana-calculate.component';
import { FuentesComponent } from './calidad-interno/pages/fuentes/fuentes.component';
import { ConfiguracionObjetivosAnalitoComponent } from './calidad-interno/pages/configuracion-objetivos-analito/configuracion-objetivos-analito.component';
import { SeccionesComponent } from './calidad-interno/pages/secciones/secciones.component';
import { CriteriosAceptacionComponent } from './calidad-interno/pages/criterios-aceptacion/criterios-aceptacion.component';
import { DiccionarioResultadosComponent } from './calidad-interno/pages/diccionario-resultados/diccionario-resultados.component';
import { ConfiguracionResultadosComponent } from './calidad-externo/pages/configuracion-resultados/configuracion-resultados.component';
import { IndicadoresReportesComponent } from './calidad-interno/pages/indicadores-reportes/indicadores-reportes.component';
import { ReporteCuantitativoComponent } from './calidad-externo/pages/reporte-cuantitativo/reporte-cuantitativo.component';
import { ReporteDesempenoCualitativoComponent } from "./calidad-externo/pages/reporte-desempeno-cualitativo/reporte-desempeno-cualitativo.component";
import { AreaConfgComponent } from './pre-analitico/pages/configuraciones/areas/area-confg.component';
import { IndicadoresConfgComponent } from './pre-analitico/pages/configuraciones/indicadores/indicadores-confg.component';
import { IndicadoresComponent } from './pre-analitico/pages/indicadores/indicadores.component';
import { IngresoDatosCuantitativoMultiComponent } from './calidad-interno/pages/ingreso-datos-cuantitativo-multi/ingreso-datos-cuantitativo-multi.component';
import { IngresoDatosCualitativoMultiComponent } from './calidad-interno/pages/ingreso-datos-cualitativo-multi/ingreso-datos-cualitativo-multi.component';
import { IngresoDatosGraficosComponent } from './calidad-interno/pages/ingreso-datos-graficos/ingreso-datos-graficos.component';
import {DatosAberrantesComponent } from './calidad-interno/pages/datos-aberrantes/datos-aberrantes.component';
import {FiltroGrubbsInternoComponent } from './calidad-interno/pages/FiltrosGrubbsInt/filtros-grubbs-interno.component';
import {PorcentajeConfianzaComponent } from './calidad-interno/pages/porcentaje-confianza/porcentaje-confianza.component';

// post-pre analitico
import { AreasComponent } from './post-analitico/pages/configuraciones/areas/areas.component';
import { PostIndicadoresComponent } from './post-analitico/pages/configuraciones/post-indicadores/post-indicadores.component';
import { PosindicadoresComponent } from './post-analitico/pages/posindicadores/posindicadores.component';
import { ReportesPreComponent } from './pre-analitico/pages/reportes/reportes-pre.component';
import { ReportesPostComponent } from './post-analitico/pages/reportes/reportes-post.component';
// mantenimiento
import {EquiposComponent} from './mantenimiento-calibradores/pages/equipos/equipos.component'
import {MantenimientoCorrectivosComponent} from './mantenimiento-calibradores/pages/mantenimiento-correctivos/mantenimiento-correctivos.component'
import { MantenimientoPreventivoComponent } from './mantenimiento-calibradores/pages/mantenimiento-preventivo/mantenimiento-preventivo.component';
import { TrazabilidadComponent } from './mantenimiento-calibradores/pages/trazabilidad/trazabilidad.component';
import { PermisosEspecialesComponent } from './configuracion/pages/permisos-especiales/permisos-especiales.component';
import { AsignacionValorEsperadoCualitativoComponent } from './calidad-externo/pages/asignacion-valor-esperado-cualitativo/asignacion-valor-esperado-cualitativo.component';
import { ConfiguracionEstadisticasComponent } from './calidad-externo/pages/configuracion-estadistica/configuracion-estadisticas.component';
import { ReporteDesempenioCualitativoClienteComponent } from './calidad-externo/pages/reporte-desempenio-cualitativo-cliente/reporte-desempenio-cualitativo-cliente.component';
import { ReporteSemicuantitativoComponent } from './calidad-externo/pages/reporte-semicuantitativo/reporte-semicuantitativo.component';
import { ReporteSemicuantitativoClienteComponent } from './calidad-externo/pages/reporte-semicuantitativo-cliente/reporte-semicuantitativo-cliente.component';



const pagesRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children:
      [

        { path: 'inicio', component: InicioComponent, data: {titulo: 'Inicio'}},
        { path: 'tipo-usuario', component: TipoUsuarioComponent },
        { path: 'gestion-asociaciones-mc', component: GestionAsociacionesMcComponent },
        { path: 'licenciamiento', component: LicenciamientoComponent },
        { path: 'configuracion/paises', component: PaisesComponent, data: {titulo: 'Países'}},
        { path: 'configuracion/departamentos', component: DepartamentosComponent, data: {titulo: 'Departamentos'}},
        { path: 'configuracion/ciudades', component: CiudadesComponent, data: {titulo: 'Ciudades'}},
        { path: 'configuracion/sedes', component: SedesComponent, data: {titulo: 'Sedes'}},
        { path: 'configuracion/diccionario-parametros', component: DiccionarioParametrosComponent },
        { path: 'configuracion/parametros-globales', component: ParametrosGlobalesComponent },
        { path: 'configuracion/gestion-laboratorios', component: GestionLaboratoriosComponent },
        { path: 'configuracion/asignacion-sede-usuario', component: AsignacionSedeUsuarioComponent },
        { path: 'configuracion/listar-usuario', component: ListarUsuarioComponent },
        { path: 'configuracion/permisos-especiales', component: PermisosEspecialesComponent },
        { path: 'calidad-interno/unidades-medida', component: UnidadesMedidaComponent },
        { path: 'calidad-interno/secciones', component: SeccionesComponent },
        { path: 'calidad-interno/gestion-analiticos', component: GestionAnaliticosComponent },
        { path: 'calidad-interno/gestion-lotes', component: GestionLotesComponent },
        { path: 'calidad-interno/gestion-materiales-control', component: GestionMaterialesControlComponent },
        { path: 'calidad-interno/gestion-reactivos', component: GestionReactivosComponent },
        { path: 'calidad-interno/gestion-metodos', component: GestionMetodosComponent },
        { path: 'calidad-interno/gestion-instrumentos-lab', component: GestionInstrumentosLabComponent },
        { path: 'calidad-interno/gestion-casas-comerciales', component: GestionCasasComercialesComponent },
        { path: 'calidad-interno/gestion-acciones-correctivas', component: GestionAccionesCorrectivasComponent },
        { path: 'calidad-interno/gestion-fuentes', component: GestionFuentesComponent },
        { path: 'calidad-interno/lot-material-control', component: GestionLotMaterialControlComponent },
        { path: 'calidad-interno/gestion-test', component: GestionTestComponent },
        { path: 'calidad-interno/criterios-aceptacion', component: CriteriosAceptacionComponent },
        { path: 'calidad-interno/diccionario-resultados', component: DiccionarioResultadosComponent },
        { path: 'calidad-interno/configuracion-objetivos-analito', component: ConfiguracionObjetivosAnalitoComponent },
        { path: 'calidad-interno/ingreso-datos-cualitativos', component: IngresoDatosCualitativoComponent },
        { path: 'calidad-interno/ingreso-datos', component: IngresoDatosComponent }, // ingreso datos Cuantitativo
        { path: 'calidad-interno/ingreso-datos-cuanti-multi', component: IngresoDatosCuantitativoMultiComponent },
        { path: 'calidad-interno/ingreso-datos-cuali-multi', component: IngresoDatosCualitativoMultiComponent },
        { path: 'calidad-interno/configuracion-media-ds', component: ConfiguracionMediaDsComponent },
        { path: 'objetivos-calidad/analitos-fuente', component: AnalitosFuenteComponent },
        { path: 'objetivos-calidad/westgard', component: WestgardComponent },
        { path: 'objetivos-calidad/configuracion-westgard', component: ConfiguracionWestgardComponent },
        { path: 'objetivos-calidad/configuracion', component: ConfiguracionDeObjetivosComponent },
        { path: 'objetivos-calidad/valores-diana', component: ValoresDianaComponent },
        { path: 'objetivos-calidad/formulas-diana', component: DianaCalculateComponent },
        { path: 'objetivos-calidad/fuentes', component: FuentesComponent },
        { path: 'control-interno/indicadores-reportes', component: IndicadoresReportesComponent, data: {titulo: 'Indicadores y Reportes'}},
        { path: 'control-interno/configuracion/datos-aberrantes', component: DatosAberrantesComponent},
        { path: 'control-interno/administracion/filtros-grubbs-interno', component: FiltroGrubbsInternoComponent},
        { path: 'control-interno/administracion/porcentaje-confianza', component: PorcentajeConfianzaComponent },

        { path: 'control-externo/indicadores-reportes', component: IndicadorReportesComponent },
        { path: 'calidad-externo/material-control', component: MaterialControlComponent, },
        { path: 'calidad-externo/unidades', component: UnidadesComponent, },
        { path: 'calidad-externo/proveedores', component: ProveedoresComponent, },
        { path: 'calidad-externo/lotes', component: LotesComponent, },
        { path: 'calidad-externo/muestras', component: MuestrasComponent, },
        { path: 'calidad-externo/asignacion-programas', component: AsignacionProgramasComponent },
        { path: 'calidad-externo/asignacion-valores', component: AsignacionValorEsperadoComponent },
        { path: 'calidad-externo/asignacion-valores-2', component: AsignacionValorEsperado2Component },
        { path: 'calidad-externo/asignacion-valores-cualitativos', component: AsignacionValorEsperadoCualitativoComponent },
        { path: 'calidad-externo/configuracion-estadistica', component: ConfiguracionEstadisticasComponent },
        { path: 'calidad-externo/programa', component: ProgramasComponent, },
        { path: 'calidad-externo/creacion-programa', component: CrearProgramaComponent, },
        { path: 'calidad-externo/reactivos', component: GestionReactivosqceComponent },
        { path: 'calidad-externo/analitos', component: AnalitosComponent },
        { path: 'calidad-externo/analizadores', component: AnalizadoresComponent },
        { path: 'calidad-externo/metodos', component: MetodosComponent },
        { path: 'calidad-externo/cliente', component: ClientesComponent },
        { path: 'calidad-externo/rondas', component: RondasComponent },
        { path: 'calidad-externo/filtros-grubbs', component: FiltroGrubbsComponent },
        { path: 'calidad-externo/secciones', component: SeccionesComponentQce },
        { path: 'calidad-externo/diccionario-resultados-qce', component: DiccionarioResultadosQceComponent },
        { path: 'calidad-externo/ingreso-datos', component: IngresoDatosExternoComponent },
        { path: 'calidad-externo/objetivos-calidad', component: ObjetivosCalidadComponent },
        { path: 'calidad-externo/fuentes', component: FuentesQceComponent },
        { path: 'calidad-externo/consolidado-resultados', component: ConsolidadoResultadosComponent },
        { path: 'calidad-externo/datos-aberrantes', component: CriteriosDatosAberrantesComponent },
        { path: 'calidad-externo/configuracion-resultados-qce', component: ConfiguracionResultadosComponent },
        { path: 'calidad-externo/reportes/desempenio-cualitativo', component:ReporteDesempenioCualitativoClienteComponent },
        { path: 'control-externo/reporte-semicuantitativo', component:ReporteSemicuantitativoComponent },
        { path: 'control-externo/reporte-semicuantitativo-cliente', component:ReporteSemicuantitativoClienteComponent },
        { path: 'control-externo/reporte-cuantitativo', component: ReporteCuantitativoComponent},
        { path: 'control-externo/reporte-cuantitativo-cliente', component: ReporteCuantitativoComponent},
        { path: 'control-externo/reporte-cualitativo', component: ReporteDesempenoCualitativoComponent },
        { path: 'control-externo/reporte-cualitativo-cliente', component: ReporteSemicuantitativoClienteComponent },
        { path: 'control-externo/reporte-ict-emisor', component: ReporteICTEmisorComponent },
        
        
        { path: 'preanalitico/areas', component: AreaConfgComponent},
        { path: 'preanalitico/indicadores-config', component: IndicadoresConfgComponent},
        { path: 'preanalitico/indicadores', component: IndicadoresComponent},
        { path: 'preanalitico/reportes', component: ReportesPreComponent},

        {path:'calidad-interno/ingreso-datos-graficos', component: IngresoDatosGraficosComponent},
        {path:'postanalitico/areas', component: AreasComponent},
        {path:'postanalitico/indicadores', component: PostIndicadoresComponent},
        {path:'postanalitico/config-indicadores', component: PosindicadoresComponent},
        {path:'posanalitico/reportes', component: ReportesPostComponent},

        {path:'mantenimiento-calibradores/equipos', component: EquiposComponent},
        {path:'mantenimiento-calibradores/mantenimiento-correctivo', component: MantenimientoCorrectivosComponent},
        {path:'mantenimiento-calibradores/mantenimiento-preventivo', component: MantenimientoPreventivoComponent},

        {path:'mantenimiento-calibradores/trazabilidad', component: TrazabilidadComponent},

        { path: '**', redirectTo: '', pathMatch: 'full' },
      ]
  }
];

@NgModule({

  imports: [RouterModule.forChild(pagesRoutes)],
  exports: [RouterModule]

})

export class PagesRouting { }

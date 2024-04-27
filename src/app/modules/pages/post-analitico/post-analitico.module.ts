import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
// material
import { MaterialModule } from '../../material/material.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CoreModule } from '@app/modules/core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import {AreasComponent} from './pages/configuraciones/areas/areas.component';
import {PostIndicadoresComponent} from './pages/configuraciones/post-indicadores/post-indicadores.component';
import { CriticosMedicoTratanteComponent } from './pages/posindicadores/criticos-medico-tratante/criticos-medico-tratante.component';
import { TiempoComunicarValoresCriticosComponent } from './pages/posindicadores/tiempo-comunicar-valores-criticos/tiempo-comunicar-valores-criticos.component';
import { TiempoRespuestaTroponinaComponent } from './pages/posindicadores/tiempo-respuesta-troponina/tiempo-respuesta-troponina.component';
import { TiempoLiberacionResultadosComponent } from './pages/posindicadores/tiempo-liberacion-resultados/tiempo-liberacion-resultados.component';
import { ServiciosLaboratorioClinicoComponent } from './pages/posindicadores/servicios-laboratorio-clinico/servicios-laboratorio-clinico.component';
import { ResultadoPacienteComponent } from './pages/posindicadores/resultado-paciente/resultado-paciente.component';
import { RecomendacionLaboratorioComponent } from './pages/posindicadores/recomendacion-laboratorio/recomendacion-laboratorio.component';
import { PrecisionResultadosComponent } from './pages/posindicadores/precision-resultados/precision-resultados.component';
import {PosindicadoresComponent} from './pages/posindicadores/posindicadores.component';
import { ReportesPostComponent } from './pages/reportes/reportes-post.component'
@NgModule({
  declarations: [
    AreasComponent,
    PostIndicadoresComponent,
    CriticosMedicoTratanteComponent,
    TiempoComunicarValoresCriticosComponent,
    TiempoRespuestaTroponinaComponent,
    TiempoLiberacionResultadosComponent,
    ServiciosLaboratorioClinicoComponent,
    ResultadoPacienteComponent,
    RecomendacionLaboratorioComponent,
    PrecisionResultadosComponent,
    PosindicadoresComponent,
    ReportesPostComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MaterialModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MatProgressSpinnerModule
  ],
  exports:[
    AreasComponent,
    PosindicadoresComponent,
    PostIndicadoresComponent,
    CriticosMedicoTratanteComponent,
    TiempoComunicarValoresCriticosComponent,
    TiempoRespuestaTroponinaComponent,
    TiempoLiberacionResultadosComponent,
    ServiciosLaboratorioClinicoComponent,
    ResultadoPacienteComponent,
    RecomendacionLaboratorioComponent,
    PrecisionResultadosComponent,
  ]
})
export class PostAnaliticoModule { }

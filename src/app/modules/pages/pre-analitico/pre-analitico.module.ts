import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaConfgComponent } from './pages/configuraciones/areas/area-confg.component';
import { IndicadoresConfgComponent } from './pages/configuraciones/indicadores/indicadores-confg.component';
import { TranslateModule } from '@ngx-translate/core';
// material
import { MaterialModule } from '../../material/material.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CoreModule } from '@app/modules/core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PrecisionIdentPacienteComponent } from './pages/indicadores/precision-ident-paciente/precision-ident-paciente.component';
import { AceptabilidadMuestrasLabComponent } from './pages/indicadores/aceptabilidad-muestras-lab/aceptabilidad-muestras-lab.component';
import { IndicadoresComponent } from './pages/indicadores/indicadores.component';
import { SatisfaccionDeMuestrasComponent } from './pages/indicadores/satisfaccion-de-muestras/satisfaccion-de-muestras.component';
import { ReportesPreComponent } from './pages/reportes/reportes-pre.component';
import { NgApexchartsModule } from 'ng-apexcharts';



@NgModule({
  declarations: [
    AreaConfgComponent,
    IndicadoresConfgComponent,
    PrecisionIdentPacienteComponent,
    AceptabilidadMuestrasLabComponent, 
    IndicadoresComponent, 
    SatisfaccionDeMuestrasComponent, 
    ReportesPreComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MaterialModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MatProgressSpinnerModule,
    NgApexchartsModule
  ],
  exports:[
    AreaConfgComponent,
    IndicadoresConfgComponent,
    PrecisionIdentPacienteComponent,
    AceptabilidadMuestrasLabComponent,
    SatisfaccionDeMuestrasComponent
  ]
})
export class PreAnaliticoModule { }

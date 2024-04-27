import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
// material
import { MaterialModule } from '../../material/material.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { CoreModule } from '@app/modules/core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { EquiposComponent} from './pages/equipos/equipos.component';
import { MantenimientoCorrectivosComponent } from './pages/mantenimiento-correctivos/mantenimiento-correctivos.component';
import { MantenimientoPreventivoComponent } from './pages/mantenimiento-preventivo/mantenimiento-preventivo.component'
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { TrazabilidadComponent } from './pages/trazabilidad/trazabilidad.component';
import { GraficosModule } from '@app/modules/graficos/graficos.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSelectModule } from 'ngx-select-ex';
import { UiSwitchModule } from 'ngx-toggle-switch';
@NgModule({
  declarations: [
    EquiposComponent,
    MantenimientoCorrectivosComponent,
    MantenimientoPreventivoComponent,
    TrazabilidadComponent,
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
    NgxMaterialTimepickerModule,
    MatAutocompleteModule,
    PdfViewerModule,

    SharedModule,
    UiSwitchModule,
    NgBootstrapFormValidationModule,
    NgbModule,
    ModalModule.forRoot(),
    NgxSelectModule,
    RoundProgressModule,
    GraficosModule,
  ],
  exports:[
    EquiposComponent,
    MantenimientoCorrectivosComponent,
    MantenimientoPreventivoComponent
  ]
})
export class mantenimietoCalibradoresModule { }

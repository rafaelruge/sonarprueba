import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { ErrorTotal1Component } from './error/error-total1/error-total1.component';
import { ErrorTotal2Component } from './error/error-total2/error-total2.component';
import { ErrorTotal3Component } from './error/error-total3/error-total3.component';
import { MultiComponent } from './multi/multi/multi.component';
import { YoudenComponent } from './youden/youden.component';
import { CualitativosNivelDosComponent } from './cualitativos-nivel-dos/cualitativos-nivel-dos.component';
import { CualitativosNivelTresComponent } from './cualitativos-nivel-tres/cualitativos-nivel-tres.component';
import { CualitativosNivelUnoComponent } from './cualitativos-nivel-uno/cualitativos-nivel-uno.component';
import { CoreModule } from '@app/modules/core/core.module';
import { MaterialModule } from '@app/modules/material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';



@NgModule({

  declarations: [

  ErrorTotal1Component,
  ErrorTotal2Component,
  ErrorTotal3Component,
  MultiComponent,
  YoudenComponent,
  CualitativosNivelUnoComponent,
  CualitativosNivelDosComponent,
  CualitativosNivelTresComponent,

],
  imports: [

    CommonModule,
    HttpClientModule,
    TranslateModule,
    CoreModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,

  ],
  exports: [
    ErrorTotal1Component,
    ErrorTotal2Component,
    ErrorTotal3Component,
    MultiComponent,
    YoudenComponent,
    CualitativosNivelUnoComponent,
    CualitativosNivelDosComponent,
    CualitativosNivelTresComponent,
  ]


})

export class GraficosModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login/login.component';
import { RestaurarcontrasenaComponent } from './restaurarcontrasena/restaurarcontrasena.component';
import { OlvidocontrasenaComponent } from './olvidocontrasena/olvidocontrasena.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({

  declarations: [LoginComponent, RestaurarcontrasenaComponent, OlvidocontrasenaComponent],

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoginRoutingModule,
    NgxSelectModule,
    NgBootstrapFormValidationModule,
    TranslateModule
  ],

  exports: [LoginComponent, RestaurarcontrasenaComponent, OlvidocontrasenaComponent],

})

export class LoginModule { }

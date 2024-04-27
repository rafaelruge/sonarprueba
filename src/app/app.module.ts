import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRouting } from './app.routing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { NgxSelectModule } from 'ngx-select-ex';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrModule } from 'ngx-toastr';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppConfig } from './services/config.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule} from '@angular/material/datepicker';;
import { MatNativeDateModule, MAT_DATE_FORMATS} from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS,MAT_MOMENT_DATE_FORMATS} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import { LoginModule } from './modules/login/login.module';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from './modules/shared/shared.module';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { ModalModule } from 'ngx-bootstrap/modal';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AppComponent,
  ],
  exports: [
    TranslateModule,
  ],
  imports: [
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BrowserModule,
    CommonModule,
    SharedModule,
    AppRouting,
    NgbModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    LoginModule,
    NgxSelectModule,
    NgBootstrapFormValidationModule.forRoot(),
    NgBootstrapFormValidationModule,
    ModalModule.forRoot(),
    DragDropModule,
    MatTooltipModule
  ],
  providers: [
    TranslateService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    JwtHelperService,
    AppConfig,
    DatePipe,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig],
      multi: true
    },
    { provide: MAT_DATE_LOCALE, useValue: 'es'},
    { provide: DateAdapter,
      useClass : MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

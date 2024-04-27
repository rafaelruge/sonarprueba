import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent
} from '@angular/common/http';
import { AppConfig } from './config.service';
import { UsuariosService } from './usuarios/usuarios.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';


@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  helper = new JwtHelperService();

  constructor(private userService: UsuariosService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {


    const token = this.userService.obtenerToken();

      if (!req.url.includes('/login')) {

        req = req.clone({
          setHeaders: { Authorization: 'Bearer ' + token }
        });
      }
      if (!req.url.includes('/assets/')) {
        req = req.clone({ setHeaders: { DBName: AppConfig.settings.dbname } });
        req = req.clone({ setHeaders: { Collection: AppConfig.settings.collection } });

        if (req.url.includes('qce')) {
          req = req.clone({ setHeaders: { Client: AppConfig.settings.bd_secundario } });
        } else {

          // if (sessionStorage.getItem('consultaSedeExterna') === '1') {

          // } else {
          //   req = req.clone({ setHeaders: { Client: AppConfig.settings.cliente } });
          // }

          if (sessionStorage.getItem('consultaSedeExterna') != '1' || sessionStorage.getItem('consultaSedeExterna') === null )
          {
            req = req.clone({ setHeaders: { Client: AppConfig.settings.cliente } });
          }
          if(sessionStorage.getItem('clientLogo') != "" && sessionStorage.getItem('clientLogo') != undefined && req.url.includes('/generalconfiguration/')){

            let cliente = sessionStorage.getItem('clientLogo')
            req = req.clone({ setHeaders: { Client: cliente } });

          }
        }
      }
      return next.handle(req);
  }
}

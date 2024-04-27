import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';
import { IAppConfig } from '@app/app-config';
import { DOCUMENT } from '@angular/common';


@Injectable()
export class AppConfig {
    static settings: IAppConfig;
    constructor(private http: HttpClient,@Inject(DOCUMENT) private document: Document) { }
    load() {
        const jsonFile = `${environment.configuracion}.json`;
        var urlActual = this.document.location.href.split("#")[0]
        return new Promise<void>((resolve, reject) => {
            this.http.get(jsonFile).toPromise().then((response: any) => {
                    var data:any[] = response
               var cliente:any = data.filter(datos => datos.sitio == urlActual)
               console.log("json",cliente);
                AppConfig.settings = cliente[0] as IAppConfig;
                resolve();
            }).catch((response: any) => {
                reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
            });
        });
    }
}

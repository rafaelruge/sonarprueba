import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class InfoResultQceService{

  private urlBase  : string = environment.apiUrl;

  constructor( private http: HttpClient ) { }

  getData( cliente: number,idsede:number, programa: number ): Observable<any>{
    
    let url = `${ this.urlBase }qce/resultqce/inforesultqce/${ cliente }/${idsede}/${ programa }`;

    return this.http.get( url );
    
  }

  getSamplesByClienteAndRound( cliente: number,idsede:number, programa: number, numeroRonda: number ){

    let url = `${ this.urlBase }qce/sampleqce/Listsamplesxround/${ cliente }/${idsede}/${ programa }/${ numeroRonda }`;

    return this.http.get( url );

  }

}

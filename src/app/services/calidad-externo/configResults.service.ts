import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})

export class ConfigResultsService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/ConfanalyteresultQce';
    
  }

  getResults( programa: number, analito: number ){

    let url = `${this.apiURL}/confanalyteresultfilter/${programa}/${analito}`;
    return this.http.get(url);

  }

  getIDProgramConf( programa: number, analito: number ){

    let url = `${this.apiURL}/filterprogramconf/${programa}/${analito}`;
    return this.http.get(url);

  }

  getProgramas(){

    let url = `${this.apiURL}/programsfilter`;
    return this.http.get(url);

  }

  getAnalitos(programa: number){

    let url = `${this.apiURL}/analytesfilter/${programa}`;
    return this.http.get(url);

  }

}

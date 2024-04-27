import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})

export class ResultQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/ResultQce';
  }

  //consulta configuracion de programa
  deleteresultxidprogramconf(idresult:number, idprogramconf:number): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.delete<any>(`${this.apiURL}/Deleteresultprogramconf/${idresult}/${idprogramconf}`,{ headers: reqHeaders }).toPromise();
  }
  
}

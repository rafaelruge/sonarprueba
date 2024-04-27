import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})

export class ProgramaConfQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/ProgramconfQce';
  }

    //consulta configuracion de programa
    getinfoConfigprogramid(entity: any): Promise<any> {
      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return this.httpClient.post<any>(`${this.apiURL}/programconfigid`,entity,{ headers: reqHeaders }).toPromise();
    }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})

export class ProgramConfQceDetailsService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/ProgramconfQce';
  }

  getProgramEsp( idx: any ){
    return this.http.get<any>(`${this.apiURL}/programconfqcedetails/especializado/${idx}`);
  }

  getListprogramasign( ){
    return this.http.get<any>(`${this.apiURL}/listasignprogram`);
  }

  getListprogramconf( ){
    return this.http.get<any>(`${this.apiURL}/programconfqcedetails`);
  }

  getInfoconfigprograma(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/Infoprogramconfig`, entity).toPromise();
  }

}

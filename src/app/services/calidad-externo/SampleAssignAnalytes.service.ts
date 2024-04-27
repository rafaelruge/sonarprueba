import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})

export class SampleAssignAnalytesQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/SampleAssignAnalytesQce';
  }

  buscarAnalitosQcexPrograma(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/detailsanalytesqce`, entity).toPromise();
  }

  AnalitosQcesinasignar(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/unassignedanalytes`, entity).toPromise();
  }

  buscarAnalitosPorProgramaMuestra(idProgram:any, idRound : any){
    return this.httpClient.get<any>(`${this.apiURL}/ConsultAssignedAnalytes/${idProgram}/${idRound}`).toPromise();
  }
}

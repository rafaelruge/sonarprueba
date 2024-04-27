import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class AnalitosQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/analytesQces';
  }

  public async getAllAsyncAnalytes(): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/analytesqcedetails`).toPromise();
  }
}

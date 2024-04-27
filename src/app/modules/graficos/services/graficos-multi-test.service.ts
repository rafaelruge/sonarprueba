import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '@app/Constants/constants';
import { environment } from '@environment/environment';
import * as dayjs from 'dayjs';
import { IngresoDatosCualitativoService } from '@app/services/configuracion/ingreso-datos-cualitativo.service';
import { Resultqualitative } from '@app/Models/Resultqualitative';


@Injectable({
  providedIn: 'root'
})
export class GraficosMultiTestService {
datosGraficos:any = []
idLote:number = 0
idTest:number = 0
  constructor(private http: HttpClient, private IDCL: IngresoDatosCualitativoService,) { }
}


import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ProgramConfClientHeaderqQceService } from '@app/services/calidad-externo/program-conf-client-headerq-qce.service';
import { RondasQceService } from '@app/services/configuracion/rondas-qce.service';
import { LotesQceService } from '@app/services/calidad-externo/lotsQce.service';
import { AnalytesQceService } from '@app/services/calidad-externo/AnalytesQce.service';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Canvas, Columns, Img, Line, PdfMakeWrapper, Stack, Txt } from 'pdfmake-wrapper';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-reporte-desempeno-cualitativo',
  templateUrl: './reporte-desempeno-cualitativo.component.html',
  styleUrls: ['./reporte-desempeno-cualitativo.component.css']
})
export class ReporteDesempenoCualitativoComponent implements OnInit {
  //predictivos
  filteredOptionsProgram: Observable<string[]>;
  listprogram: any = [];
  filteredOptionsRonda: Observable<string[]>;
  listRonda: any;
  filteredOptionsLote: Observable<string[]>;
  listLote: any;
  filteredOptionsAnalito: Observable<string[]>;
  listAnalito: any;

  rondas: any;

  formulario: FormGroup = this.fb.group({
    idProgram: ['', [Validators.required]],
    idRonda: ['', [Validators.required]],
    idLote: ['', [Validators.required]],
    idAnalito: [''],
  });
  analitos: any = [{
    Idanalytes: 1,
    Desanalytes:'Prueba'
  }];
  @ViewChild('scroll') scroll: ElementRef;


  analites: any = [];
  indexSelect = 0;
  verInfo: boolean = false;
  lotes: any;
  programaSeleccionado: any;
  rondaSeleccionada: any;
  loteSeleccionado: any;
  analytes: any;
  analitoSeleccionado: string;
  datosFiltro: any;
  itemSample: any = [];
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private translate: TranslateService,
    private programConfClientHeaderqQceService: ProgramConfClientHeaderqQceService,
    private rondasQceService: RondasQceService,
    private lotesQceService: LotesQceService,
    private analytesQceService: AnalytesQceService,
  ) { }

  ngOnInit(): void {
    this.getProgram();
  }


  private _filterProgramsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listprogram.filter(result =>  result.desprogram.toLowerCase().includes(filterValue));
  }

  private _filterRondasCreate(value: string): string[] {
    const filterValue = value;
    return this.rondas;
  }

  private _filterLotesCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.lotes.filter(result => result.numlot.includes(filterValue));
  }

  private _filterAnalitosCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.analitos.filter(result =>  result.desanalytes.includes(filterValue));
  }

  async getProgram() {
    await this.programConfClientHeaderqQceService.getProgramReportCuali().then(data => {

      this.listprogram = data;

      this.listprogram.sort((a: any, b: any) => {
        a.desprogram = a.desprogram.charAt(0) + a.desprogram.slice(1);
        b.desprogram = b.desprogram.charAt(0) + b.desprogram.slice(1);
      })

      this.listprogram.sort((a: any, b: any) => {
        if (a.desprogram < b.desprogram) return -1;
        if (a.desprogram > b.desprogram) return 1;
        return 0;
      })

      this.filteredOptionsProgram = this.formulario.get('idProgram').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterProgramsCreate(value)
        }),
      );
    }, _ => {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    });
  }


  selectRonda(programa) {
    this.programaSeleccionado = programa;
    this.rondasQceService.getRoundReportCuali(programa).then((datos: any) => {
      this.rondas = datos;
      this.filteredOptionsRonda = this.formulario.get('idRonda').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterRondasCreate(value)
        }),
      );
    }, _ => {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    });
  }


  selectLote(nroround) {
    this.rondaSeleccionada = nroround;
    this.lotesQceService.getLotReportCuali(Number(this.programaSeleccionado), nroround).then((datos: any) => {
      this.lotes = datos;
      this.filteredOptionsLote = this.formulario.get('idLote').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterLotesCreate(value)
        }),
      );
    }, _ => {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    });
  }

  selectAnalito(lote) {
    this.loteSeleccionado = lote;
    this.analytesQceService.getAnalytesReportCuali(Number(this.programaSeleccionado), this.rondaSeleccionada, lote).then((datos: any) => {
      this.analytes = datos;
      // this.filteredOptionsAnalito = this.formulario.get('idAnalito').valueChanges.pipe(
      //   startWith(''),
      //   map(value => {
      //     return this._filterAnalitosCreate(value)
      //   }),
      // );
    }, _ => {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    });
  }

  selectNone(control: string) {
    this.formulario.get(control).setValue('');
  }
  selectAll(control: string) {
    this.formulario.get(control).setValue(['-1']);
  }

  selectOne(control: string) {
    if (this.formulario.get(control).value[0] == '-1' || this.formulario.get(control).value[0] == '') {
      this.formulario.get(control).value.shift();
      this.formulario.get(control).setValue(this.formulario.get(control).value);
    }
  }

  get idProgramNoValido() {
    return this.formulario.get('idProgram');
  }
  get idRondaNoValido() {
    return this.formulario.get('idRonda');
  }
  get idLoteNoValido() {
    return this.formulario.get('idLote');
  }
  get idAnalitoNoValido() {
    return this.formulario.get('idAnalito');
  }



  buscar() {
    if (this.formulario.valid) {
      const obj =
      {
        "IdProgram": Number(this.programaSeleccionado),
        "NRound": Number(this.rondaSeleccionada),
        "IdLot": [ Number(this.loteSeleccionado) ],
        "IdAnalytes": this.formulario.value.idAnalito == "" ? [] : this.formulario.value.idAnalito
      }

      this.programConfClientHeaderqQceService.performanceReportCuali(obj).then(r => {
        if (r.analytesList.length > 0) {
          this.datosFiltro = r;
          this.itemSample = [];
          for (let item of this.datosFiltro.listResult) {
            this.itemSample.push(item.analiList);
          }

          for (let index = 0; index < this.datosFiltro.reactivoValueList.length; index++) {
            this.datosFiltro.reactivoValueList[index].tableSample = [];
            for (let j = 0; j < this.itemSample.length; j++) {
              this.datosFiltro.reactivoValueList[index].tableSample.push({ nameSample: '-', result: '-', c: '-' });
            }
          }

          for (let index = 0; index < this.itemSample.length; index++) {
            for (let j = 0; j < this.itemSample[index].length; j++) {
              if (this.itemSample[index][j] != undefined) {
                  let sample = this.datosFiltro.reactivoValueList.find(x => x.sample === this.itemSample[index][j].sample)
                  sample.tableSample.splice(index,1,this.itemSample[index][j]);
              }
            }
          }

          this.verInfo = true;
        } else {
          this.verInfo = false;
          this.toastr.info('No se encontraron resultados para esta búsqueda');
        }
      }).catch(err => {
        console.log(err)
        this.toastr.info('No se encontraron resultados para esta búsqueda');
      });
    } else {
      this.toastr.info('Debe ingresar los datos solicitados');
    }
  }

  pdfTodosAnalitos(){
    let tablaLabs:any[]=[];
    let tablaMuestras:any[]=[];
    let tablaGlobal:any[]=[];
    
    this.datosFiltro.listResult.map(x =>{
      console.log(x);
      const { idLab,idHeader,nameLab,conGlobal,deseGlobal} = x;
      tablaLabs.push({idLab,idHeader,nameLab});
      tablaGlobal.push({conGlobal,deseGlobal});
    })
    this.datosFiltro.reactivoValueList.map(x =>{
      const { tableSample} = x;
      console.log(x);
      tablaMuestras.push(tableSample);
    })
  }

  //------------------------
  scrollCards(flow: number): void {
    this.scroll.nativeElement.scrollLeft += (136.1 * flow);
  }

 buscarAnalitos(_analito: string, btnSecc: any, i:any) {
   this.analitoSeleccionado = _analito;
   this.indexSelect = Number(i);
  //  console.log(_analito);
 }

}

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import { MethodsQceService } from '@app/services/calidad-externo/MethodsQce.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { ReactivosQceService } from '@app/services/calidad-externo/reactivos-qce.service';
import { LotesQceDetailsService } from '@app/services/calidad-externo/lotsQceDetails.service';
import { ConfigResultsService } from '@app/services/calidad-externo/configResults.service';
import { AssignValuesExpectedCualiQceService } from '@app/services/calidad-externo/assign-values-expected-cuali-qce.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { ValorEsperadoService } from '../../../../../services/calidad-interno/valor-espertado.service';
import { DatePipe } from '@angular/common';
import { createLog } from "../../../../../globals/logUser";
@Component({
  selector: 'app-asignacion-valor-esperado-cualitativo',
  templateUrl: './asignacion-valor-esperado-cualitativo.component.html',
  styleUrls: ['./asignacion-valor-esperado-cualitativo.component.css']
})
export class AsignacionValorEsperadoCualitativoComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['analito', 'equipo', 'reactivo','metodo', 'unidades', 'valor','editar','estado'];
  dataSource: MatTableDataSource<any>;
  analizador = new FormControl('');
  metodo = new FormControl('');
  unidades = new FormControl('');
  ventanaModal!: BsModalRef;

  formaBuscarDatos = this.fb.group({
    lote: ['', [Validators.required]],
    programa: ['', [Validators.required]],
  });

  formCrearEditar = this.fb.group({
    idAssignValuesExpectedCuali: ['', []],
    idAnalytes: ['', [Validators.required]],
    idAnalyzer: ['', [Validators.required]],
    idReagents: ['', [Validators.required]],
    idMethods: ['', [Validators.required]],
    idUnits: ['', [Validators.required]],
    idResultsDictionary: ['', [Validators.required]],
    active: [true, []],
  });

  lotes: any;
  listaProgramas: any;
  analyzers: any;
  analitos: any[] = [];
  resultadosEsperados: any[] = [];
  methods: any;
  methodsActive: any;
  listaUnits: any;
  reactivos: any;

  verTabla: boolean = false;
  flagEditar: boolean = false;
  Loguser: any;
  log = new createLog(this.datePipe,this.translate,this.assignValuesExpectedCualiQceService);

  constructor(
    private datePipe: DatePipe,
    private assignValuesExpectedCualiQceService: AssignValuesExpectedCualiQceService,
    private configResultsService: ConfigResultsService,
    private unitsQceService: UnitsQceService,
    private reactivosQceService:ReactivosQceService,
    private methodsQceService: MethodsQceService,
    private lotesQceDetailsService: LotesQceDetailsService,
    private analyzerQceService: AnalyzerQceService,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private valorEsperadoService: ValorEsperadoService,
    private translate: TranslateService,
    private analitosService: AnalitosService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private modalService: BsModalService,

  ) { }

  ngOnInit(): void {
    this.sharedService.customTextPaginator(this.paginator);
    this.getLotes()
  }

  getAnalitosPorPrograma(event:any) {
    this.verTabla = false;
    this.analitosService.getAnalitosPorProgramaCualitativo(event.value).subscribe(x=>{
      this.analitos = x ;
    },e =>{
      this.toastr.error('No se encontraron analitos relacionados al programa');
    })
  }

  getValorEsperado(idprogram:number,idanalyte:number) {
    this.valorEsperadoService.valorEsperadoCualitativo(idprogram,idanalyte)
        .subscribe((x:any) =>{
          this.resultadosEsperados = x ;
        },e =>{
          this.resultadosEsperados = [] ;
          this.toastr.error('No se encontraron "Valores Esperados" relacionados al analito');
        })
  }

  getLotes() {
    this.lotesQceDetailsService.getAllAsync().then(r => {
      this.lotes = r;
      this.consultarProgramas();
    });
  }


  consultarProgramas() {
    this.programConfQceDetailsService.getProgramEsp("C").toPromise()
      .then(r => {
        this.listaProgramas = r;
        this.getAnalizadores();
      });
  }

  getAnalizadores() {
    this.analyzerQceService.getAllAsync().then((equipos: any) => {
      this.analyzers = equipos;
      this.getReactivos();
    });
  }

  async getReactivos() {
    await this.reactivosQceService.getAllAsync().then(r => {
      this.reactivos = r.filter(e => e.active);
      this.getMethods();
    });
  }

  async getMethods() {
    this.methods = await this.methodsQceService.getAllAsync();
    this.methodsActive = this.methods.filter(e => e.active);
    this.consultarUnits();
  }

  consultarUnits() {
    this.unitsQceService.getAllAsync().then(respuesta => {
      this.listaUnits = respuesta.filter(datos => datos.active == true);
    });
  }

  selectOne(idx, row, item?) {
    switch (idx) {
      case 1:
        row.idAnalyzer = Number(item.target.value);
        break;
      case 2:
        row.idReagents = Number(item.target.value);
        break;
      case 3:
        row.idMethods = Number(item.target.value);
        break;
      case 4:
        row.idUnits = Number(item.target.value);
        break;
      case 5:
        row.idResultsDictionary = Number(item.target.value);
        break;
    }
  }


  buscar() {
    if (this.formaBuscarDatos.valid) {
      this.assignValuesExpectedCualiQceService.getAssignValuesExpected(this.formaBuscarDatos.value.lote,this.formaBuscarDatos.value.programa).toPromise()
        .then(r => {
          console.log(r);

          this.verTabla = true;
          this.generarData(r);
        })
        .catch(err => {
          this.toastr.error('No hay datos registrados');
          this.verTabla = true;
        });

    } else {
      this.toastr.error('Debe diligenciar los campos completamente.');
      this.formaBuscarDatos.markAllAsTouched();
    }
  }

  organizarDataEditarOCrear():any{
    const {
        idAssignValuesExpectedCuali,
        idResultsDictionary,
        idAnalytes,
        idAnalyzer,
        idMethods,
        idUnits,
        idReagents,
        active } = this.formCrearEditar.value;
    const {lote,programa } =this.formaBuscarDatos.value;
    const newObj = {
      idAssignValuesExpectedCuali,
      idResultsDictionary,
      id_Lot:lote,
      idProgram:programa,
      idAnalytes,
      idAnalyzer,
      idMethods,
      idUnits,
      idReagents,
      active
    }
    return newObj ;
  }

  detailObj() {
    const newObj = this.organizarDataEditarOCrear();
    let lote = this.lotes.find(x => x.IdLot == newObj.id_Lot);
    let programa = this.listaProgramas.find(x => x.IdProgram = newObj.idProgram);
    let analito = this.analitos.find(x => x.idanalytes == newObj.idAnalytes)
    let analizador = this.analyzers.find(x => x.idAnalyzer == newObj.idAnalyzer);
    let reactivo = this.reactivos.find(x => x.idreagents == newObj.idReagents);
    let metodo = this.methodsActive.find(x => x.idmethods == newObj.idMethods);
    let unidades = this.listaUnits.find(x => x.idunits == newObj.idUnits);
    let obj = {
      Lote: lote.Numlot,
      Program:programa.Desprogram,
      Analytes:analito.desanalytes,
      Analyzer:analizador.nameAnalyzer,
      Methods:metodo.desmethods,
      Units:unidades.codunits,
      Reagents:reactivo.desreagents,
      valueExpected:this.formCrearEditar.value.valueExpected,
      active:this.formCrearEditar.value.active
    }
    return obj;
  }

  crearAsignacion() {
    const newObj = this.organizarDataEditarOCrear();
    if(this.formCrearEditar.invalid){
      this.formCrearEditar.markAllAsTouched();
      return
    }
    this.assignValuesExpectedCualiQceService.createAssignValuesExpected(newObj).then(r => {
      this.toastr.success('Asignación valore esperado generado correctamente.');
      this.log.logObj('Control Calidad Externo','Administración','Asignación de valor esperado cualitativo','c',this.detailObj(),JSON.stringify(r),200);
      this.buscar()
      this.formCrearEditar.reset({active:true});
      this.closeVentana();
    })
    .catch(error => {
      this.toastr.error(error.error);
      this.log.logObj('Control Calidad Externo','Administración','Asignación de valor esperado cualitativo','c',this.detailObj(),error.message,error.status);
      this.formCrearEditar.reset({active:true});
      this.closeVentana();
    });
  }

  async editarData(idAssignValuesExpectedCuali: number, newObj: any) {
    return this.assignValuesExpectedCualiQceService.updateAssignValuesExpected(idAssignValuesExpectedCuali,newObj)
    .then(r => {
      this.toastr.success('Datos actualizados correctamente.');
      this.log.logObj('Control Calidad Externo','Administración','Asignación de valor esperado cualitativo','a',this.detailObj(),JSON.stringify(r),200);
      this.generarData(r);
      this.formCrearEditar.reset({active:true});
      this.closeVentana();
    })
    .catch(error => {
      this.toastr.error(error.error);
      this.log.logObj('Control Calidad Externo','Administración','Asignación de valor esperado cualitativo','a',this.detailObj(),error.message,error.status);
      this.formCrearEditar.reset({active:true});
      this.closeVentana();
    });
  }

  async editar(idAssignValuesExpectedCuali:number) {
    const newObj = this.organizarDataEditarOCrear();
    await this.editarData(idAssignValuesExpectedCuali,newObj);
  }

  async editarToggle(event:any,row:any){
    row.active = !row.active;
    await this.editarData(row.idAssignValuesExpectedCuali,row);
  }

  private generarData(r) {
    this.verTabla = true;
    this.dataSource = new MatTableDataSource(r);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cancelarAsig() {
    this.verTabla = false;
    this.formaBuscarDatos.reset({active:true});
    this.dataSource = new MatTableDataSource();
  }

  async modalCrear(templateRegistroRondasQce: TemplateRef<any>) {
    this.ventanaModal = this.modalService.show(templateRegistroRondasQce, { 'class': 'modal-lg modal-dialog-centered', backdrop: 'static', keyboard: false });
  }

  async modalEditar(templateRegistroConfEdit: TemplateRef<any>, datos: any) {
    this.flagEditar = true;
    const newObj = {
      idResultsDictionary:datos.idResultsDictionary,
      idAnalytes:datos.idAnalytes,
      idAnalyzer:datos.idAnalyzer,
      idMethods:datos.idMethods,
      idUnits:datos.idUnits,
      idReagents:datos.idReagents,
      idAssignValuesExpectedCuali:datos.idAssignValuesExpectedCuali,
      active:datos.active
    }
    this.formCrearEditar.setValue(newObj);
    this.getValorEsperado(datos.idProgram,newObj.idAnalytes);
    this.ventanaModal = this.modalService.show(templateRegistroConfEdit, { 'class': 'modal-lg modal-dialog-centered', backdrop: 'static', keyboard: false });
  }

  closeVentana(): void {
    this.flagEditar = false;
    if(this.ventanaModal){
      this.ventanaModal.hide();
    }
  }


}


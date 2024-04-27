import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { LotesQceDetailsService } from '@app/services/calidad-externo/lotsQceDetails.service';
import { AssignValuesExpectedQceService } from '@app/services/calidad-externo/assign-values-expected-qce.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { ConfiguracionEstadisticaService } from '@app/services/calidad-externo/configuracion-estadistica.service';
import { createLog } from '@app/globals/logUser';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { MethodsQceService } from '@app/services/calidad-externo/MethodsQce.service';
import { log } from 'console';
@Component({
  selector: 'app-configuracion-estadisticas',
  templateUrl: './configuracion-estadisticas.component.html',
  styleUrls: ['./configuracion-estadisticas.component.css']
})
export class ConfiguracionEstadisticasComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['analito', 'equipo', 'metodo', 'unidad', 'media', 'desviacion','total','editar','estado'];
  dataSource: MatTableDataSource<any>;

  ventanaModal!: BsModalRef;

  formaBuscarDatos = this.fb.group({
    lote: ['', [Validators.required]],
    programa: ['', [Validators.required]],
  });

  formCrearEditar = this.fb.group({
    idGeneralStatisticalValues: [0, []],
    idProgram: [, []],
    idLot: [, []],
    idAnalytes: ['', [Validators.required]],
    totalData: [, [Validators.required]],
    average: [, [Validators.required]],
    ds: [, [Validators.required]],
    Measuringsystem: [, []],
    active: [true, []],
    idAnalyzer:[, [Validators.required]],
    idunits:[, [Validators.required]],
    idMethods:[, [Validators.required]]
  });


  lotes: any;
  listaProgramas: any;
  analitos: any[] = [];
  listaUnidades: any[] = [];
  listaUnits: any;
  analyzers: any;
  methods: any;
  methodsActive: any;

  verTabla: boolean = false;
  flagEditar: boolean = false;
  log = new createLog(this.datePipe,this.translate,this.configuracionEstadisticaService);

  constructor(
    private configuracionEstadisticaService:ConfiguracionEstadisticaService,
    private lotesQceDetailsService: LotesQceDetailsService,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private analitosService: AnalitosService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
    private modalService: BsModalService,
    private analyzerQceService: AnalyzerQceService,
    private methodsQceService: MethodsQceService,
    private unitsQceService: UnitsQceService,
  ) { }

  ngOnInit(): void {
    this.sharedService.customTextPaginator(this.paginator);
    this.getLotes();
    this.getAnalizadores();
    this.getMethods();
    this.getUnidades();
  }

  get obtenerAccion(){
    return this.formCrearEditar.get('Measuringsystem').value;
  }


  estadosFormulario(campos:string[],validators:any[]){
    this.formCrearEditar.controls[campos[0]].setValidators(validators[0]);
    this.formCrearEditar.controls[campos[0]].clearValidators();
    this.formCrearEditar.controls[campos[0]].updateValueAndValidity();

    this.formCrearEditar.controls[campos[1]].clearValidators();
    this.formCrearEditar.controls[campos[1]].setValidators(validators[1]);
    this.formCrearEditar.controls[campos[1]].updateValueAndValidity();
  }



  cambiarEstadoforms(value:string,idGeneralStatisticalValues:number=0){
    this.formCrearEditar.reset({active:true,idGeneralStatisticalValues,Measuringsystem:value});
    switch (value) {
      case "M":
        this.estadosFormulario(['idAnalyzer','idMethods'],[Validators.nullValidator,Validators.required]);
        break;
      case "T":
        this.estadosFormulario(['idAnalyzer','idMethods'],[Validators.nullValidator,Validators.nullValidator]);
        break;
      default:
        this.estadosFormulario(['idAnalyzer','idMethods'],[Validators.required,Validators.required]);
        break;
    }
  }

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getUnidades(){
    this.unitsQceService.unidadesList().then(x =>{
      this.listaUnidades = x ;
    })
  }

  getAnalitosPorPrograma(event:any) {
    this.verTabla = false;
    this.analitosService.getAnalitosPorPrograma(event.value).subscribe(x=>{
      this.analitos = x ;
    },e =>{
      this.toastr.error('No se encontraron analitos relacionados al programa');
    })
  }

  getLotes() {
    this.lotesQceDetailsService.getAllAsync().then(r => {
      this.lotes = r;
      this.consultarProgramas();
    });
  }


  consultarProgramas() {
    this.programConfQceDetailsService.getProgramEsp("N").toPromise().then(r => this.listaProgramas = r);
  }

  buscar() {
    if (this.formaBuscarDatos.valid) {
      this.configuracionEstadisticaService
        .getConfiguracionesEstadisticas(this.formaBuscarDatos.value.programa,this.formaBuscarDatos.value.lote).toPromise()
        .then(r => {
          if(!r){
            this.toastr.error('No hay datos registrados');
          }
          this.verTabla = true;
          this.generarData(r);
        })
        .catch(err => {
          this.toastr.error('No hay datos registrados');
          this.verTabla = true;
        });

    } else {
      this.toastr.error('Debe diligenciar todos los campos.');
      this.formaBuscarDatos.markAllAsTouched();
    }
  }



  organizarDataEditarOCrear():any{
    const {
        idGeneralStatisticalValues,
        idAnalytes,
        totalData,
        average,
        ds,
        active,
        Measuringsystem,
        idAnalyzer,
        idMethods,
        idunits } = this.formCrearEditar.value;
    const {lote,programa } =this.formaBuscarDatos.value;
    const newObj = {
      idGeneralStatisticalValues,
      idProgram:programa,
      idLot:lote,
      idAnalytes:idAnalytes,
      totalData,
      average,
      ds,
      active,
      Measuringsystem,
      idAnalyzer:idAnalyzer,
      idMethods:idMethods,
      idunits
    }
    return newObj ;
  }


  detailObj() {
    let lote = this.lotes.find(x => x.IdLot == this.formaBuscarDatos.value.lote);
    let programa = this.listaProgramas.find(x => x.IdProgram == this.formaBuscarDatos.value.programa);
    let analito = this.analitos.find( x => x.idanalytes == this.formCrearEditar.value.idAnalytes);
    let data = {
      Analytes: analito?.desanalytes,
      average: this.formCrearEditar.value.average,
      ds: this.formCrearEditar.value.ds,
      totalData: this.formCrearEditar.value.totalData,
      estado: this.formCrearEditar.value.active,
      Measuringsystem: this.formCrearEditar.value.Measuringsystem,
      idAnalyzer: this.formCrearEditar.value.idAnalyzer,
      idMethods: this.formCrearEditar.value.idMethods,
      idunits: this.formCrearEditar.value.idunits
    }
    let obj = {
      Lote: lote.Numlot,
      Programa: programa.Desprogram,
      tabla: data
    }

    return obj;
  }

  crearAsignacion() {
    this.detailObj();
    const newObj = this.organizarDataEditarOCrear();
    if(this.formCrearEditar.invalid){
      this.toastr.error('Por favor diligencie todos los datos')
      this.formCrearEditar.markAllAsTouched();
      return
    }
    this.configuracionEstadisticaService.createConfiguracionesEstadisticas(newObj).then(r => {
      this.toastr.success('Asignación valore esperado generado correctamente.');
      this.log.logObj('Control Calidad Externo','Administración','Configuración estadísticas','c',this.detailObj(),JSON.stringify(r),200);
      this.buscar();
      this.formCrearEditar.reset({active:true,idGeneralStatisticalValues:0,Measuringsystem:'EM'});
      this.closeVentana();
    })
    .catch(err => {
      this.toastr.error(err.error);
      this.log.logObj('Control Calidad Externo','Administración','Configuración estadísticas','c',this.detailObj(),err.message,err.status);
      // this.formCrearEditar.reset({active:true,idGeneralStatisticalValues:0,Measuringsystem:'EM'});
      // this.closeVentana();
    });
  }

  async editarData(idGeneralStatisticalValues:number,newObj:any,pasaInvalido:boolean=false){
    if(!pasaInvalido){
      if(this.formCrearEditar.invalid){
        this.formCrearEditar.markAllAsTouched();
        return
      }
    }
    return this.configuracionEstadisticaService.updateConfiguracionesEstadisticas(idGeneralStatisticalValues,newObj)
    .then(r => {
      this.toastr.success('Datos actualizados correctamente.');
      this.log.logObj('Control Calidad Externo','Administración','Configuración estadísticas','a',this.detailObj(),JSON.stringify(r),200);
      this.buscar();
      this.formCrearEditar.reset({active:true});
      this.closeVentana();
    })
    .catch(err => {
      this.toastr.error(err.error);
      this.log.logObj('Control Calidad Externo','Administración','Configuración estadísticas','a',this.detailObj(),err.message,err.status);
      this.formCrearEditar.reset({active:true});
      this.closeVentana();
    });
  }

  async editar(idGeneralStatisticalValues:number) {
    const newObj = this.organizarDataEditarOCrear();
    await this.editarData(idGeneralStatisticalValues,newObj);
  }

  async editarToggle(event:any,row:any){
    row.active = !row.active;
    await this.editarData(row.idGeneralStatisticalValues,row,true);
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
    this.formCrearEditar.reset({active:true,idGeneralStatisticalValues:0,Measuringsystem:'EM'});
    this.ventanaModal = this.modalService.show(templateRegistroRondasQce, { 'class': 'modal-lg modal-dialog-centered', backdrop: 'static', keyboard: false });
  }

  async modalEditar(templateRegistroConfEdit: TemplateRef<any>, datos: any) {
    this.flagEditar = true;
    const newObj = {
      idGeneralStatisticalValues:datos.idGeneralStatisticalValues,
      idLot:datos.idLot,
      idProgram:datos.idProgram,
      idAnalytes:datos.idAnalytes,
      totalData:datos.totalData,
      average:datos.average,
      ds:datos.ds,
      active:datos.active,
      Measuringsystem:datos.measuringsystem,
      idAnalyzer:datos.idAnalyzer,
      idMethods:datos.idMethods,
      idunits: datos.idunits
    }
    this.formCrearEditar.setValue(newObj);
    this.ventanaModal = this.modalService.show(templateRegistroConfEdit, { 'class': 'modal-lg modal-dialog-centered', backdrop: 'static', keyboard: false });
  }

  async getMethods() {
    this.methods = await this.methodsQceService.getAllAsync();
    this.methodsActive = this.methods.filter(e => e.active);
  }

  getAnalizadores() {
    this.analyzerQceService.getAllAsync().then((equipos: any) => {
      this.analyzers = equipos;
    });
  }

  closeVentana(): void {
    this.flagEditar = false;
    if(this.ventanaModal){
      this.ventanaModal.hide();
    }
  }
}

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
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { createLog } from "../../../../../globals/logUser";


@Component({
  selector: 'app-asignacion-valor-esperado-2',
  templateUrl: './asignacion-valor-esperado-2.component.html',
  styleUrls: ['./asignacion-valor-esperado-2.component.css']
})
export class AsignacionValorEsperado2Component implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['analito', 'unidades', 'valor','editar','estado'];
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
    idExpectedValueQuantitativeReport: [0, []],
    idAnalytes: ['', [Validators.required]],
    idUnits: ['', [Validators.required]],
    expectedvalue: ['', [Validators.required]],
    idLot: [, []],
    idprogram: [, []],
    active: [true, []],
  });


  lotes: any;
  listaProgramas: any;
  analyzers: any;
  analitos: any[] = [];
  methods: any;
  methodsActive: any;
  listaUnits: any;
  reactivos: any;

  verTabla: boolean = false;
  flagEditar: boolean = false;

  Loguser: any;
  log = new createLog(this.datePipe,this.translate,this.assignValuesExpectedQceService);

  constructor(
    private datePipe: DatePipe,
    private translate: TranslateService,
    private assignValuesExpectedQceService: AssignValuesExpectedQceService,
    private unitsQceService: UnitsQceService,
    private lotesQceDetailsService: LotesQceDetailsService,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private analitosService: AnalitosService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private modalService: BsModalService,
  ) { }

  ngOnInit(): void {
    this.sharedService.customTextPaginator(this.paginator);
    this.getLotes();
  }

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
    this.programConfQceDetailsService.getProgramEsp("N").toPromise().then(r => {
      this.listaProgramas = r;
      this.consultarUnits();
    });
  }

  consultarUnits() {
    this.unitsQceService.getAllAsync().then(respuesta => {
      this.listaUnits = respuesta.filter(datos => datos.active == true);
    });
  }

  buscar() {
    if (this.formaBuscarDatos.valid) {
      this.assignValuesExpectedQceService
        .getAssignValuesExpected2(this.formaBuscarDatos.value.lote,this.formaBuscarDatos.value.programa).toPromise()
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
        idExpectedValueQuantitativeReport,
        idAnalytes,
        idUnits,
        expectedvalue,
        active } = this.formCrearEditar.value;
    const {lote,programa } =this.formaBuscarDatos.value;
    const newObj = {
      idExpectedValueQuantitativeReport,
      idLot:lote,
      idprogram:programa,
      idAnalytes:idAnalytes,
      idUnits,
      expectedvalue,
      active
    }
    return newObj ;
  }

  detailObj() {
    const newObj = this.organizarDataEditarOCrear();
    let lote = this.lotes.find(x => x.IdLot == newObj.id_Lot);
    let programa = this.listaProgramas.find(x => x.IdProgram = newObj.idProgram);
    let analito = this.analitos.find(x => x.idanalytes == newObj.idAnalytes)
    let unidades = this.listaUnits.find(x => x.idunits == newObj.idUnits);
    let obj = {
      Lote: lote.Numlot,
      Program:programa.Desprogram,
      Analytes:analito.desanalytes,
      Units:unidades.codunits,
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
    this.assignValuesExpectedQceService.createAssignValuesExpected2(newObj).then(r => {
      this.toastr.success('Asignación valor esperado generado correctamente.');
      this.log.logObj('Control Calidad Externo','Administración','Asignación de valor esperado 2','c',this.detailObj(),JSON.stringify(r),200);
      this.buscar();
      this.formCrearEditar.reset({active:true});
      this.closeVentana();
    })
    .catch(error => {
      this.toastr.error(error.error);
      this.log.logObj('Control Calidad Externo','Administración','Asignación de valor esperado 2','c',this.detailObj(),error.message,error.status);
      this.formCrearEditar.reset({active:true});
      this.closeVentana();
    });
  }

  async editarData(idExpectedValueQuantitativeReport:number,newObj:any,pasaInvalido:boolean=false){
    if(!pasaInvalido){
      if(this.formCrearEditar.invalid){
        this.formCrearEditar.markAllAsTouched();
        return
      }
    }
    return this.assignValuesExpectedQceService.updateAssignValuesExpected2(idExpectedValueQuantitativeReport,newObj)
    .then(r => {
      this.toastr.success('Datos actualizados correctamente.');
      this.log.logObj('Control Calidad Externo','Administración','Asignación de valor esperado 2','a',this.detailObj(),JSON.stringify(r),200);
      this.buscar();
      this.formCrearEditar.reset({active:true});
      this.closeVentana();
    })
    .catch(error => {
      this.toastr.error(error.error);
      this.log.logObj('Control Calidad Externo','Administración','Asignación de valor esperado 2','a',this.detailObj(),error.message,error.status);
      this.formCrearEditar.reset({active:true});
      this.closeVentana();
    });
  }

  async editar(idExpectedValueQuantitativeReport:number) {
    const newObj = this.organizarDataEditarOCrear();
    await this.editarData(idExpectedValueQuantitativeReport,newObj);
  }

  async editarToggle(event:any,row:any){
    row.active = !row.active;
    await this.editarData(row.idExpectedValueQuantitativeReport,row,true);
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
    this.formCrearEditar.reset({active:true});
    this.ventanaModal = this.modalService.show(templateRegistroRondasQce, { 'class': 'modal-lg modal-dialog-centered', backdrop: 'static', keyboard: false });
  }

  async modalEditar(templateRegistroConfEdit: TemplateRef<any>, datos: any) {
    this.flagEditar = true;
    const newObj = {
      idExpectedValueQuantitativeReport:datos.idExpectedValueQuantitativeReport,
      idLot:datos.idLot,
      idprogram:datos.idProgram,
      idAnalytes:datos.idAnalytes,
      idUnits:datos.idUnits,
      expectedvalue:datos.expectedValue,
      active:datos.active
    }
    this.formCrearEditar.setValue(newObj);
    this.ventanaModal = this.modalService.show(templateRegistroConfEdit, { 'class': 'modal-lg modal-dialog-centered', backdrop: 'static', keyboard: false });
  }

  closeVentana(): void {
    this.flagEditar = false;
    if(this.ventanaModal){
      this.ventanaModal.hide();
    }
  }


}


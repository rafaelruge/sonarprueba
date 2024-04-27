import { InfoResultQceService } from '@app/services/calidad-externo/inforesultQce.service';
import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { PublicService } from '@app/services/public.service';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import { ProgramConfClientHeaderqQceService } from '@app/services/calidad-externo/program-conf-client-headerq-qce.service';
import { MethodsQceService } from '@app/services/calidad-externo/MethodsQce.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import { ReactivosQceService } from '@app/services/calidad-externo/reactivos-qce.service';
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators';
import $ from 'jquery';
import { createLog } from '@app/globals/logUser';
import { HttpErrorResponse } from '@angular/common/http';
import { ResultQceService } from '@app/services/calidad-externo/resultQce.service';
import { ProgramaConfQceService } from '@app/services/calidad-externo/ProgramconfQce.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-asignacion-programas',
  templateUrl: './asignacion-programas.component.html',
  styleUrls: ['./asignacion-programas.component.css']
})
export class AsignacionProgramasComponent implements OnInit {
  updateReason = new FormControl();

  fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  dateNow: Date = new Date();
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  desactivar = false;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  //predictivos create
  filteredOptionsLotsCreate: Observable<string[]>;
  listlotscreate: any;
  //predictivo edit
  idlotpr: number;
  deslotpr: any;
  listalotpre: any;
  analizador = new FormControl('');
  metodo = new FormControl('');
  unidades = new FormControl('');
  existeasign: any;

  formaBuscarDatos = this.fb.group({

    cliente: ['', [Validators.required]],
    sede: ['', [Validators.required]],
    programa: ['', [Validators.required]]

  });

  dateNowISO = this.dateNow.toTimeString();
  clientes: any;
  sedes: any;
  sedesActive: any;
  listaProgramas: any;
  verTabla: boolean = false;
  analyzers: any;
  methods: any;
  methodsActive: any;
  listaUnits: any;
  programSelected: any;
  sedeSeleccionada: any;
  clienteSeleccionado: any;
  arrProgram: any = [];
  consultaSedeExterna = 0;
  isCuanti = false;
  reactivos: any;
  desprogramconfig: string;
  buttonClicked = false;

  log = new createLog(this.datePipe, this.translate, this.programConfClientHeaderqQceService);

  @ViewChild('Toogle') Toogle!: ElementRef;


  constructor(
    private reactivosQceService: ReactivosQceService,
    private unitsQceService: UnitsQceService,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private methodsQceService: MethodsQceService,
    private analyzerQceService: AnalyzerQceService,
    private programConfClientHeaderqQceService: ProgramConfClientHeaderqQceService,
    private programaQceService: ProgramaQceService,
    private publicService: PublicService,
    private clientesService: ClientesService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private resultQceService: ResultQceService,
    private infoResultQceService: InfoResultQceService,
    private ProgramaConfQceService: ProgramaConfQceService,
    private spinner: NgxSpinnerService

  ) { }

  displayedColumns: string[] = ['analito', 'equipo', 'reactivo', 'metodo', 'unidades', 'active'];
  dataSource: MatTableDataSource<any>;
  dataSourceconfig: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.sharedService.customTextPaginator(this.paginator);
    this.cargarClientes();
    sessionStorage.setItem('consultaSedeExterna', '0');
  }

  async cargarClientes() {
    this.clientes = await this.clientesService.getAllAsync();
    this.getAnalizadores();
  }

  async cargarSedes(dataClient) {
    sessionStorage.setItem('consultaSedeExterna', '1');
    await this.publicService.obtenerSedesAsigProg(this.clienteSeleccionado.header).then(r => {
      this.sedesActive = r.filter(e => e.active);
      this.consultarProgramas();
      sessionStorage.setItem('consultaSedeExterna', '0');
    });
  }

  consultarProgramas() {
    this.programConfQceDetailsService.getListprogramasign().toPromise().then(r => {
      this.listaProgramas = r;
    });

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
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


  selectFilter(idx, data) {
    switch (idx) {
      case 1:
        this.clienteSeleccionado = data;
        this.cargarSedes(data);
        break;
      case 2:
        this.sedeSeleccionada = data;
        break;
      case 3:
        this.programSelected = data;
        break;
    }
  }



  selectOne(idx, data, item?) {
    switch (idx) {
      case 1:
        data.id_Analyzer = Number(item.target.value);
        break;
      case 2:
        data.idReagents = Number(item.target.value);
        break;
      case 3:
        data.idMethod = Number(item.target.value);
        break;
      case 4:
        data.idUnit = Number(item.target.value);
        break;
      case 5:
        const estado = data.active ? false : true;
        data.active = estado;

        this.EstadoAnalito(data, estado, item);

        break;
    }
  }

  EstadoAnalito(data: any, estado: any, idx: any) {

    // data = { idProgramConfClientHeadq: data.idProgramConfClientHeadq, idClient: data.idClient, idHeadQuarterClientQCE: data.idHeadQuarterClientQCE,idMethod:data.idMethod, idProgram: data.idProgram, idReagents: data.idReagents, idUnit: data.idUnit, id_Analyzer:data.id_Analyzer,Active: estado }

    // if(estado === false){
    //   this.toastr.info( 'Al desactivar el analito, no se asignará dentro del programa.');
    // }

    // this.programConfClientHeaderqQceService.update(data, data.idProgramConfClientHeadq).subscribe(respuesta => {

    //   this.buscar();
    //   this.spinner.show();
    //   this.toastr.success( 'Estado de configuración actualizado!.');
    //   this.accion = 'Editar';

    // });


    let posicion = this.dataSourceconfig.filteredData.indexOf(data);
    let posicionTablaArriba = this.dataSource.filteredData[posicion]



    if (estado == false) {

      this.infoResultQceService.getData(data.idClient, this.sedeSeleccionada.idheadquarters, data.idProgram).subscribe(r => {


        let found: any;
        if (r && r.length) {
          found = r.find((e: any) => e.IdProgramConf == posicionTablaArriba.IdProgramconf && e.Result)
          if (found) {
            this.toastr.error('No se puede desactivar el analito porque ya contiene resultados.');
            const activeColumnElement = document.getElementById(String(idx));
            data.active = true;
            if (activeColumnElement) {
              activeColumnElement.style.display = 'hidden';
            }
            setTimeout(() => {
              if (activeColumnElement) {
                activeColumnElement.style.visibility = 'visible';
              }
            }, 100);
            return
          }
        }

        var jsonTexto = '{"IdProgram":"' + data.idProgram + '","Idanalytes":"' + data.idAnalytes + '", "IdAnalyzer":"' + this.dataSource.filteredData[posicion].IdAnalyzer + '","Idunit":"' + this.dataSource.filteredData[posicion].Idunits + '" ,"Idmethod":"' + this.dataSource.filteredData[posicion].Idmethods + '" ,"Idreagents":"' + this.dataSource.filteredData[posicion].IdReagents + '"}';

        this.ProgramaConfQceService.getinfoConfigprogramid(jsonTexto)
          .then(dataprgramconf => {

            dataprgramconf.forEach(element => {

              let idprogramconf = element.IdProgramconf
              let idresult = element.Idresult


              this.resultQceService.deleteresultxidprogramconf(idresult, idprogramconf)
                .then(dataprgramconf => {
                })
                .catch(error => {
                  console.log(error.error)
                });
            });


          })
          .catch(error => {
            console.log(error.error)

          });
      })


    }
  }


  async buscar() {
    if (this.formaBuscarDatos.valid) {

      await this.programConfClientHeaderqQceService.getProgramAssignment(Number(this.formaBuscarDatos.value.cliente), Number(this.formaBuscarDatos.value.sede), Number(this.formaBuscarDatos.value.programa)).toPromise()
        .then(r => {
          this.generarDataassign(r);
        })
        .catch(err => {
          this.generarDataassign([]);
          this.toastr.error('No hay asignaciones.');
        });

      const obj =
      {
        "IdProgram": Number(this.formaBuscarDatos.value.programa)
      }

      this.programConfQceDetailsService.getInfoconfigprograma(obj)
        .then(r => {
          this.generarData(r);
          this.spinner.hide();
          this.desprogramconfig = r[0].Desprogram;
        })
        .catch(err => {
          this.toastr.error('No hay datos.');
        });

    } else {

      this.toastr.error('Debe diligenciar los campos completamente.');
      this.formaBuscarDatos.markAllAsTouched();

    }
  }

  detailObj() {
    let obj = {
      Cliente: this.clienteSeleccionado.name,
      Programa: this.programSelected.Desprogram,
      Sede: this.sedeSeleccionada.desheadquarters,
      tabla: this.dataSource.filteredData,
    }
    return obj;
  }

  crearAsignacion() {

    this.buttonClicked = true;
    let objcreate = [];

    this.dataSource.filteredData.forEach(element => {

      if (this.dataSourceconfig.filteredData.length !== 0) {

        this.existeasign = this.dataSourceconfig.filteredData.some(datos => datos.idAnalytes === element.Idanalytes)

        if (!this.existeasign) {

          if (element.Active === true) {

            const obj = {
              idProgramConfClientHeadq: 0,
              idClient: this.clienteSeleccionado.idclient,
              idHeadQuarterClientQCE: this.sedeSeleccionada.idheadquarters,
              idAnalytes: element.Idanalytes,
              id_Analyzer: element.IdAnalyzer,
              idMethod: element.Idmethods,
              idUnit: element.Idunits,
              idProgram: element.IdProgram,
              idReagents: element.IdReagents,
              valueAsign: 0,
              active: element.Active
            }
            objcreate.push(obj);
          }

        }

      } else {

        if (element.Active === true) {

          const obj = {
            idProgramConfClientHeadq: 0,
            idClient: this.clienteSeleccionado.idclient,
            idHeadQuarterClientQCE: this.sedeSeleccionada.idheadquarters,
            idAnalytes: element.Idanalytes,
            id_Analyzer: element.IdAnalyzer,
            idMethod: element.Idmethods,
            idUnit: element.Idunits,
            idProgram: element.IdProgram,
            idReagents: element.IdReagents,
            valueAsign: 0,
            active: element.Active
          }
          objcreate.push(obj);
        }
      }
    });

    if (objcreate.length === 0) {
      this.toastr.error('las configuraciones ya estan asignadas.');
    }

    this.programConfClientHeaderqQceService.createProgramAssignment(objcreate)
      .then(r => {
        this.toastr.success('Asignación programa generada correctamente.');
        this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de Programas', 'c', this.detailObj(), JSON.stringify(r), 200);
        this.buscar();
        this.buttonClicked = false;
      })
      .catch(err => {
        this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de programas', 'c', this.detailObj(), err.message, err.status);
      });

  }


  async guardar() {

    let duplicateParametrization = false;
    //Valida que no exista la misma parametrización. 
    this.dataSourceconfig.filteredData.forEach(element => {
      const exists = this.dataSourceconfig.filteredData.filter(x=>x.idMethod == element.idMethod
                                                          && x.idReagents == element.idReagents
                                                          && x.idUnit == element.idUnit
                                                          && x.id_Analyzer == element.id_Analyzer
                                                          && x.idAnalytes == element.idAnalytes) || null;
      if (exists.length > 1){
        duplicateParametrization = true;
        this.toastr.error("Hay parametrizaciones del mismo analito que se encuentran duplicadas. Por favor validar");
        return;
      }
    });

    if (duplicateParametrization == false){
      await this.programConfClientHeaderqQceService.updateProgramAssignment(this.dataSourceconfig.filteredData)
      .then(r => {
        this.toastr.success('Asignación de programa actualizada correctamente.');
        this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de programas', 'a', this.detailObj(), JSON.stringify(r), 200);
        this.generarDataassign(r)
      })
      .catch(err => {
        this.toastr.error('Datos no actualizados.');
        this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de programas', 'a', this.detailObj(), err.message, err.status);
      });
    }
  }


  generarData(r) {
    this.dataSource = new MatTableDataSource(r);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.verTabla = true;

  }

  generarDataassign(r) {
    this.dataSourceconfig = new MatTableDataSource(r);
    this.dataSourceconfig.paginator = this.paginator;
    this.dataSourceconfig.sort = this.sort;
    this.verTabla = true;

    setTimeout(() => {
      for (let item of r) {
        $("#unit" + item.idProgramConfClientHeadq).val(item.idUnit);
        $("#metodo" + item.idProgramConfClientHeadq).val(item.idMethod);
        $("#react" + item.idProgramConfClientHeadq).val(item.idReagents);
        $("#analizador" + item.idProgramConfClientHeadq).val(item.id_Analyzer);
      }
    }, 100);
  }

  actualizarEstadoGestionProgramas(datosGestion) {

    const estado = datosGestion.Active ? false : true;

    let datos = null;

    if (datosGestion.Valueasign != null) {

      this.isCuanti = true;
      datos = { idProgramconf: datosGestion.IdProgramconf, idanalytes: datosGestion.Idanalytes, idAnalyzer: datosGestion.IdAnalyzer, idReagents: datosGestion.IdReagents, idmethods: datosGestion.Idmethods, idunits: datosGestion.Idunits, idProgram: datosGestion.IdProgram, valueasign: datosGestion.Valueasign, active: estado }

    } else {

      this.isCuanti = false;
      datos = { idProgramconf: datosGestion.IdProgramconf, idanalytes: datosGestion.Idanalytes, idAnalyzer: datosGestion.IdAnalyzer, idReagents: datosGestion.IdReagents, idmethods: datosGestion.Idmethods, idunits: datosGestion.Idunits, idProgram: datosGestion.IdProgram, active: estado }

    }
    if (estado === false) {
      this.toastr.info('Al desactivar el analito, no se asignará dentro del programa.');
    }

    this.ProgramaConfQceService.update(datos, datosGestion.IdProgramconf).subscribe(respuesta => {

      this.buscar();
      this.spinner.show();
      this.toastr.success('Estado de configuración actualizado!.');
      this.accion = 'Editar';

    });

  }

  cancelarAsig() {
    this.verTabla = false;
    this.formaBuscarDatos.reset();
    this.dataSource = new MatTableDataSource();
  }


  closeVentana(): void {
    this.vantanaModal.hide();
  }

}


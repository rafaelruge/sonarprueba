
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { ProgramasQceService } from '@app/services/configuracion/programas-qce.service';
import { RondasQceService } from '@app/services/configuracion/rondas-qce.service';
import { SampleQceService } from '@app/services/configuracion/sample-qce.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PublicService } from '@app/services/public.service';
import { SedesService } from '@app/services/configuracion/sedes.service';
import { ProgramConfClientHeaderqQceService } from '@app/services/calidad-externo/program-conf-client-headerq-qce.service';
import { createLog } from "../../../../../../globals/logUser";
import { SampleAssignAnalytesQceService } from '@app/services/calidad-externo/SampleAssignAnalytes.service';


@Component({
  selector: 'app-rondas',
  templateUrl: './rondas.component.html',
  styleUrls: ['./rondas.component.css'],
  providers: [DatePipe]

})
export class RondasComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.rondasQceService);
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroRondasQce: FormGroup;
  formaBuscarDatos: FormGroup;
  formularioSamples: FormGroup = this.fb.group({

    idSample: ['', Validators.required],
    idAnalyte: ['', Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required]

  });
  accionEditar: any;
  tituloAccion: any;
  dataTable = [];
  accion: any;
  today = moment().format('YYYY-MM-DD');
  messageError: string;
  programa: string;
  idCliente: number;
  idPrograma: number;
  idsede: number;
  show = false;
  desactivar = false;
  show2 = false;
  verBtnAdd = false;
  cliente: string;
  idround: number;
  listaClientes = [];
  listaProgramas = [];
  listaasignacionprogramas = [];
  listaSamples = [];
  rondas0: number;
  nroSamples = [];
  programAnalytesTmp = [];
  programAnalytes = [];
  page = 1;
  pageSize = 3;
  collectionSize = 0;
  maxSize = 0;
  indices = [];
  verSamples = false;
  numeromuestras: number;
  //predictivos create
  filteredOptionsSamplesCreate: Observable<string[]>;
  listsamplescreate: any;
  //predictivo edit
  idsamplepr: number;
  dessamplepr: any;
  listasamplepre: any;
  sedesActive: any;
  assignprograms: any = [];
  validrondas = [];
  isButtonDisabled = false;
  listaAnalitosXPrograma = [];
  listaAnalitosSinasignar = [];
  jsonTxtAnalitos = [];
  vertodosanalitos: boolean = true;
  bloquearbuscar: boolean = true;
  isHabilited: boolean = true;


  formaRegistroRondasQceEdit = this.fb.group({

    idround: [],
    idProgram: [],
    idclient: [],
    nroround: [Validators.required],
    nrosample: [],
    active: [],
    idSample: [],
    enddate: [],
    begindate: []

  });
  clienteSeleccionado: any;
  programSelected: any;
  sedeSeleccionada: any;

  displayedColumns: string[] = ['Name', 'Nroround', 'Nrosample', 'inicial', 'final', 'detalle', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  displayedColumnsDetalle: string[] = ['numuestra', 'idmuestra', 'inicial', 'final'];
  dataSourceDetalle: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild(MatPaginator, { static: false }) paginatorDetalle: MatPaginator;
  @ViewChild(MatSort, { static: true }) sortDetalle: MatSort;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private clientesService: ClientesService,
    private programQceService: ProgramasQceService,
    private rondasQceService: RondasQceService,
    private sampleQceService: SampleQceService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private ventanaService: VentanasModalesService,
    private publicService: PublicService,
    private SedesService: SedesService,
    private programConfClientHeaderqQceService: ProgramConfClientHeaderqQceService,
    private SampleAssignAnalytesQceService: SampleAssignAnalytesQceService,
  ) { }

  ngOnInit(): void {
    sessionStorage.setItem('consultaSedeExterna', '0');
    this.crearFormularioBuscarDatos();
    this.crearFormulario('');
    this.consultarClientes();
    //this.consultarProgramas();
    this.consultarSamples();
    this.titulosSwal();
  }

  private _filtersamplesCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listsamplescreate
      .filter(result =>
        result.serialsample.toLowerCase().includes(filterValue));
  }

  async cargarSedes(dataClient) {
    sessionStorage.setItem('consultaSedeExterna', '1');
    await this.publicService.obtenerSedesAsigProg(this.clienteSeleccionado.header).then(r => {
      this.sedesActive = r.filter(e => e.active);
      sessionStorage.setItem('consultaSedeExterna', '0');
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
        this.consultarProgramas(data);
        break;
      case 3:
        this.programSelected = data;
        break;
    }

  }

  consultarSamples() {
    this.sampleQceService.getAllAsync().then(respuesta => {
      this.listaSamples = respuesta.filter(datos => datos.active);
    });
  }

  AnalitosSinAsignar(muestra: number, programa: number) {
    // const obj =
    // {
    //   "Idsample": muestra,
    //   "Idprogram": this.idPrograma,
    //   "IdProgramConfClientHeadq": this.assignprograms[0]

    // }

    const obj =
    {
      "Idsample": muestra,
      "Idprogram": this.idPrograma,
      "IdRound" : this.idround
    }

    this.SampleAssignAnalytesQceService.AnalitosQcesinasignar(obj).then((data: any) => {

      this.listaAnalitosXPrograma = data;
      // this.idround
      // this.SampleAssignAnalytesQceService.buscarAnalitosPorProgramaMuestra(this.idPrograma, this.idround).then((analytes: any) => {
      //   debugger
      //   if (analytes && analytes.length && this.listaAnalitosXPrograma.length) {
      //     let data = analytes.map(e => { return e.idanalytes })
      //     if(data.length == this.listaAnalitosXPrograma.length){
      //       data.unshift('-1')
      //     }
      //     this.formularioSamples.get('idAnalyte').setValue(data)
      //   }
      // })
    }).catch(error => {
      console.log(error.error)
      this.formularioSamples.get('idAnalyte').disable();
      //this.listaAnalitosXPrograma=[];
      this.toastr.error(this.translate.instant('No hay analitos para asignar a la muestra seleccionada.'));

    });
  }

  consultarAnalitosxPrograma() {

    const obj =
    {
      "IdClient": this.formaBuscarDatos.get('cliente').value,
      "Idsede": this.formaBuscarDatos.get('sede').value,
      "IdProgram": this.assignprograms
    }

    this.SampleAssignAnalytesQceService.buscarAnalitosQcexPrograma(obj).then((data: any) => {

      this.listaAnalitosXPrograma = data;

    }).catch(error => {
      console.log(error.error)
    });
  }

  async consultarClientes() {

    this.listaClientes = await this.clientesService.getAllAsync();
  }

  consultarProgramas(data: any) {
    this.idCliente = this.formaBuscarDatos.get('cliente').value;
    this.idsede = this.formaBuscarDatos.get('sede').value;
    this.programConfClientHeaderqQceService.getProgramAssignAll(this.idCliente, this.idsede).then(respuesta => {
      this.listaProgramas = respuesta.filter(datos => datos.Active);

    });
  }

  // Select - Options

  selectAll(control: string) {
    this.formularioSamples.get(control).setValue(['-1']);
  }

  selectNone(control: string) {
    this.formularioSamples.get(control).setValue('');
  }

  selectOne(control: string) {
    if (this.formularioSamples.get(control).value[0] == '-1' || this.formularioSamples.get(control).value[0] == '') {

      this.formularioSamples.get(control).value.shift();
      this.formularioSamples.get(control).setValue(this.formularioSamples.get(control).value);
    }
  }

  selectedanalyte(control: string) {

    if (this.formularioSamples.get(control).value[0] == '-1' || this.formularioSamples.get(control).value[0] == '') {

      this.formularioSamples.get(control).value.shift();
      this.formularioSamples.get(control).setValue(this.formularioSamples.get(control).value);
    }
    if (this.formularioSamples.get(control).value[0] != '-1' || this.formularioSamples.get(control).value[0] != '') {

      this.selectanalyte(this.formularioSamples.get(control).value);
    }

    if (this.formularioSamples.get(control).value.length == this.listaAnalitosXPrograma.length) {
      let all = this.listaAnalitosXPrograma.map(e => { return e.idanalytes })
      all.unshift("-1")
      this.formularioSamples.get(control).setValue(all)
    }
  }

  async selectanalyte(idAnalyte) {

    if (idAnalyte.length == 0) {
      return;
    }

    let arranalyte2 = [];
    idAnalyte.forEach(element => {
      if (element != '-1') {
        arranalyte2.push(element)
      }
    });


  }

  selectedAllanalyte(control: string) {
    let all = this.listaAnalitosXPrograma.map(e => { return e.idanalytes })
    all.unshift("-1")
    this.formularioSamples.get(control).setValue(all)

  }

  buildJsons(array: Array<any>, control: string): Array<any> {
    debugger

    var cadena = '';
    var json = '';

    if (array[0] == '-1') {
      array.shift()
    }

    for (let i = 0; i < array.length; i++) {

      // if (array[0] == '-1') {

      //   cadena = 'Todos';
      //   json = '-1';
      //   break;

      // } else {

      json = array.join();
      var ref: any;

      if (control == 'idAnalyte') {
        var ref = this.listaAnalitosXPrograma.find(dato => dato.idanalytes == array[i]);
        cadena += ref.desanalytes + ', ';
      }

    }
    return [json, cadena];
  }

  validselect() {

    if (this.listaAnalitosXPrograma.length == 0) {
      this.vertodosanalitos = false;
      return false
    }
    return true
  }

  async AsignacionesProgram(idprogram: number) {

    await this.programConfClientHeaderqQceService.Getprogramassignxidprogram(idprogram, this.idCliente, this.idsede).then(respuesta => {

      this.listaasignacionprogramas = respuesta.filter(datos => datos.Active);

      for (let item of respuesta) {
        this.assignprograms.push(item.IdProgramConfClientHeadq);
      }

    });
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  async getDataTable() {

    this.bloquearbuscar = true;
    this.AsignacionesProgram(this.formaBuscarDatos.get('programa').value);
    const obj =
    // {
    //   "IdClient": this.formaBuscarDatos.get('cliente').value,
    //   "Idsede": this.formaBuscarDatos.get('sede').value,
    //   "IdProgram": this.assignprograms
    // }
    {
      "IdClient": this.formaBuscarDatos.get('cliente').value,
      "Idsede": this.formaBuscarDatos.get('sede').value,
      "IdProgram": this.formaBuscarDatos.get('programa').value,
    }

    this.validrondas = [];
    this.idPrograma = this.formaBuscarDatos.get('programa').value;
    this.idsede = this.formaBuscarDatos.get('sede').value;

    this.dataTable = [];
    this.consultarAnalitosxPrograma();

    this.rondasQceService.buscarRondasQce(obj).then((data: any) => {

      this.bloquearbuscar = false
      var rondas = [];
      this.validrondas = data;

      for (let i = 0; i < data.length; i++) {

        this.cliente = data[i].name;
        this.programa = data[i].desprogram;
        if (!rondas.includes(data[i].nroround)) {
          rondas.push(data[i].nroround);
        }
      }
      for (let i = 0; i < rondas.length; i++) {

        let arreglo = data.filter(ronda => ronda.nroround == rondas[i]);
        //let arreglo = data;
        let ronda = arreglo.pop();
        this.dataTable.push(ronda);

      }

      this.dataTable.sort(((a, b) => a.nroround - b.nroround));
      this.dataSource = new MatTableDataSource(this.dataTable);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.sharedService.customTextPaginator(this.paginator);
      //this.rondas = this.dataTable.length + 1;
      this.show = true;

      //this.assignprograms=[];

    }).catch(error => {

      this.dataSource = new MatTableDataSource([]);

      this.clientesService.getByIdAsync(this.idCliente).then((cliente: any) => {
        this.cliente = cliente.name;
      });

      this.programQceService.getByIdAsync(this.idPrograma).then((programa: any) => {
        this.programa = programa.desprogram;
      });

      this.accion = 'noDatos';
      this.show = true;
      this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
      //this.rondas = 1;
    });
    this.show = true;
  }

  loader() {

    if (this.accion == 'Crear') {

      setTimeout(() => {

        this.getDataTable();
        this.closeVentana();
        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
        this.desactivar = false;

      }, 2000);

    } else if (this.accion == 'Editar') {
      setTimeout(() => {

        this.getDataTable();
        this.closeVentana();
        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

      }, 2000);

    } else {

      this.getDataTable();
      this.closeVentana();
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
    }
  }

  buscarDatos() {

    this.bloquearbuscar = false;

    if (this.formaBuscarDatos.get('cliente').value != '' && this.formaBuscarDatos.get('sede').value != '' && this.formaBuscarDatos.get('programa').value != '') {
      this.getDataTable();
    }
    this.formaBuscarDatos.get('programa').valueChanges.subscribe(() => {
      this.bloquearbuscar = true
    });
    this.formaBuscarDatos.get('sede').valueChanges.subscribe(() => {
      this.bloquearbuscar = true
    });
  }

  crearFormularioBuscarDatos() {

    this.formaBuscarDatos = this.fb.group({

      cliente: ['', [Validators.required]],
      sede: ['', [Validators.required]],
      programa: ['', [Validators.required]]

    });
  }

  Limpiarprograma() {

    this.formaBuscarDatos.get('programa').valueChanges.subscribe(() => {

      this.show = false;
      this.dataTable = [];
      this.assignprograms = [];
    });

  }

  limpiarFormBuscarDatos() {
    this.formaBuscarDatos.get('sede').reset();
    this.formaBuscarDatos.get('programa').reset();
    this.assignprograms = [];
  }
  limpiarFormBuscarDatosSede() {
    this.formaBuscarDatos.get('programa').reset();
    this.assignprograms = [];
  }
  //------------------ modal CREAR --------------------
  async openModalRegistroRondasQce(templateRegistroRondasQce: TemplateRef<any>, datos: any) {

    this.nroSamples = [];
    this.formularioSamples.reset({ idSample: '', fechaInicio: '', fechaFin: '' });

    if (datos != '') {

      this.idround = datos.idround;
      this.verBtnAdd = false;
      this.show2 = false;
      this.rondas0 = datos.nroround;

      await this.rondasQceService.getSamples(datos.idclient, this.idsede, datos.idProgram, datos.nroround).then(data => {
        this.nroSamples = data;
      });

    } else {

      this.verBtnAdd = true;
      this.show2 = true;

    }

    this.AsignacionesProgram(this.formaBuscarDatos.get('programa').value);
    this.crearFormulario(datos);

    this.ventanaModal = this.modalService.show(templateRegistroRondasQce, { 'class': 'modal-lg', backdrop: 'static', keyboard: false });
    this.accionEditar = !!datos;
    datos != '' ? this.accion = 'Editar' : this.accion = 'Crear';
    datos ? this.translate.get('MODULES.RONDASQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.RONDASQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  async openModalRegistroRondasQceEdit(templateRegistroRondasQce: TemplateRef<any>, datos: any) {

    this.nroSamples = [];
    this.formularioSamples.reset({ idSample: '', fechaInicio: '', fechaFin: '' });

    if (datos != '') {

      this.idround = datos.idround;
      this.verBtnAdd = false;
      this.show2 = false;

      await this.rondasQceService.getSamples(datos.idclient, this.idsede, datos.idProgram, datos.nroround).then(data => {

        this.nroSamples = data;

      });

    } else {

      this.verBtnAdd = true;
      this.show2 = true;

    }

    this.crearFormularioEdit(datos);
    this.ventanaModal = this.modalService.show(templateRegistroRondasQce, { 'class': 'modal-lg', backdrop: 'static', keyboard: false });
    this.accionEditar = !!datos;
    datos != '' ? this.accion = 'Editar' : this.accion = 'Crear';
    datos ? this.translate.get('MODULES.RONDASQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.RONDASQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  editarSample(muestra: any) {
    debugger

    this.idround = muestra.Idround;

    let objeto: any = this.nroSamples.find(muestra => muestra.Idround == this.idround);

    this.formularioSamples.get('idSample').setValue(objeto.IdSample);
    this.formularioSamples.get('fechaFin').setValue(objeto.Enddate);
    this.formularioSamples.get('fechaInicio').setValue(objeto.Begindate);
    this.numeromuestras = objeto.Nrosample;
    this.show2 = true;
    this.verBtnAdd = false;
    this.formularioSamples.get('idAnalyte').enable();


    this.AnalitosSinAsignar(objeto.IdSample, muestra.IdProgram);

  }

  async openModalDetalleRondasQce(templateDetalleQce: TemplateRef<any>, datos) {

    let arr = [];

    await this.rondasQceService.getSamples(datos.idclient, this.idsede, datos.idProgram, datos.nroround).then((data: any) => {

      arr = data.sort(((a, b) => a.Nrosample - b.Nrosample));
      this.dataSourceDetalle = new MatTableDataSource(arr);

    });

    this.ventanaModal = this.modalService.show(templateDetalleQce, { backdrop: 'static', keyboard: false });

  }

  crearFormulario(datos: any) {


    this.formaRegistroRondasQce = this.fb.group({

      idround: [datos.idround ? datos.idround : ''],
      IdProgramConfClientHeadq: [{ value: this.programa, disabled: true }],
      idclient: [{ value: this.cliente, disabled: true }],
      nroround: [datos.nroround ? datos.nroround : '', [Validators.required]],
      nrosample: [datos.nrosample ? datos.nrosample : ''],
      active: [datos.active ? datos.active : true],
      idSample: [datos.idSample ? datos.idSample : ''],
      enddate: [datos.enddate ? datos.enddate : ''],
      begindate: [datos.begindate ? datos.begindate : ''],
      // idAnalyte: ['']

    });

  }

  get nroroundsForm() {
    return this.formaRegistroRondasQce.get('nroround');
  }

  crearFormularioEdit(datos: any) {

    this.formaRegistroRondasQce = this.fb.group({

      idround: [datos.idround ? datos.idround : ''],
      IdProgramConfClientHeadq: [{ value: this.programa, disabled: true }],
      idclient: [{ value: this.cliente, disabled: true }],
      nroround: [datos.nroround ? datos.nroround : ''],
      nrosample: [datos.nrosample ? datos.nrosample : ''],
      active: [datos.active ? datos.active : true],
      idSample: [datos.idSample ? datos.idSample : ''],
      enddate: [datos.enddate ? datos.enddate : ''],
      begindate: [datos.begindate ? datos.begindate : '']

    });

  }

  detailObj() {
    let cliente = this.listaClientes.find(x => x.idclient == this.formaBuscarDatos.value.cliente);
    let sede = this.sedesActive.find(x => x.idheadquarters == this.formaBuscarDatos.value.sede);
    let programa = this.listaProgramas.find(x => x.IdProgram == this.formaBuscarDatos.value.programa);
    var muestras = [];
    for (let item of this.nroSamples) {
      const obj = {
        muestra: item.Serialsample,
        fechaInicio: item.Begindate,
        fechaFin: item.Enddate
      }
      muestras.push(obj);
    }
    let obj = {
      cliente: cliente.name,
      sede: sede.desheadquarters,
      programa: programa.Desprogram,
      rondas: this.formaRegistroRondasQce.get('nroround').value,
      muestras: muestras
    }
    return obj;
  }

  crearEditarRodasQce() {



    if (!this.isButtonDisabled) {
      this.isButtonDisabled = true;
      // Realiza tu acción aquí, como una solicitud HTTP o procesamiento asincrónico
      // Una vez que se complete la acción, habilita nuevamente el botón
      setTimeout(() => {
        this.isButtonDisabled = false;
      }, 2000); // Cambia esto al tiempo necesario
    }

    if (this.accion == 'Crear') {

      if (this.formaRegistroRondasQce.valid) {

        if (this.nroSamples.length != 0) {

          let validnrorondas = this.formaRegistroRondasQce.get('nroround').value;

          for (let i = 0; i < this.validrondas.length; i++) {
            if (this.validrondas[i].nroround === validnrorondas) {
              this.toastr.error(this.translate.instant('Número de ronda ya está configurado. ingrese otro.'));
              return
            }
          }

          const obj =
          {
            "IdClient": this.formaBuscarDatos.get('cliente').value,
            "Idsede": this.formaBuscarDatos.get('sede').value,
            "IdProgram": this.assignprograms
          }

          debugger
          for (let i = 0; i < this.nroSamples.length; i++) {

            const data = {
              idround: '',
              idSample: this.nroSamples[i].IdSample,
              IdProgramConfClientHeadq: this.assignprograms[0],
              idclient: this.idCliente,
              nroround: this.formaRegistroRondasQce.get('nroround').value,
              nrosample: i + 1,
              enddate: this.datePipe.transform(this.nroSamples[i].Enddate, "yyyy-MM-dd"),
              begindate: this.datePipe.transform(this.nroSamples[i].Begindate, "yyyy-MM-dd"),
              active: this.formaRegistroRondasQce.get('active').value
            }

            this.desactivar = true;
            this.rondasQceService.create(data).subscribe(res => {

              const datasampleassignanalyte = {
                idsampleassignanalytes: '',
                idsample: this.nroSamples[i].IdSample,
                idanalyte: this.nroSamples[i].IdAnalyte,
                idprogram: this.idPrograma,
                idprogramconfclientheadq: this.listaasignacionprogramas,
                idround: res.idround,
                idsede: this.idsede,
                idclient: this.idCliente
              }

              this.SampleAssignAnalytesQceService.create(datasampleassignanalyte).subscribe(respuesta01 => {

              }, error => { console.log(error.error) })

              this.programAnalytesTmp.forEach(item => {

                const roundConf = {
                  IdProgramConf: item.IdProgramconf,
                  IdRound: res.idround,
                  DesResult: item.Desresults,
                  Valuetype: item.Valuetype,
                  Assignedvalue: item.Assignedvalue,
                  Active: true
                }

                this.rondasQceService.createRoundConf(roundConf).subscribe(rep => console.log('Res crear RondaConf', rep));
              });
              this.formaRegistroRondasQce.get('nroround').reset();
              this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'c', this.detailObj(), JSON.stringify(res), 200);
              this.formularioSamples.get('idAnalyte').enable()
            }, error => {
              this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'c', this.detailObj(), error.message, error.status);
            });
          }
          this.loader();
        }
      } else {
        this.toastr.error(this.translate.instant('Debe diligenciar todos los campos para crear la ronda.'));
        console.log(this.formaRegistroRondasQce.value)
        this.formaRegistroRondasQce.markAllAsTouched()
      }

    } else {

      
      let idSample: number = parseInt(this.formularioSamples.get('idSample').value);
      let enddate = this.formularioSamples.get('fechaFin').value;
      let begindate = this.formularioSamples.get('fechaInicio').value;
      let nrosample = this.nroSamples.length;
      let validnrorondas = this.formaRegistroRondasQce.get('nroround').value;

      if (this.rondas0 != this.formaRegistroRondasQce.get('nroround').value) {

        for (let i = 0; i < this.validrondas.length; i++) {
          if (this.validrondas[i].nroround === validnrorondas) {
            this.toastr.error(this.translate.instant('Número de ronda ya está configurado. ingrese otro.'));
            return
          }
        }

        for (var i = 0; i < this.nroSamples.length; i++) {

          if (this.formularioSamples.get('fechaFin').value != this.nroSamples[i].Enddate) {
            enddate = this.formularioSamples.get('fechaFin').value;
          } if (this.formularioSamples.get('fechaFin').value === "") {
            enddate = this.nroSamples[i].Enddate;
          }
          if (this.formularioSamples.get('fechaInicio').value != this.nroSamples[i].Begindate) {
            begindate = this.formularioSamples.get('fechaInicio').value;
          } if (this.formularioSamples.get('fechaInicio').value === "") {
            begindate = this.nroSamples[i].Begindate;
          }

          const data = {
            idround: this.nroSamples[i].Idround,
            idSample: this.nroSamples[i].IdSample,
            idclient: this.idCliente,
            IdProgramConfClientHeadq: this.nroSamples[i].IdProgramConfClientHeadq,
            nroround: this.formaRegistroRondasQce.get('nroround').value,
            nrosample: this.nroSamples[i].Nrosample,
            enddate: this.datePipe.transform(enddate, "yyyy-MM-dd"),
            begindate: this.datePipe.transform(begindate, "yyyy-MM-dd"),
            active: this.formaRegistroRondasQce.get('active').value
          }

          const datasampleassignanalyte = {
            idsampleassignanalytes: '',
            idsample: this.nroSamples[i].IdSample,
            idanalyte: this.nroSamples[i].IdAnalyte,
            //idanalyte:  this.jsonTxtAnalitos[0],
            idprogram: this.idPrograma,
            idprogramconfclientheadq: this.listaasignacionprogramas,
            idround: data.idround,
            idsede: this.idsede,
            idclient: this.idCliente
          }

          this.SampleAssignAnalytesQceService.create(datasampleassignanalyte).subscribe(respuesta01 => {
            this.formularioSamples.get('idAnalyte').enable()

          }, error => { console.log(error.error) })

          this.rondasQceService.update(data, data.idround).subscribe(_ => {

            this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'a', this.detailObj(), JSON.stringify(_), 200);

          }, error => {

            this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'a', this.detailObj(), error.message, error.status);

          });

          const ultimaPosicion = this.nroSamples[this.nroSamples.length - 1];

          if (ultimaPosicion == this.nroSamples[i]) {
            this.loader();
          }
        }

      } else {
        console.log(this.accion);
        let idSample: number = parseInt(this.formularioSamples.get('idSample').value);
        let enddate = this.formularioSamples.get('fechaFin').value;
        let begindate = this.formularioSamples.get('fechaInicio').value;
        if (this.formularioSamples.value.idAnalyte != null) {
          this.jsonTxtAnalitos = this.buildJsons(this.formularioSamples.value.idAnalyte, 'idAnalyte');
        }

        const data = {
          idround: this.idround,
          idSample: idSample,
          IdProgramConfClientHeadq: this.assignprograms[0],
          idclient: this.idCliente,
          nroround: this.formaRegistroRondasQce.get('nroround').value,
          nrosample: this.numeromuestras,
          enddate: this.datePipe.transform(enddate, "yyyy-MM-dd"),
          begindate: this.datePipe.transform(begindate, "yyyy-MM-dd"),
          active: this.formaRegistroRondasQce.get('active').value,
        }

        //Addd analytes -
        const datasampleassignanalyte = {
          idsampleassignanalytes: '',
          idsample: idSample,
          idanalyte: this.jsonTxtAnalitos[0],
          idprogram: this.idPrograma,
          idprogramconfclientheadq: this.listaasignacionprogramas,
          idround: data.idround,
          idsede: this.idsede,
          idclient: this.idCliente
        }

        this.SampleAssignAnalytesQceService.create(datasampleassignanalyte).subscribe(respuesta01 => {
        }, error => { console.log(error.error) })

        //update round -
        this.rondasQceService.update(data, data.idround).subscribe(_ => {
          this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'a', this.detailObj(), JSON.stringify(_), 200);
          this.loader();

        }, error => {
          this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'a', this.detailObj(), error.message, error.status);
        });
      }
    }
  }

  removeSample(muestra: any, i: any) {

    if (this.accion == 'Crear') {

      this.nroSamples.splice(i, 1);

    } else {

      this.rondasQceService.delete('ronda', muestra.Idround).subscribe(_ => {
        this.nroSamples.splice(i, 1);
        const data = {

          idround: this.idround,
          idSample: this.formaRegistroRondasQce.get('idSample').value,
          IdProgramConfClientHeadq: this.idPrograma,
          idclient: this.idCliente,
          nroround: this.formaRegistroRondasQce.get('nroround').value,
          nrosample: this.nroSamples.length,
          enddate: this.datePipe.transform(this.formaRegistroRondasQce.get('enddate').value, "yyyy-MM-dd"),
          begindate: this.datePipe.transform(this.formaRegistroRondasQce.get('begindate').value, "yyyy-MM-dd"),
          active: this.formaRegistroRondasQce.get('active').value,

        }

        this.rondasQceService.update(data, data.idround).subscribe(_ => {

          this.accion = '';
          this.loader();

        }, error => {
          console.log(error);
        });
      });
    }
  }
  // -------------------------------- MUESTRA MODAL CON TABLA MUESTRAS-> PLUS BTN------------------------------------------------
  async addProgramAnalyteConfig() {



    this.isHabilited = false;
    this.programAnalytes = [];
    this.programAnalytesTmp = [];

    if (this.formularioSamples.get('idSample').value == '' || this.formularioSamples.get('fechaInicio').value == '' || this.formularioSamples.get('fechaFin').value == '') {
      this.isHabilited = true;
      this.formularioSamples.markAllAsTouched()
      return;
    }

    this.verSamples = false;
    this.addSample();




    // await this.rondasQceService.getProgramAnalytes(this.idPrograma)
    //   .then((analytes: any) => {
    //     if (analytes.length > 0) {

    //       let i = 0;
    //       this.refreshprogramAnalytes();

    //     } else {
    //       this.programAnalytes = [];
    //       this.addSample();

    //     }

    //   })
    //   .catch(e => {
    //     if (e) {  }
    //   });
  }
  refreshprogramAnalytes() {
    this.programAnalytes = this.programAnalytesTmp.slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);

  }
  // cumple requerimiento -  Solo se debe permitir una opción por analito
  selectChanged(analyte: any) {

    this.indices = [];

    this.programAnalytesTmp.forEach(item => {

      if (item.Desanalytes == analyte.Desanalytes) {

        const index = item.ListTipoValores.findIndex((x: any) => x.value == item.Valuetype);

        if (index > 0) {
          this.indices.push(index);
        }

        this.programAnalytesTmp.forEach(vt => {
          for (let i = 0; i < vt.ListTipoValores.length; i++) {
            vt.ListTipoValores[i].status = false;
          }

          for (let j = 0; j < this.indices.length; j++) {
            vt.ListTipoValores[this.indices[j]].status = true;
          }

        });

      }

    });

  }
  // cumple requerimiento -  Solo se debe permitir una opción por analito
  toggleChanged(analyte: any) {

    this.programAnalytesTmp.forEach(item => {

      if (item._id != analyte._id && item.Desanalytes == analyte.Desanalytes) {

        item.Assignedvalue = false;
      }
    });
  }
  addSample() {
    if (this.formularioSamples.get('idSample').value == '' || this.formularioSamples.get('fechaInicio').value == '' || this.formularioSamples.get('fechaFin').value == '') {
      this.isHabilited = true;
      this.formularioSamples.markAllAsTouched()
      return;
    }

    const idSampleNew = this.formularioSamples.get('idSample').value;
    this.programAnalytes = [];
    this.verSamples = true;
    this.jsonTxtAnalitos = this.buildJsons(this.formularioSamples.value.idAnalyte, 'idAnalyte');
    this.sampleQceService.getByIdAsync(this.formularioSamples.get('idSample').value).then((sample: any) => {

      //Validar que la muestra no exista aún 
      const buscarm = this.nroSamples.find(x=>x.IdSample == idSampleNew) || null;
      if (buscarm !== null){
        this.toastr.info("La muestra que desea adicionar ya se encuentra agregada.");
        this.isHabilited = true;
        return;
      }
      const data = {

        IdSample: this.formularioSamples.get('idSample').value,
        IdAnalyte: this.jsonTxtAnalitos[0],
        Begindate: this.datePipe.transform(this.formularioSamples.get('fechaInicio').value, "yyyy-MM-dd"),
        Enddate: this.datePipe.transform(this.formularioSamples.get('fechaFin').value, "yyyy-MM-dd"),
        Serialsample: sample.serialsample

      }
      this.nroSamples.push(data);
      this.formularioSamples.reset({ idSample: '', idAnalyte: '', fechaInicio: '', fechaFin: '' });
      this.isHabilited = true;


    }, error => {
      this.isHabilited = true;
    })

  }
  eliminarRondaQce(row: any) {

    let nroround = row.nroround;

    for (let i = 0; i < this.validrondas.length; i++) {

      if (this.validrondas[i].nroround === nroround) {
        this.rondasQceService.delete('roundQce', this.validrondas[i].idround).subscribe(respuesta => {

          const ultimaPosicion = this.validrondas[this.validrondas.length - 1];
          if (ultimaPosicion == this.validrondas[i]) {
            this.getDataTable();
            this.show = false;
            this.tituloAccion = '';
            this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
            this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'e', this.detailObj(), JSON.stringify(respuesta), 200);

          }
        },
          (err: HttpErrorResponse) => {

            this.toastr.error(this.messageError);
            this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'e', this.detailObj(), this.messageError, err.status);

          });
      }
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  closeVentana(): void {
    this.ventanaModal.hide();
    this.programAnalytes = [];
    this.formularioSamples.get('idAnalyte').enable()
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }
}







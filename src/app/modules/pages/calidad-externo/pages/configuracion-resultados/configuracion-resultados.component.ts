import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfigResultsService } from '@app/services/calidad-externo/configResults.service';
import { DiccionarioResultadosQceService } from '@app/services/calidad-externo/diccionarioResultadosQce.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import * as dayjs from 'dayjs';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import { staticNever } from 'rxjs-compat/add/observable/never';
import { debug } from 'console';

@Component({
  selector: 'app-configuracion-resultados',
  templateUrl: './configuracion-resultados.component.html',
  styleUrls: ['./configuracion-resultados.component.css'],
  providers: [DatePipe]
})
export class ConfiguracionResultadosComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroConf: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  show = false;
  idPrograma: number;
  IdProgramconf: any;
  idAnalito: number;
  desactivar = false;
  fromCreate = false;
  accion: any;
  interpretation: any;
  dataTable = [];
  dataTableList = [];
  idProgram
  today = dayjs().format('YYYY-MM-DD');
  messageError: string;
  listaAnalitos = [];
  listaProgramas = [];
  listaResultados: any;

  //predictivos create
  filteredOptionsesultadosCreate: Observable<string[]>;
  listresultadoscreate: any;

  //predictivo edit
  filteredOptionsresultsEdit: Observable<string[]>;
  idresultspr: number;
  desresultspr: any;
  listaresultadospre: any;

  formaRegistroConfEdit: FormGroup = this.fb.group({
    idconfanalyteresult: [],
    idProgramconf: [],
    idresultsdictionary: [, [Validators.required]],
    ordergraph: [, [Validators.required]],
    active: [],
    interpretation: [],
  });


  displayedColumns: string[] = ['resultado', 'interpretation', 'ordengrafica', 'estado', 'editar', 'eliminar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild(MatPaginator, { static: false }) paginatorDetalle: MatPaginator;
  @ViewChild(MatSort, { static: true }) sortDetalle: MatSort;

  formaBuscarDatos: FormGroup = this.fb.group({

    programa: ['', [Validators.required]],
    analito: ['', [Validators.required]]

  });

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private configResultsService: ConfigResultsService,
    private spinner: NgxSpinnerService,
    private resultsdictionaryQce: DiccionarioResultadosQceService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private ventanaService: VentanasModalesService

  ) { }

  ngOnInit(): void {
    this.crearFormularioConf('');
    this.consultarProgramas();
    this.consultarResultados();
    this.titulosSwal();
  }

  private _filterResultsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listaResultados
      .filter(result =>
        result.desresults.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filterResultadosEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listaResultados
      .filter(result => result.desresults.toLowerCase().includes(filterValue))

  }

  consultarProgramas() {
    this.configResultsService.getProgramas().subscribe((respuesta: any) => {

      var filtro = [];

      for (let i = 0; i < respuesta.length; i++) {

        if (!filtro.includes(respuesta[i].IdProgram)) {

          filtro.push(respuesta[i].IdProgram);

        }

      }

      this.listaProgramas = [];
      for (let i = 0; i < filtro.length; i++) {

        let arreglo = respuesta.filter(programa => programa.IdProgram == filtro[i]);

        let objeto = arreglo.pop();
        this.listaProgramas.push(objeto);

      }

    });
  }

  consultarAnalitos(programa: any) {

    this.formaBuscarDatos.get('analito').setValue('');
    this.listaAnalitos = [];

    if (programa != '') {

      this.configResultsService.getAnalitos(programa).subscribe((analitos: any) => {

        this.listaAnalitos = analitos.filter(analito => analito.Typeresult == 'C' || analito.Typeresult == 'S');

      });

    }

  }

  consultarResultados() {

    this.resultsdictionaryQce.getAllAsync().then(respuesta => {

      this.listaResultados = respuesta.filter(datos => datos.active);

    });

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  getData() {

    this.spinner.show();
    this.show = false;

    this.configResultsService.getIDProgramConf(this.idPrograma, this.idAnalito).subscribe(data => {
      this.IdProgramconf = data[0].IdProgramconf;
    });

    this.configResultsService.getResults(this.idPrograma, this.idAnalito).subscribe((data: any) => {

      this.dataTable = data;
      this.dataTableList = data;
      this.dataTable.sort(((a, b) => a.Ordergraph - b.Ordergraph));
      this.dataSource = new MatTableDataSource(this.dataTable);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      setTimeout(() => {

        this.spinner.hide();
        this.show = true;

      }, 2000);

    }, error => {
      this.dataTableList = [];
      this.dataTable = [];
      this.dataSource = new MatTableDataSource(this.dataTable);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.accion = 'noDatos';
      this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));

      this.spinner.hide();
      this.show = true;

    });

  }

  buscarDatos() {

    if (this.formaBuscarDatos.get('programa').value != '' && this.formaBuscarDatos.get('analito').value != '') {

      this.idPrograma = parseInt(this.formaBuscarDatos.get('programa').value);
      this.idAnalito = parseInt(this.formaBuscarDatos.get('analito').value);

      this.getData();
    }

  }

  async openModalRegistroRondasQce(templateRegistroRondasQce: TemplateRef<any>, datos: any) {

    this.fromCreate = true;
    this.crearFormularioConf(datos);
    await this.resultsdictionaryQce.getAllAsync().then(data => {
      this.listaResultados = data.filter(e => e.active == true);
      this.listaResultados.sort((a: any, b: any) => {
        a.desresults = a.desresults.charAt(0) + a.desresults.slice(1);
        b.desresults = b.desresults.charAt(0) + b.desresults.slice(1);
      })

      this.listaResultados.sort((a: any, b: any) => {
        if (a.desresults < b.desresults) return -1;
        if (a.desresults > b.desresults) return 1;
        return 0;
      })

      this.filteredOptionsesultadosCreate = this.formaRegistroConf.get('idresultsdictionary').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterResultsCreate(value)
        }),
      );
    });

    this.ventanaModal = this.modalService.show(templateRegistroRondasQce, { 'class': 'modal-md', backdrop: 'static', keyboard: false });
    this.accionEditar = !!datos;
    datos != '' ? this.accion = 'Editar' : this.accion = 'Crear';
    datos ? this.translate.get('MODULES.RONDASQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.RONDASQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
    this.fromCreate = false;
  }

  async openModalRegistroRondasQceEdit(templateRegistroConfEdit: TemplateRef<any>, datos: any) {
    this.crearFormularioConfEdit(datos);

    this.ventanaModal = this.modalService.show(templateRegistroConfEdit, { 'class': 'modal-md', backdrop: 'static', keyboard: false });
    this.accionEditar = !!datos;
    datos != '' ? this.accion = 'Editar' : this.accion = 'Crear';
    datos ? this.translate.get('MODULES.RONDASQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.RONDASQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  crearEditarConf() {
    let nomIdresults = this.formaRegistroConf.get('idresultsdictionary').value
    let nuevaData = this.formaRegistroConf.value;
    let arrresults = this.listaResultados.sort((a, b) => {
      a.desresults = a.desresults.charAt(0).toLowerCase() + a.desresults.slice(1);
      b.desresults = b.desresults.charAt(0).toLowerCase() + b.desresults.slice(1);

    })
    arrresults.sort((a, b) => {
      if (a.desresults < b.desresults) return -1;
      if (a.desresults > b.desresults) return 1;
      return 0;
    })

    arrresults.filter(result => {
      if (result.desresults.toLowerCase() === nomIdresults.toLowerCase()) {
        nuevaData.idresultsdictionary = result.idresultsdictionary;
        return
      }
      return
    })

    if (!this.formaRegistroConf.invalid) {
      //qc38 Parametrizacion mas de un resultado cualitativo
      //if (this.dataTableList.filter(x => x.Interpretation == this.formaRegistroConf.value.interpretation).length == 0 || this.formaRegistroConf.value.interpretation == '') {
        if (this.tituloAccion == 'Crear') {

          let ordengrafica: number = parseInt(this.formaRegistroConf.get('ordergraph').value);

          let objeto: any;
          objeto = this.dataTable.find(data => data.Ordergraph == ordengrafica) || undefined;
          debugger
          if (objeto != undefined) {

            this.closeVentana();
            this.accion = 'noDatos';
            this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYORDERGRAPH2'));

          } else {

            this.desactivar = true;
            this.configResultsService.create(nuevaData).subscribe(respuesta => {

              this.closeVentana();
              this.getData();
              this.accion = 'Crear';
              this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
              this.desactivar = false;

              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.dateNowISO,
                Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
                Datos: JSON.stringify(this.formaRegistroConf.value),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status
              }

              this.configResultsService.createLogAsync(Loguser).then(respuesta => {
              });
            }, (error) => {

              console.log(error);

              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.dateNowISO,
                metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
                datos: JSON.stringify(this.formaRegistroConf.value),
                respuesta: error.message,
                tipoRespuesta: error.status
              }
              this.configResultsService.createLogAsync(Loguser).then(respuesta => {
              });
            });

          }

        } else {
          let ordengrafica: number = parseInt(this.formaRegistroConf.get('ordergraph').value);
          let Idconfanalyteresult: number = parseInt(this.formaRegistroConf.value.idconfanalyteresult);
          let objeto: any;
          objeto = this.dataTable.find(data => data.Ordergraph == ordengrafica) || undefined;

          if (objeto.Idconfanalyteresult != Idconfanalyteresult) {

            this.closeVentana();
            this.accion = 'noDatos';
            this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYORDERGRAPH2'));

          } else {

            this.configResultsService.update(this.formaRegistroConf.value, this.formaRegistroConf.value.idconfanalyteresult).subscribe(respuesta => {
              this.closeVentana();

              this.getData();
              this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.dateNowISO,
                Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
                Datos: JSON.stringify(this.formaRegistroConf.value),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status
              }

              this.configResultsService.createLogAsync(Loguser).then(respuesta => {

              });
            }, (error) => {

              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.dateNowISO,
                metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
                datos: JSON.stringify(this.formaRegistroConf.value),
                respuesta: error.message,
                tipoRespuesta: error.status
              }
              this.configResultsService.createLogAsync(Loguser).then(respuesta => {

              });
            });

          }

        }

      //} else {
        //this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.INTERPRETATION'));
      //}
    }
  }

  crearEditarConfEdit() {
debugger
    let nomIdresults = this.formaRegistroConfEdit.get('idresultsdictionary').value
    let nuevaData = this.formaRegistroConfEdit.value;
    let arrresults = this.listaResultados.sort((a, b) => {
      a.desresults = a.desresults.charAt(0).toLowerCase() + a.desresults.slice(1);
      b.desresults = b.desresults.charAt(0).toLowerCase() + b.desresults.slice(1);

    })
    arrresults.sort((a, b) => {
      if (a.desresults < b.desresults) return -1;
      if (a.desresults > b.desresults) return 1;
      return 0;
    })

    arrresults.filter(result => {
      if (result.desresults.toLowerCase() === nomIdresults.toLowerCase()) {
        nuevaData.idresultsdictionary = result.idresultsdictionary;
        return
      }
      return
    })

    //if (this.dataTableList.filter(x => x.Interpretation == nuevaData.interpretation).length == 0 ||
      //nuevaData.interpretation == '' ||
      //this.dataTableList.filter(x => x.Interpretation == nuevaData.interpretation && x.Idconfanalyteresult == nuevaData.idconfanalyteresult).length == 1) {
      if (!this.formaRegistroConfEdit.invalid) {

        if (this.tituloAccion == 'Crear') {

          let ordengrafica: number = parseInt(this.formaRegistroConf.get('ordergraph').value);

          let objeto: any;
          objeto = this.dataTable.find(data => data.Ordergraph == ordengrafica) || undefined;

          debugger
          if (objeto != undefined) {

            this.closeVentana();
            this.accion = 'noDatos';
            this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYORDERGRAPH2'));

          } else {
            debugger
            this.desactivar = true;
            this.configResultsService.create(nuevaData).subscribe(respuesta => {

              this.closeVentana();
              this.getData();
              this.accion = 'Crear';
              this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
              this.desactivar = false;

              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.dateNowISO,
                Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
                Datos: JSON.stringify(this.formaRegistroConf.value),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status
              }

              this.configResultsService.createLogAsync(Loguser).then(respuesta => {
              });
            }, (error) => {
              debugger
              console.log(error);

              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.dateNowISO,
                metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
                datos: JSON.stringify(this.formaRegistroConf.value),
                respuesta: error.message,
                tipoRespuesta: error.status
              }
              this.configResultsService.createLogAsync(Loguser).then(respuesta => {
              });
            });

          }

        } else {
        debugger
          //let ordengrafica: number = parseInt(this.formaRegistroConf.get('ordergraph').value);

          let ordengrafica: number = parseInt(nuevaData.ordergraph);

          let Idconfanalyteresult: number = parseInt(nuevaData.idconfanalyteresult);
          let objeto: any;
          objeto = this.dataTable.find(data => data.Ordergraph == ordengrafica) || undefined;

          if (objeto?.Idconfanalyteresult !== Idconfanalyteresult && objeto != undefined) {
            debugger
            this.closeVentana();
            this.accion = 'noDatos';
            this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYORDERGRAPH2'));
          } else {
            debugger
            this.configResultsService.update(nuevaData, this.formaRegistroConfEdit.value.idconfanalyteresult).subscribe(respuesta => {
              this.closeVentana();

              this.getData();
              this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.dateNowISO,
                Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
                Datos: JSON.stringify(this.formaRegistroConf.value),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status
              }

              this.configResultsService.createLogAsync(Loguser).then(respuesta => {

              });
            }, (error) => {
              debugger
              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.dateNowISO,
                metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
                datos: JSON.stringify(this.formaRegistroConf.value),
                respuesta: error.message,
                tipoRespuesta: error.status
              }
              this.configResultsService.createLogAsync(Loguser).then(respuesta => {

              });
            });

          }

        }
      }
    //} else {
     // this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.INTERPRETATION'));
    //}
  }


  updateDos() {
debugger
    let nomIdresults = this.formaRegistroConf.get('idresultsdictionary').value;
    let nuevaData = this.formaRegistroConf.value;
    let arrresults = this.listaResultados.sort((a, b) => {
      a.desresults = a.desresults.charAt(0).toLowerCase() + a.desresults.slice(1);
      b.desresults = b.desresults.charAt(0).toLowerCase() + b.desresults.slice(1);

    })

    arrresults.sort((a, b) => {
      if (a.desresults < b.desresults) return -1;
      if (a.desresults > b.desresults) return 1;
      return 0;
    })

    arrresults.filter(result => {
      if (result.desresults.toLowerCase() === nomIdresults.toLowerCase()) {
        nuevaData.idresultsdictionary = result.idresultsdictionary;
        return
      }
      return
    })

    //qc 38
    //if (this.dataTableList.filter(x => x.Interpretation == nuevaData.interpretation).length == 0 ||
      //nuevaData.interpretation == '' ||
      //this.dataTableList.filter(x => x.Interpretation == nuevaData.interpretation && x.Idconfanalyteresult == nuevaData.idconfanalyteresult).length == 1) {
      if (!this.formaRegistroConf.invalid) {
        let ordengrafica: number = parseInt(this.formaRegistroConf.get('ordergraph').value);

        let objeto: any;
        objeto = this.dataTable.find(data => data.Ordergraph == ordengrafica) || undefined;

        if (objeto != undefined) {

          this.closeVentana();
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYORDERGRAPH2'));

        } else {

          this.desactivar = true;
          this.configResultsService.create(nuevaData).subscribe(respuesta => {

            this.getData();
            this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
            this.desactivar = false;

            this.formaRegistroConf.get('idconfanalyteresult').setValue('')
            this.formaRegistroConf.get('idProgramconf').setValue(this.IdProgramconf)
            this.formaRegistroConf.get('idresultsdictionary').setValue('')
            this.formaRegistroConf.get('ordergraph').setValue('')
            this.formaRegistroConf.get('active').setValue(false)
            this.formaRegistroConf.get('interpretation').setValue('')

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
              Datos: JSON.stringify(nuevaData),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: status
            }

            this.configResultsService.createLogAsync(Loguser).then(respuesta => {
            });
          }, (error) => {
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.dateNowISO,
              metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
              datos: JSON.stringify(nuevaData),
              respuesta: error.message,
              tipoRespuesta: error.status
            }
            this.configResultsService.createLogAsync(Loguser).then(respuesta => {
            });
          });
        }
      }
    //} //else {
      //this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.INTERPRETATION'));
    //}
  }

  crearFormularioConf(datos: any) {

    this.formaRegistroConf = this.fb.group({

      idconfanalyteresult: [datos.Idconfanalyteresult ? datos.Idconfanalyteresult : ''],
      idProgramconf: [datos.IdProgramconf ? datos.IdProgramconf : this.IdProgramconf],
      idresultsdictionary: [datos.Idresultsdictionary ? datos.Idresultsdictionary : '', [Validators.required]],
      ordergraph: [datos.Ordergraph ? datos.Ordergraph : '', [Validators.required]],
      active: [datos.Active ? datos.Active : false],
      interpretation: [datos.interpretation ? datos.interpretation : ''],
    });

  }

  async crearFormularioConfEdit(datos: any) {

    await this.resultsdictionaryQce.getByIdAsync(datos.Idresultsdictionary).then((result: any) => {
      this.desresultspr = result.desresults;
    });
    this.idresultspr = datos.Idresultsdictionary;
    this.formaRegistroConfEdit.get('idconfanalyteresult').setValue(datos.Idconfanalyteresult ? datos.Idconfanalyteresult : '')
    this.formaRegistroConfEdit.get('idProgramconf').setValue(datos.IdProgramconf ? datos.IdProgramconf : this.IdProgramconf)
    this.formaRegistroConfEdit.get('idresultsdictionary').setValue(this.desresultspr.toLowerCase() ? this.desresultspr.toLowerCase() : '')
    this.formaRegistroConfEdit.get('ordergraph').setValue(datos.Ordergraph ? datos.Ordergraph : '')
    this.formaRegistroConfEdit.get('active').setValue(datos.Active ? datos.Active : false)
    this.formaRegistroConfEdit.get('interpretation').setValue(datos.Interpretation ? datos.Interpretation : '')


    await this.resultsdictionaryQce.getAllAsync().then(data => {
      this.listaResultados = data.filter(e => e.active == true);
      this.listaResultados.sort((a: any, b: any) => {
        a.desresults = a.desresults.charAt(0) + a.desresults.slice(1);
        b.desresults = b.desresults.charAt(0) + b.desresults.slice(1);
      })

      this.listaResultados.sort((a: any, b: any) => {
        if (a.desresults < b.desresults) return -1;
        if (a.desresults > b.desresults) return 1;
        return 0;
      })

      this.filteredOptionsresultsEdit = this.formaRegistroConfEdit.get('idresultsdictionary').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterResultadosEdit(value)
        }),
      );
    });

    // this.formaRegistroConf = this.fb.group({

    //   idconfanalyteresult: [datos.Idconfanalyteresult ? datos.Idconfanalyteresult : ''],
    //   idProgramconf: [datos.IdProgramconf ? datos.IdProgramconf : this.IdProgramconf],
    //   idresultsdictionary: [datos.Idresultsdictionary ? datos.Idresultsdictionary : '', [Validators.required]],
    //   ordergraph: [datos.Ordergraph ? datos.Ordergraph : '', [Validators.required]],
    //   active: [datos.Active ? datos.Active : false],

    // });

  } 

  get idresultsdictionaryNoValido() {
    return this.formaRegistroConf.get('idresultsdictionary');
  }

  get ordergraphNoValido() {
    return this.formaRegistroConf.get('ordergraph');
  }

  actualizarEstado(data) {
    const estado = data.Active ? false : true;
    const datos = { idconfanalyteresult: data.Idconfanalyteresult, idProgramconf: data.IdProgramconf, idresultsdictionary: data.Idresultsdictionary, ordergraph: data.Ordergraph, active: estado, interpretation: data.Interpretation }

    this.configResultsService.update(datos, data.Idconfanalyteresult).subscribe(respuesta => {
      this.getData();
      this.accion = 'Editar';
    });
  }


  eliminarConfResult(id: any) {
    this.configResultsService.delete('confResults', id).subscribe(respuesta => {

      this.getData();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.dateNowISO,
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify('sadsa'), // this.idround,
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: status
      }
      this.configResultsService.createLogAsync(Loguser).then(respuesta => {
      });

    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify('dasd'),
          respuesta: err.message,
          tipoRespuesta: err.status
        }
        this.configResultsService.createLogAsync(Loguser).then(respuesta => {
        });

      });
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
  }
  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }
}







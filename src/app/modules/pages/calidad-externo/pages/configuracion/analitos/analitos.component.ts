import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { createLog } from '@app/globals/logUser';
import { AnalitosQceService } from '@app/services/configuracion/analitos-qce.service';
import { SectionsQceService } from '@app/services/configuracion/sections-qce.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-analitos',
  templateUrl: './analitos.component.html',
  styleUrls: ['./analitos.component.css'],
  providers: [DatePipe],
})
export class AnalitosComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroAnalitosQce: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  image: string;
  desactivar = false;
  messageError: string;
  listaSections:any;
  displayedColumns: string[] = ['desanalytes', 'idsection', 'typeresult', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  //predictivos create
  filteredOptionssectionsCreate: Observable<string[]>;
  listsectionscreate: any;

  //predictivo edit
  filteredOptionssectionsEdit: Observable<string[]>;
  idsectionpr: number;
  dessectionspr: any;
  listasectionspre: any;

  formaRegistroAnalitosQceEdit: FormGroup = this.fb.group({
    idanalytes: [],
      desanalytes: [, [Validators.required]],
      idsection: [, [Validators.required]],
      typeresult: [, [Validators.required]],
      active: [],
  });

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  log = new createLog(this.datePipe,this.translate,this.analitosQceService);

  constructor(
    private analitosQceService: AnalitosQceService,
    private sectionsQceService: SectionsQceService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.cargarAnalitosQce();
    this.cargarSections();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  cargarSections() {
    this.sectionsQceService.getAllAsync().then(respuesta => {
      this.listaSections = respuesta.filter(datos => datos.active == true);
    });
  }
  private _filterSectionsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listsectionscreate
      .filter(result =>
        result.dessection.toLowerCase().includes(filterValue)).filter(e => e.active == true)
  }

  private _filtersectionEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listasectionspre
      .filter(result => result.dessection.toLowerCase().includes(filterValue))

  }
  cargarAnalitosQce() {
    this.analitosQceService.getAllAsyncAnalytes().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  async openModalRegistroAnalitosQce(templateRegistroAnalitoQce: TemplateRef<any>, datos: any) {
    this.crearFormularioRegistroAnalitoQce(datos);
    await this.sectionsQceService.getAllAsync().then(data => {
      this.listsectionscreate = data.filter(e => e.active == true);
      this.listsectionscreate.sort((a: any, b: any) => {
        a.dessection = a.dessection.charAt(0) + a.dessection.slice(1);
        b.dessection = b.dessection.charAt(0) + b.dessection.slice(1);
      })

      this.listsectionscreate.sort((a: any, b: any) => {
        if (a.dessection < b.dessection) return -1;
        if (a.dessection > b.dessection) return 1;
        return 0;
      })

      this.filteredOptionssectionsCreate = this.formaRegistroAnalitosQce.get('idsection').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterSectionsCreate(value)
        }),
      );
    });
    this.ventanaModal = this.modalService.show(templateRegistroAnalitoQce,{backdrop: 'static', keyboard: false });
    this.ventanaModal.setClass('modal-lg');
    this.accionEditar = !!datos;
    datos ? this.translate.get('MODULES.ANALITOSQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.ANALITOSQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }
  async openModalRegistroAnalitosQceEdit(templateRegistroAnalitoQce: TemplateRef<any>, datos: any) {
    this.crearFormularioRegistroAnalitoQceEdit(datos);
    this.ventanaModal = this.modalService.show(templateRegistroAnalitoQce,{backdrop: 'static', keyboard: false });
    this.ventanaModal.setClass('modal-lg');
    this.accionEditar = !!datos;
    datos ? this.translate.get('MODULES.ANALITOSQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.ANALITOSQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }
  crearFormularioRegistroAnalitoQce(datos: any) {
    this.formaRegistroAnalitosQce = this.fb.group({
      idanalytes: [datos.Idanalytes ? datos.Idanalytes : ''],
      desanalytes: [datos.Desanalytes ? datos.Desanalytes : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      idsection: [datos.Idsection ? datos.Idsection : '', [Validators.required]],
      typeresult: [datos.Typeresult ? datos.Typeresult : '', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
      active: [datos.Active ? datos.Active : false],
    });
  }
  async crearFormularioRegistroAnalitoQceEdit(datos: any) {

    await this.sectionsQceService.getByIdAsync(datos.Idsection).then((result: any) => {
      this.dessectionspr = result.dessection;
    });

    this.idsectionpr = datos.Idsection;

    this.formaRegistroAnalitosQceEdit.get('idanalytes').setValue(datos.Idanalytes ? datos.Idanalytes : '')
    this.formaRegistroAnalitosQceEdit.get('desanalytes').setValue(datos.Desanalytes ? datos.Desanalytes : '')
    this.formaRegistroAnalitosQceEdit.get('idsection').setValue(this.dessectionspr.toLowerCase() ? this.dessectionspr.toLowerCase() : '')
    this.formaRegistroAnalitosQceEdit.get('typeresult').setValue(datos.Typeresult ? datos.Typeresult : '')
    this.formaRegistroAnalitosQceEdit.get('active').setValue(datos.Active ? datos.Active : false)

    await this.sectionsQceService.getAllAsync().then(data => {
      this.listasectionspre = data.filter(e => e.active == true);
      this.listasectionspre.sort((a: any, b: any) => {
        a.dessection = a.dessection.charAt(0) + a.dessection.slice(1);
        b.dessection = b.dessection.charAt(0) + b.dessection.slice(1);
      })

      this.listasectionspre.sort((a: any, b: any) => {
        if (a.dessection < b.dessection) return -1;
        if (a.dessection > b.dessection) return 1;
        return 0;
      })

      this.filteredOptionssectionsEdit = this.formaRegistroAnalitosQceEdit.get('idsection').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filtersectionEdit(value)
        }),
      );
    });

  }
  get desNoValido() {
    return this.formaRegistroAnalitosQce.get('desanalytes');
  }
  get seccionValido() {
    return this.formaRegistroAnalitosQce.get('idsection');
  }
  get typeNoValido() {
    return this.formaRegistroAnalitosQce.get('typeresult');
  }
  get desNoValidoEdit() {
    return this.formaRegistroAnalitosQceEdit.get('desanalytes');
  }
  get seccionValidoEdit() {
    return this.formaRegistroAnalitosQceEdit.get('idsection');
  }
  get typeNoValidoEdit() {
    return this.formaRegistroAnalitosQceEdit.get('typeresult');
  }
  crearEditarAnalitoQce() {
    let nomIdsections = this.formaRegistroAnalitosQce.get('idsection').value
    let nuevaData = this.formaRegistroAnalitosQce.value;
    let arrsection = this.listaSections.sort((a, b) => {
      a.dessection = a.dessection.charAt(0).toLowerCase() + a.dessection.slice(1);
      b.dessection = b.dessection.charAt(0).toLowerCase() + b.dessection.slice(1);

    })
    arrsection.sort((a, b) => {
      if (a.dessection < b.dessection) return -1;
      if (a.dessection > b.dessection) return 1;
      return 0;
    })

    arrsection.filter(result => {
      if (result.dessection.toLowerCase() === nomIdsections.toLowerCase()) {
        nuevaData.idsection = result.idsection;
        return
      }
      return
    })
    if (!this.formaRegistroAnalitosQce.invalid) {
      if (this.tituloAccion === 'Crear') {

        this.desactivar = true;
        this.closeVentana();
        this.analitosQceService.create(nuevaData).subscribe(respuesta => {

          this.cargarAnalitosQce();
          this.accion = "Crear";
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Analitos','c',this.formaRegistroAnalitosQce.value,JSON.stringify(respuesta),200);
        }, (error) => {
          this.toastr.error(this.translate.instant(error.error));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Analitos','c',this.formaRegistroAnalitosQce.value,error.message,error.status);
        });
      } else {
        this.analitosQceService.update(this.formaRegistroAnalitosQce.value, this.formaRegistroAnalitosQce.value.idanalytes).subscribe(respuesta => {
          this.cargarAnalitosQce();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
          this.closeVentana();
          this.log.logObj('Control Calidad Externo','Configuración','Analitos','a',this.formaRegistroAnalitosQce.value,JSON.stringify(respuesta),200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo','Configuración','Analitos','a',this.formaRegistroAnalitosQce.value,error.message,error.status);
        });
      }
    }
  }

  crearEditarAnalitoQceEditar() {
    let nomIdsections = this.formaRegistroAnalitosQceEdit.get('idsection').value
    let nuevaData = this.formaRegistroAnalitosQceEdit.value;
    let arrsection = this.listaSections.sort((a, b) => {
      a.dessection = a.dessection.charAt(0).toLowerCase() + a.dessection.slice(1);
      b.dessection = b.dessection.charAt(0).toLowerCase() + b.dessection.slice(1);

    })
    arrsection.sort((a, b) => {
      if (a.dessection < b.dessection) return -1;
      if (a.dessection > b.dessection) return 1;
      return 0;
    })

    arrsection.filter(result => {
      if (result.dessection.toLowerCase() === nomIdsections.toLowerCase()) {
        nuevaData.idsection = result.idsection;
        return
      }
      return
    })
    if (!this.formaRegistroAnalitosQceEdit.invalid) {
      if (this.tituloAccion === 'Crear') {

        this.desactivar = true;
        this.closeVentana();
        this.analitosQceService.create(nuevaData).subscribe(respuesta => {

          this.cargarAnalitosQce();
          this.accion = "Crear";
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.log.logObj('Control Calidad Externo','Configuración','Analitos','c',this.formaRegistroAnalitosQce.value,JSON.stringify(respuesta),200);
          this.desactivar = false;
        }, (error) => {
          this.log.logObj('Control Calidad Externo','Configuración','Analitos','c',this.formaRegistroAnalitosQce.value,error.message,error.status);
        });
      } else {

        this.analitosQceService.update(nuevaData, this.formaRegistroAnalitosQceEdit.value.idanalytes).subscribe(respuesta => {
          this.cargarAnalitosQce();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
          this.closeVentana();
          var datos = ('Analito: ' + respuesta.desanalytes + '| ' + 'Sección: '  + this.formaRegistroAnalitosQceEdit.value.idsection + '| tipo resultado:' + this.formaRegistroAnalitosQceEdit.value.typeresult)
          this.log.logObj('Control Calidad Externo','Configuración','Analitos','a',datos,JSON.stringify(respuesta),200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo','Configuración','Analitos','a',this.formaRegistroAnalitosQce.value,error.message,error.status);
        });
      }
    }
  }
  actualizarEstadoAnalitoQce(datosAnalitoQce) {
    const estado = datosAnalitoQce.Active ? false : true;

    const datos = { idanalytes: datosAnalitoQce.Idanalytes, idsection: datosAnalitoQce.Idsection, desanalytes: datosAnalitoQce.Desanalytes, typeresult: datosAnalitoQce.Typeresult, active: estado };
    this.analitosQceService.update(datos, datosAnalitoQce.Idanalytes).subscribe(respuesta => {
      this.cargarAnalitosQce();
    });
  }

  eliminarAnalitoQce(id: any) {
    this.analitosQceService.delete('analytesQces', id).subscribe(respuesta => {
      this.cargarAnalitosQce();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
      this.log.logObj('Control Calidad Externo','Configuración','Lotes','e',id,JSON.stringify(respuesta),200);
    },
      (err: HttpErrorResponse) => {
        this.log.logObj('Control Calidad Externo','Configuración','Lotes','e',id,err.message,err.status);
        this.toastr.error(this.messageError);
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

import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { AppConstants } from '@app/Constants/constants';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { LotMatControlService } from '@app/services/configuracion/lotmatcontrol.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-gestion-lot-material-control',
  templateUrl: './gestion-lot-material-control.component.html',
  styleUrls: ['./gestion-lot-material-control.component.css'],
  providers: [DatePipe],
})
export class GestionLotMaterialControlComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  aceptar: any;
  titulocontrolmat: any;
  desactivar = false;
  textcontrolmat: any;
  listaControlmatXidLot: any;
  formaGestionLotMatControl: FormGroup;
  listaLotes: any;
  lotsActive: any;
  listaControlMaterial: any;
  controlmaterialActive: any;
  listaDetalleLoTMatControl: any[];
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

  //predictivos
  filteredOptionslotsEdit: Observable<string[]>;
  idlotpr: number;
  numlotpr: any;
  listaLotspr: any;

  
  //predictivos create
  filteredOptionsLotsCreate: Observable<string[]>;
  listlotscreate: any;
  filteredOptionsContmatCreate: Observable<string[]>;
  listcontmatcreate: any;


  filteredOptionsControlmaterialEdit: Observable<string[]>;
  idcontrolmaterialpr: number;
  descontmatpr: any;
  listaControlmaterialpr: any;

  formLotContmatEdit: FormGroup = this.fb.group({
    idLotControlMaterial: [],
    idLot: [, [Validators.required]],
    idControlMaterial: [, [Validators.required]],
    active: []
  });

  constructor(private datePipe: DatePipe,
    private translate: TranslateService,
    private lotMatControlService: LotMatControlService,
    private controlMaterialService: ControlMaterialService,
    private lotesService: LotesService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService) { }

  displayedColumns: string[] = ['idlot', 'idcontrolmaterial', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionLotMatControl();
    this.cargarLotes();
    this.cargarControlMaterial();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.titulosSinControlxIdLotMatSwal();
  }

  private _filterlotsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.lotsActive
      .filter(lot =>
        lot.numlot.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filtercntmatCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.controlmaterialActive
      .filter(contmat =>
        contmat.descontmat.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filterLotesEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.lotsActive
      .filter(lot => lot.numlot.toLowerCase().includes(filterValue))

  }

  private _filterContMatEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.controlmaterialActive
      .filter(contmat => contmat.descontmat.toLowerCase().includes(filterValue))

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  async cargarGestionLotMatControl() {

    this.listaDetalleLoTMatControl = await this.lotMatControlService.detalleLotControlMaterial();
    this.dataSource = new MatTableDataSource(this.listaDetalleLoTMatControl);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  async onSelectControlMat(id: number) {

    this.listaControlmatXidLot = await this.lotMatControlService.getByIdAsync(id);

    if (this.listaControlmatXidLot.length == 0) {

      Swal.fire({
        title: `${this.titulocontrolmat}`,
        text: `${this.textcontrolmat}`,
        icon: 'question',
        confirmButtonText: `${this.aceptar}`,
        showConfirmButton: true,
        confirmButtonColor: `${AppConstants.CONFIMRBUTTONCOLOR}`,
      })

    }

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  get lotNoValido() {
    return this.formaGestionLotMatControl.get('idLot');
  }
  get controlMaterialNoValido() {
    return this.formaGestionLotMatControl.get('idControlMaterial');
  }
  get lotNoValidoedit() {
    return this.formLotContmatEdit.get('idLot');
  }
  get controlMaterialNoValidoedit() {
    return this.formLotContmatEdit.get('idControlMaterial');
  }

  async openModalGestionLotMatControl(templateGestionLotMatControl: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionLotMatControl(datos);
    this.listaLotspr = await this.lotesService.getAllAsync();
    this.lotsActive = this.listaLotspr.filter(e => e.expdate > this.fechaActual && e.active);
    this.lotsActive.sort((a, b) => {
      a.numlot = a.numlot.charAt(0).toLowerCase() + a.numlot.slice(1);
      b.numlot = b.numlot.charAt(0).toLowerCase() + b.numlot.slice(1);
    })
    this.lotsActive.sort((a, b) => {
      if (a.numlot < b.numlot) return -1;
      if (a.numlot > b.numlot) return 1;
      return 0;
    })

    this.filteredOptionsLotsCreate = this.formaGestionLotMatControl.get('idLot').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterlotsCreate(value)
      }),
    );

    this.listaControlmaterialpr = await this.controlMaterialService.getAllAsync();
    this.controlmaterialActive = this.listaControlmaterialpr.filter(e => e.active);
    this.controlmaterialActive.sort((a, b) => {
      a.descontmat = a.descontmat.charAt(0).toLowerCase() + a.descontmat.slice(1);
      b.descontmat = b.descontmat.charAt(0).toLowerCase() + b.descontmat.slice(1);
    })
    this.controlmaterialActive.sort((a, b) => {
      if (a.descontmat < b.descontmat) return -1;
      if (a.descontmat > b.descontmat) return 1;
      return 0;
    })

    this.filteredOptionsContmatCreate = this.formaGestionLotMatControl.get('idControlMaterial').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filtercntmatCreate(value)
      }),
    );

    this.vantanaModal = this.modalService.show(templateGestionLotMatControl, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.GESTIONLOTMATCONTROL.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.GESTIONLOTMATCONTROL.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  openModalGestionLotMatControlEdit(templateGestionLotMatControlEdit: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionLotMatControlEdit(datos);

    this.vantanaModal = this.modalService.show(templateGestionLotMatControlEdit, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.GESTIONLOTMATCONTROL.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.GESTIONLOTMATCONTROL.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  crearFormularioGestionLotMatControl(datos: any) {

    this.formaGestionLotMatControl = this.fb.group({
      idLotControlMaterial: [datos.idLotControlMaterial ? datos.idLotControlMaterial : ''],
      idLot: [datos.idLot ? datos.idLot : '', [Validators.required]],
      idControlMaterial: [datos.idControlMaterial ? datos.idControlMaterial : '', [Validators.required]],
      active: [datos.active ? datos.active : false]
    });
  }

  async crearFormularioGestionLotMatControlEdit(datos: any) {

    await this.lotesService.getByIdAsync(datos.IdLot).then((lot: any) => {
      this.numlotpr = lot.numlot;
    });

    await this.controlMaterialService.getByIdAsync(datos.IdControlMaterial).then((contmat: any) => {
      this.descontmatpr = contmat.descontmat;
    });

    this.idlotpr = datos.idLot;
    this.idcontrolmaterialpr = datos.idControlMaterial;

    this.formLotContmatEdit.get('idLotControlMaterial').setValue(datos.IdLotControlMaterial ? datos.IdLotControlMaterial : '')
    this.formLotContmatEdit.get('idLot').setValue(this.numlotpr.toLowerCase() ? this.numlotpr.toLowerCase() : '')
    this.formLotContmatEdit.get('idControlMaterial').setValue(this.descontmatpr.toLowerCase() ? this.descontmatpr.toLowerCase() : '')
    this.formLotContmatEdit.get('active').setValue(datos.Active ? datos.Active : false)

    this.listaLotspr = await this.lotesService.getAllAsync();
    this.lotsActive = this.listaLotspr.filter(e => e.expdate > this.fechaActual && e.active);
    this.lotsActive.sort((a, b) => {
      a.numlot = a.numlot.charAt(0).toLowerCase() + a.numlot.slice(1);
      b.numlot = b.numlot.charAt(0).toLowerCase() + b.numlot.slice(1);
    })
    this.lotsActive.sort((a, b) => {
      if (a.numlot < b.numlot) return -1;
      if (a.numlot > b.numlot) return 1;
      return 0;
    })

    this.filteredOptionslotsEdit = this.formLotContmatEdit.get('idLot').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterLotesEdit(value)
      }),
    );

    this.listaControlmaterialpr = await this.controlMaterialService.getAllAsync();
    this.controlmaterialActive = this.listaControlmaterialpr.filter(e => e.active);
    this.controlmaterialActive.sort((a, b) => {
      a.descontmat = a.descontmat.charAt(0).toLowerCase() + a.descontmat.slice(1);
      b.descontmat = b.descontmat.charAt(0).toLowerCase() + b.descontmat.slice(1);
    })
    this.controlmaterialActive.sort((a, b) => {
      if (a.descontmat < b.descontmat) return -1;
      if (a.descontmat > b.descontmat) return 1;
      return 0;
    })

    this.filteredOptionsControlmaterialEdit = this.formLotContmatEdit.get('idControlMaterial').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterContMatEdit(value)
      }),
    );

    // this.formaGestionLotMatControl = this.fb.group({
    //   idLotControlMaterial: [datos.idLotControlMaterial ? datos.idLotControlMaterial : ''],
    //   idLot: [datos.idLot ? datos.idLot : '', [Validators.required]],
    //   idControlMaterial: [datos.idControlMaterial ? datos.idControlMaterial : '', [Validators.required]],
    //   active: [datos.active ? datos.active : false]
    // });
  }

  crearEditarGestionLotMatControl() {
    let nomIdlote = this.formaGestionLotMatControl.get('idLot').value
    let nuevaData = this.formaGestionLotMatControl.value;
    let arrlotes = this.lotsActive.sort((a, b) => {
      a.numlot = a.numlot.charAt(0).toLowerCase() + a.numlot.slice(1);
      b.numlot = b.numlot.charAt(0).toLowerCase() + b.numlot.slice(1);

    })
    arrlotes.sort((a, b) => {
      if (a.numlot < b.numlot) return -1;
      if (a.numlot > b.numlot) return 1;
      return 0;
    })

    arrlotes.filter(result => {
      if (result.numlot.toLowerCase() === nomIdlote.toLowerCase()) {
        nuevaData.idLot = result.idLot;
        return
      }
      return
    })

    let nomIdcontmat = this.formaGestionLotMatControl.get('idControlMaterial').value

    let arrcontmat = this.controlmaterialActive.sort((a, b) => {
      a.descontmat = a.descontmat.charAt(0).toLowerCase() + a.descontmat.slice(1);
      b.descontmat = b.descontmat.charAt(0).toLowerCase() + b.descontmat.slice(1);

    })
    arrcontmat.sort((a, b) => {
      if (a.descontmat < b.descontmat) return -1;
      if (a.descontmat > b.descontmat) return 1;
      return 0;
    })

    arrcontmat.filter(result => {
      if (result.descontmat.toLowerCase() === nomIdcontmat.toLowerCase()) {
        nuevaData.idControlMaterial = result.idControlMaterial;
        return
      }
      return
    })

    if (!this.formaGestionLotMatControl.invalid) {

      if (this.accion === 'Crear') {

        this.desactivar = true;

        this.lotMatControlService.create(nuevaData).subscribe(respuesta => {

          this.closeVentana();
          this.cargarGestionLotMatControl();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Lote Materiales de control',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formaGestionLotMatControl.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {
            
          });
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Lote Materiales de control',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos: JSON.stringify(this.formaGestionLotMatControl.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {
            
          });

          this.toastr.error(error.error);
          this.desactivar = false;
        });
      } else {

        this.lotMatControlService.update(this.formaGestionLotMatControl.value, this.formaGestionLotMatControl.value.idLotControlMaterial).subscribe(respuesta => {

          this.cargarGestionLotMatControl();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Lote Materiales de control',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formaGestionLotMatControl.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {
          });
        }, (error) => {

          console.log(error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Lote Materiales de control',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formaGestionLotMatControl.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {
            
          });

          this.toastr.error(error.error);
          this.desactivar = false;
        });
      }
    }
  }

  async crearEditarGestionLotMatControlEdit() {

    if (!this.formLotContmatEdit.invalid) {

      let nomIdlot = this.formLotContmatEdit.get('idLot').value
      let nomIdcontrolmaterial = this.formLotContmatEdit.get('idControlMaterial').value
      let nuevaData = this.formLotContmatEdit.value;

      let arrlotes = this.lotsActive.sort((a, b) => {
        a.numlot = a.numlot.charAt(0).toLowerCase() + a.numlot.slice(1);
        b.numlot = b.numlot.charAt(0).toLowerCase() + b.numlot.slice(1);
  
      })
      arrlotes.sort((a, b) => {
        if (a.numlot < b.numlot) return -1;
        if (a.numlot > b.numlot) return 1;
        return 0;
      })
  
      arrlotes.filter(result => {
        if (result.numlot.toLowerCase() === nomIdlot.toLowerCase()) {
          nuevaData.idLot = result.idLot;
          return
        }
        return
      })

      let arrcontmat = this.controlmaterialActive.sort((a, b) => {
        a.descontmat = a.descontmat.charAt(0).toLowerCase() + a.descontmat.slice(1);
        b.descontmat = b.descontmat.charAt(0).toLowerCase() + b.descontmat.slice(1);
  
      })
      arrcontmat.sort((a, b) => {
        if (a.descontmat < b.descontmat) return -1;
        if (a.descontmat > b.descontmat) return 1;
        return 0;
      })
  
      arrcontmat.filter(result => {
        if (result.descontmat.toLowerCase() === nomIdcontrolmaterial.toLowerCase()) {
          nuevaData.idControlMaterial = result.idControlMaterial;
          return
        }
        return
      })

      if (this.accion === 'Crear') {
      } else {

        this.lotMatControlService.update(this.formLotContmatEdit.value, this.formLotContmatEdit.value.idLotControlMaterial).subscribe(respuesta => {

          this.cargarGestionLotMatControl();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Lote Materiales de control',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formLotContmatEdit.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {
          });
        }, (error) => {

          console.log(error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Lote Materiales de control',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formLotContmatEdit.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {
            
          });
          
          this.toastr.error(error.error);
          this.desactivar = false;
        });
      }
    }
  }


  async cargarLotes() {

    this.listaLotes = await this.lotesService.getAllAsync();
    this.lotsActive = this.listaLotes.filter(e => e.expdate > this.fechaActual && e.active);

  }
  async cargarControlMaterial() {
    this.listaControlMaterial = await this.controlMaterialService.getAllAsync();
    this.controlmaterialActive = this.listaControlMaterial.filter(e => e.active);
  }

  actualizarGestionLotMatControl(datoslotcontrol) {
    const estado = datoslotcontrol.Active ? false : true;
    const datos = { idLotControlMaterial: datoslotcontrol.IdLotControlMaterial, idLot: datoslotcontrol.IdLot, idControlMaterial: datoslotcontrol.IdControlMaterial, active: estado }

    this.lotMatControlService.update(datos, datoslotcontrol.IdLotControlMaterial).subscribe(respuesta => {
      this.cargarGestionLotMatControl();
      this.accion = 'Editar';
    }, (error) => {
      this.cargarGestionLotMatControl();
      this.toastr.error(error.error);
    });
  }

  eliminarGestionLotMatControl(id: any) {
    this.lotMatControlService.delete('LotControlMaterials', id).subscribe(respuesta => {

      this.cargarGestionLotMatControl();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Configuración',
        Item:'Lote Materiales de control',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {
        
      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Lote Materiales de control',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {
          
        });
      });
  }

  titulosSinControlxIdLotMatSwal() {
    this.translate.get('MODULES.SWALSINCONTROLXIDLOT.TITULO').subscribe(respuesta => this.titulocontrolmat = respuesta);
    this.translate.get('MODULES.SWALSINCONTROLXIDLOT.TEXT').subscribe(respuesta => this.textcontrolmat = respuesta);
    this.translate.get('MODULES.SWALSINCONTROLXIDLOT.CONFIRM').subscribe(respuesta => this.aceptar = respuesta);
    this.translate.get('MODULES.SWALSINCONTROLXIDLOT.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWALSINCONTROLXIDLOT.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWAL.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWAL.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWAL.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
    this.translate.get('MODULES.SWAL.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }
  closeVentana(): void {
    this.vantanaModal.hide();
  }

}

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe } from '@angular/common';
import { SharedService } from '@app/services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HeaderClientService } from '@app/services/calidad-externo/HeaderClient.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
  providers: [DatePipe],
})
export class ClientesComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroCliente: FormGroup;
  base64textString: any;
  accionEditar: any;
  tituloAccion: any;
  dataTable = [];
  desactivar = false;
  accion: any;
  image: string;
  messageError: string;
  clientant: any;
  nitant: any;
  seleccioneArchivo: string;
  displayedColumns: string[] = ['codeClient', 'name', 'nit', 'addres', 'phone', 'email', 'contact', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  //predictivos create
  filterHeaderClientCreate: Observable<String[]>;
  listHeaderClientCreate: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private clientesService: ClientesService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private sharedService: SharedService,
    private headerClientService: HeaderClientService
  ) { }

  ngOnInit(): void {
    this.cargarClientes();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  cargarClientes() {
    this.clientesService.getAllAsync().then(respuesta => {
      this.dataTable = respuesta;
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  openModalRegistroCliente(templateRegistroCliente: TemplateRef<any>, datos: any) {
    this.crearFormularioRegistroCliente(datos);
    //-----------------------------
    this.LoadHeaderClient();

    if (datos.idclient != null) {
      this.clientant = datos.name;
      this.nitant = datos.nit;
    }
    this.ventanaModal = this.modalService.show(templateRegistroCliente, { backdrop: 'static', keyboard: false });
    this.accionEditar = !!datos;
    this.image = datos.logo;
    datos ? this.translate.get('MODULES.CLIENTES.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.CLIENTES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
    this.ventanaModal.setClass('modal-lg');
  }

  crearFormularioRegistroCliente(datos: any) {

    this.formaRegistroCliente = this.fb.group({
      idclient: [datos.idclient ? datos.idclient : ''],
      name: [datos.name ? datos.name : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      nit: [datos.nit ? datos.nit : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      addres: [datos.addres ? datos.addres : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phone: [datos.phone ? datos.phone : '', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
      email: [datos.email ? datos.email : '', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      contact: [datos.contact ? datos.contact : '', [Validators.required, Validators.minLength(7), Validators.maxLength(150)]],
      logo: [datos.logo ? this.image = datos.logo : this.base64textString],
      active: [datos.active ? datos.active : false],
      header: [datos.header ? datos.header : ''],
      codeClient: [datos.codeClient ? datos.codeClient : '']
    });
  }

  get nameNoValido() {
    return this.formaRegistroCliente.get('name');
  }

  get nitNoValido() {
    return this.formaRegistroCliente.get('nit');
  }

  get addresNoValido() {
    return this.formaRegistroCliente.get('addres');
  }

  get phoneNoValido() {
    return this.formaRegistroCliente.get('phone');
  }

  get emailNoValido() {
    return this.formaRegistroCliente.get('email');
  }

  get contactNoValido() {
    return this.formaRegistroCliente.get('contact');
  }

  crearEditarCliente() {
    if (!this.formaRegistroCliente.invalid) {
      let validateClient = this.listHeaderClientCreate.find(d => d.descriptionHeader == this.formaRegistroCliente.value.name) ? true : false;
      if (validateClient) {
        this.desactivar = true;
        if (this.tituloAccion === 'Crear') {

          let nit = this.formaRegistroCliente.get('nit').value;
          let existeNit = this.dataTable.find(cliente => cliente.nit == nit) || undefined;

          if (existeNit != undefined) {
            this.accion = 'noDatos';
            this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAEXISTENIT'));
          } else {

            let codeClient: string;
            if (this.dataTable.length != 0) {
              codeClient = 'LAB23' + (parseInt(this.dataTable.find(c => c.idclient == Math.max(...this.dataTable.map(c => c.idclient))).codeClient.split("").pop()) + 1).toString().padStart(2, '0');
            } else {
              codeClient = 'LAB2301'
            }

            const datos = {
              idclient: this.formaRegistroCliente.value.idclient,
              name: this.formaRegistroCliente.value.name,
              nit: this.formaRegistroCliente.value.nit,
              addres: this.formaRegistroCliente.value.addres,
              phone: this.formaRegistroCliente.value.phone,
              email: this.formaRegistroCliente.value.email,
              contact: this.formaRegistroCliente.value.contact,
              logo: this.base64textString,
              active: this.formaRegistroCliente.value.active,
              header: this.listHeaderClientCreate.find(h => h.descriptionHeader == this.formaRegistroCliente.value.name).headName,
              codeClient: codeClient
            }

            this.clientesService.create(datos).subscribe(respuesta => {

              this.cargarClientes();
              this.accion = 'Crear';
              this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
              this.base64textString = '';
              this.seleccioneArchivo = '';

              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Externo',
                Submodulo: 'Configuración',
                Item: 'Clientes',
                Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
                Datos: ('Cliente: ' + datos.name + '| ' + 'Nit: ' + datos.nit),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: 200,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }

              this.clientesService.createLogAsync(Loguser).then(respuesta => { });
            }, (error) => {

              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Externo',
                Submodulo: 'Configuración',
                Item: 'Clientes',
                Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
                Datos: ('Cliente: ' + datos.name + '| ' + 'Nit: ' + datos.nit),
                respuesta: error.message,
                tipoRespuesta: error.status,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
              this.clientesService.createLogAsync(Loguser).then(respuesta => { });

            });

          }
        } else {

          let nit = this.formaRegistroCliente.get('nit').value;
          let existeNit = this.dataTable.find(cliente => cliente.nit == nit) || undefined;
          let idcliente = this.formaRegistroCliente.value.idclient;

          if (existeNit != undefined && existeNit.idclient != idcliente) {
            this.accion = 'noDatos';
            this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAEXISTENIT'));
          } else {

            const datos = {
              idclient: this.formaRegistroCliente.value.idclient,
              name: this.formaRegistroCliente.value.name,
              nit: this.formaRegistroCliente.value.nit,
              addres: this.formaRegistroCliente.value.addres,
              phone: this.formaRegistroCliente.value.phone,
              email: this.formaRegistroCliente.value.email,
              contact: this.formaRegistroCliente.value.contact,
              logo: this.base64textString ? this.base64textString : this.image,
              active: this.formaRegistroCliente.value.active,
              header: this.listHeaderClientCreate.find(h => h.descriptionHeader == this.formaRegistroCliente.value.name).headName,
              codeClient: this.formaRegistroCliente.value.codeClient
            }

            this.clientesService.update(datos, this.formaRegistroCliente.value.idclient).subscribe(respuesta => {

              this.cargarClientes();
              this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
              this.base64textString = '';
              this.seleccioneArchivo = '';

              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Externo',
                Submodulo: 'Configuración',
                Item: 'Clientes',
                Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
                Datos: ('Cliente: ' + datos.name + '| ' + 'Nit: ' + datos.nit),
                DatosAnteriores: ('Cliente: ' + this.clientant + '| ' + 'Nit: ' + this.nitant),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: 200,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }

              this.clientesService.createLogAsync(Loguser).then(respuesta => { });

            }, (error) => {

              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Externo',
                Submodulo: 'Configuración',
                Item: 'Clientes',
                Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
                Datos: ('Cliente: ' + datos.name + '| ' + 'Nit: ' + datos.nit),
                DatosAnteriores: ('Cliente: ' + this.clientant + '| ' + 'Nit: ' + this.nitant),
                respuesta: error.message,
                tipoRespuesta: error.status,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }

              this.clientesService.createLogAsync(Loguser).then(respuesta => { });

            });

          }
        }
        this.closeVentana();
        this.desactivar = false;
      } else {
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.VALIDATIONCLIENT'));
      }
    }
  }

  openModalViewImage(templateViewImage: TemplateRef<any>, logo: string) {
    this.ventanaModal = this.modalService.show(templateViewImage, { backdrop: 'static', keyboard: false });
    this.image = logo;
  }

  actualizarEstadoCliente(datosCliente) {
    const estado = datosCliente.active ? false : true;
    const datos = { idclient: datosCliente.idclient, name: datosCliente.name, nit: datosCliente.nit, addres: datosCliente.addres, phone: datosCliente.phone, email: datosCliente.email, contact: datosCliente.contact, logo: datosCliente.logo, active: estado };

    this.clientesService.update(datos, datosCliente.idclient).subscribe(respuesta => {

      this.cargarClientes();

    });
  }

  eliminarCliente(id: any) {
    this.clientesService.delete('clientQce', id).subscribe(respuesta => {

      this.cargarClientes();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo: 'Control Calidad Externo',
        Submodulo: 'Configuración',
        Item: 'Clientes',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.clientesService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });

    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Externo',
          Submodulo: 'Configuración',
          Item: 'Clientes',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.clientesService.createLogAsync(Loguser).then(respuesta => {

        });

      });
  }

  openInputFile(): void {
    const element = document.getElementById('file-1');
    element.click();
  }

  handleFileSelect(evt) {
    const files = evt.target.files;
    const file = files[0];
    var base64: any;
    if (files && file) {
      const reader = new FileReader();
      this.seleccioneArchivo = files[0].name;
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
      console.log(reader)


    }
  }

  _handleReaderLoaded(readerEvt) {
    const binaryString = readerEvt.target.result;
    this.base64textString = btoa(binaryString);
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
    this.titulosSwal();
    this.seleccioneArchivo = '';

  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }

  //#region metodos para los predictivos
  //#region HeaderClient
  private _filterHeaderClientCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listHeaderClientCreate
      .filter(result =>
        result.descriptionHeader.toLowerCase().includes(filterValue));
  }

  async LoadHeaderClient() {
    await this.headerClientService.getAllAsync().then(data => {

      if (data.length == 0) {
        console.log("No hay clientes registrados")
      }

      this.listHeaderClientCreate = data;

      this.listHeaderClientCreate.sort((a: any, b: any) => {
        a.descriptionHeader = a.descriptionHeader.charAt(0) + a.descriptionHeader.slice(1);
        b.descriptionHeader = b.descriptionHeader.charAt(0) + b.descriptionHeader.slice(1);
      })

      this.listHeaderClientCreate.sort((a: any, b: any) => {
        if (a.descriptionHeader < b.descriptionHeader) return -1;
        if (a.descriptionHeader > b.descriptionHeader) return 1;
        return 0;
      })

      this.filterHeaderClientCreate = this.formaRegistroCliente.get('name')
        .valueChanges.pipe(startWith(''), map(value => {
          return this._filterHeaderClientCreate(value)
        }),
        );
    });
  }
  //#endregion
  //#endregion
}

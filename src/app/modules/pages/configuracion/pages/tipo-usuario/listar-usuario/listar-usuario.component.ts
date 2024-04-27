import { Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { UsuariosService } from 'app/services/usuarios/usuarios.service';
import { SidebarService } from 'app/services/general/sidebar.service';
import { PublicService } from '@app/services/public.service';
import { Usuarios } from 'app/Models/Usuarios';
import { AddMenu } from 'app/Models/AddMenu';
import { UserMenu } from 'app/Models/UserMenu';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DateAdapter } from '@angular/material/core';
import dayjs from 'dayjs';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-listar-usuario',
  templateUrl: './listar-usuario.component.html',
  styleUrls: ['./listar-usuario.component.css'],
  providers: [DatePipe],

})


export class ListarUsuarioComponent implements OnInit {


  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  MenusXuserid: any;
  lista: any[];
  user: any;
  permisosUser = [];
  moduleAcess = [];
  formaRegistroParametro: FormGroup;
  today = dayjs().format('YYYY-MM-DD');
  listaSedes: any;
  sedesActive: any;
  listaRoles: any;
  listaDocs: any;
  docsActive: any;
  desactivar = false;
  accionEditar: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  spin: boolean = false;
  titulo: any;
  foto: string;
  text: any;
  cancelar: any;
  confirmar: any;

  menuListAll: any[] = [];
  menuIdsAssigned: any[] = [];
  menuListAssignedDb: any[] = [];
  menuListPendingDb: any[] = [];
  menuListAssigned: any[] = [];
  menuListPending: any[] = [];
  seleccionados: any[] = [];

  formAsignarMenUsuario: FormGroup;
  idUsuario: number;

  nameant:any;
  lastnameant:any;
  usernameant:any;

  constructor(private translate: TranslateService,
    private datePipe: DatePipe,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private usuarioService: UsuariosService,
    private sidebarService: SidebarService,
    private publicService: PublicService,
    private usuariosService: UsuariosService,
    public sidebarservice: SidebarService,
    private _adapter: DateAdapter<any>) { }

  userList: any[];
  displayedColumns: string[] = ['name', 'lastname', 'username', 'email', 'Active', 'permisos', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild('templateAsignarMenu', { read: TemplateRef }) templateAsignarMenu: TemplateRef<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarUsuarios();
    this.obtenerMenu();
    this.cargarRoles();
    this.cargarSedes();
    this.cargarTiposDoc();
    // this.validarPermisosUser();
    this.titulosSwal();
    this._adapter.setLocale('es');
  }

  async ValidateMenusXUser(userId: number) {
    return this.usuariosService.validarUserMenu(userId);
  }

  // async validarPermisosUser() {
  //   const user = sessionStorage.getItem('userid');
  //   this.permisosUser = await this.usuarioService.obtenerPermisosXuser(user);
  //   this.permisosUser.forEach(async (p: any) => {
  //     if (p.eliminar === 0 || p.editar === 0) {
  //       const action = p.eliminar === 0 ? 'editar' : 'borrar';
  //       this.displayedColumns = ['name', 'lastname', 'username', 'email', 'Active', action];
  //       this.userList = await this.usuarioService.listarusuarios();
  //       this.dataSource = new MatTableDataSource(this.userList);
  //     }
  //     const ModuleAccess = await this.usuarioService.ObtenerModule(p.idmoduleaccess);
  //     this.moduleAcess.push(ModuleAccess); // TODO: Validar que se hace con este array, abajo repite código y no se usa en el template

  //     if (ModuleAccess.length > 0) {
  //       this.moduleAcess.push(ModuleAccess);
  //     }
  //   });
  // }

  async cargarUsuarios() {
    this.userList = await this.usuariosService.Listinfousuarios();
    this.dataSource = new MatTableDataSource(this.userList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



  getFoto(foto: File) {
    if( foto != undefined ){
      this.spin = true;
      var reader = new FileReader();
      var base64: any;
      reader.readAsDataURL(foto);
      reader.onload = function () {
        base64 = reader.result;
      };
      setTimeout( () => {
        this.spin = false;
        this.foto = base64.substr(base64.indexOf(',') + 1);
      }, 3000)
    }

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  actualizarEstadoUsuario(datosUsuario) {

    const estado = datosUsuario.active ? false : true;
    const datos = {

      userid: datosUsuario.userid,
      rolid: datosUsuario.rolid,
      typeid: datosUsuario.typeid,
      nrodoc: datosUsuario.nrodoc,
      idparametro: datosUsuario.idparametro,
      tarprof: datosUsuario.tarprof,
      name: datosUsuario.name,
      lastname: datosUsuario.lastname,
      birthdate: datosUsuario.birthdate,
      phone: datosUsuario.phone,
      username: datosUsuario.username,
      pass: datosUsuario.pass,
      email: datosUsuario.email,
      datecreate: datosUsuario.datecreate,
      dateexp: datosUsuario.dateexp,
      ativeexp: datosUsuario.ativeexp,
      superusersede: datosUsuario.superusersede,
      active: estado

    }

    this.usuariosService.updateAsync(datos, datosUsuario.userid).then((data: any) => {
      this.cargarUsuarios();
    }, (error) => {
      // handle the error here, show some alerts, warnings, etc
    });
  }


  get nombreNoValido() {
    return this.formaRegistroParametro.get('nombres');
  }
  get apellidoNoValido() {
    return this.formaRegistroParametro.get('apellidos');
  }
  get usuarioIdNoValido() {
    return this.formaRegistroParametro.get('usuarioId');
  }
  get nombreUsuarioNoValido() {
    return this.formaRegistroParametro.get('nombreUsuario');
  }
  get passwordUsuarioNoValido() {
    return this.formaRegistroParametro.get('pass');
  }
  get tipoDocumentoNoValido() {
    return this.formaRegistroParametro.get('tipoDocumento');
  }
  get numeroDocumentoNoValido() {
    return this.formaRegistroParametro.get('numeroDocumento');
  }
  get celularNoValido() {
    return this.formaRegistroParametro.get('celular');
  }
  get fechaNacimientoNoValido() {
    return this.formaRegistroParametro.get('fechaNacimiento');
  }
  get tarjetaProfesionalNoValido() {
    return this.formaRegistroParametro.get('tarjetaProfesional');
  }
  get correoElectronicoNoValido() {
    return this.formaRegistroParametro.get('correoElectronico');
  }

  get rolNoValido() {
    return this.formaRegistroParametro.get('rol');
  }

  get fechaExpiracionNoValido() {
    return this.formaRegistroParametro.get('fechaExpiracion');
  }


  openModalRegistroUsuario(templateRegistroUsuario: TemplateRef<any>, datos: any) {

    this.spin = false;

    this.crearFormularioRegistroUsuario(datos);

    if(datos.userid != null){

      this.usuariosService.getUser(datos.userid).then((res:any)=>{

        if( res.imagenuser ){

          this.foto = res.imagenuser ;


        } else {
          this.foto = '';
        }

      },(err:any)=>{

      })
    }else{
      this.foto = '';
    }

    this.desactivar = false;

    this.vantanaModal = this.modalService.show(templateRegistroUsuario, { class: 'modal-lg',backdrop: 'static', keyboard: false });




    if (this.formaRegistroParametro.value.userid !== '') {
      this.cargarSedesUsuario();
    }
    this.accionEditar = !!datos;
    this.tituloAccion = !!datos ? 'Editar' : 'Crear';
  }

  closeVentana(): void {
    this.vantanaModal.hide();
  }

  async cargarSedes() {
    this.listaSedes = await this.publicService.obtenerSedes();
    this.sedesActive = this.listaSedes.filter(e => e.active === true);
  }

  async cargarRoles() {
    this.listaRoles = await this.publicService.obtenerRoles();
  }

  async cargarTiposDoc() {
    this.listaDocs = await this.publicService.obtenerTiposDoc();
    this.docsActive = this.listaDocs.filter(e => e.active === true);
    console.log(this.docsActive)
  }

  validaterol() {
    this.usuariosService.validarRol();
  }

  async cargarSedesUsuario() {
    this.user = this.formaRegistroParametro.value.userid;
    const listSedesUser = await this.usuarioService.obtenerSedesXUsuario(this.user);
    for (let i = 0; i < listSedesUser.length; i++) {
      this.lista = listSedesUser[i].desheadquarters; // TODO: validar que se hace con la variable list, no se usa en otro lugar
    }
  }

  crearFormularioRegistroUsuario(datos: any) {


    this.formaRegistroParametro = this.fb.group({
      userid: [datos.userid ? datos.userid : ''],
      typeid: [datos.typeid ? datos.typeid : ''],
      nombres: [datos.name ? datos.name : '', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      apellidos: [datos.lastname ? datos.lastname : '', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      nombreUsuario: [datos.username ? datos.username : '', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      pass: [datos.pass ? datos.pass : '', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      tipoDocumento: [datos.idparametro ? datos.idparametro : '', [Validators.required]],
      numeroDocumento: [datos.nrodoc ? datos.nrodoc : '', [Validators.required]],
      celular: [datos.phone ? datos.phone : '', [Validators.required]],
      fechaNacimiento: [datos.birthdate ? dayjs(datos.birthdate).format() : '', [Validators.required]],
      tarjetaProfesional: [datos.tarprof ? datos.tarprof : '', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      correoElectronico: [datos.email ? datos.email : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      rol: [datos.rolid ? datos.rolid : '', [Validators.required]],
      sede: [datos.superusersede ? datos.superusersede : false],
      fechaCreacion: [datos.datecreate ? dayjs(datos.datecreate).format() : this.today],
      fechaExpiracion: [datos.dateexp ? dayjs(datos.dateexp).format() : '', [Validators.required]],
      Active: [datos.active ? datos.active : false],
    });



    if (datos !== '') {

      //this.formaRegistroParametro.get('pass').setValue('');
      this.formaRegistroParametro.get('pass').clearValidators();

    }


  }

  changeDate( id: string ){

    let fechaVencimiento = document.getElementById(id);
    fechaVencimiento.classList.remove('is-valid');

  }

  crearEditarUsusario() {

    var iduser = this.formaRegistroParametro.value.userid;

      this.usuarioService.getByIdAsync(iduser).then((datauserant: any) => {

        this.nameant = datauserant.name;
        this.lastnameant = datauserant.lastname;
        this.usernameant = datauserant.username;

      }).catch(error => {});

    if (!this.formaRegistroParametro.invalid) {
      const usuarioCreate: Usuarios = {
        rolid: this.formaRegistroParametro.get('rol').value,
        typeid: this.formaRegistroParametro.get('tipoDocumento').value,
        name: this.formaRegistroParametro.get('nombres').value,
        lastname: this.formaRegistroParametro.get('apellidos').value,
        nrodoc: this.formaRegistroParametro.get('numeroDocumento').value,
        idparametro: this.formaRegistroParametro.get('tipoDocumento').value,
        tarprof: this.formaRegistroParametro.get('tarjetaProfesional').value,
        birthdate: this.formaRegistroParametro.get('fechaNacimiento').value,
        phone: this.formaRegistroParametro.get('celular').value,
        username: this.formaRegistroParametro.get('nombreUsuario').value,
        pass: this.formaRegistroParametro.get('pass').value,
        email: this.formaRegistroParametro.get('correoElectronico').value,
        datecreate: this.formaRegistroParametro.get('fechaCreacion').value,
        dateexp: this.formaRegistroParametro.get('fechaExpiracion').value,
        ativeexp: this.formaRegistroParametro.get('Active').value,
        active: this.formaRegistroParametro.get('Active').value,
        superusersede: this.formaRegistroParametro.get('sede').value,
        imagenuser: this.foto != '' ? this.foto : ''
      };


      if (this.tituloAccion === 'Crear') {
        this.desactivar = true;
        this.usuarioService.createAsync(usuarioCreate).then((data: any) => {
          this.closeVentana();
          this.cargarUsuarios();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;
          this.formaRegistroParametro.reset();
          this.openModalAsignarMenu(this.templateAsignarMenu, data);
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Usuarios',
            Item:'Usuario',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Nombre: ' + usuarioCreate.name + '| ' + 'Apellido: ' + usuarioCreate.lastname+ '| ' + 'Username: ' + usuarioCreate.username),
            Respuesta: JSON.stringify(usuarioCreate),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          };
          this.usuariosService.createLogAsync(Loguser).then(respuesta => {
          });
          this.desactivar = false;

        }, (error:any) => {

          this.toastr.error(this.translate.instant( error.error.error));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Usuarios',
            Item:'Usuario',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Nombre: ' + usuarioCreate.name + '| ' + 'Apellido: ' + usuarioCreate.lastname+ '| ' + 'Username: ' + usuarioCreate.username),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          };
          this.usuarioService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      } else {
        const usuarioUpdate: Usuarios = {
          userid: this.formaRegistroParametro.get('userid').value,
          rolid: this.formaRegistroParametro.get('rol').value,
          typeid: this.formaRegistroParametro.get('tipoDocumento').value,
          name: this.formaRegistroParametro.get('nombres').value,
          lastname: this.formaRegistroParametro.get('apellidos').value,
          nrodoc: this.formaRegistroParametro.get('numeroDocumento').value,
          idparametro: this.formaRegistroParametro.get('tipoDocumento').value,
          tarprof: this.formaRegistroParametro.get('tarjetaProfesional').value,
          birthdate: this.formaRegistroParametro.get('fechaNacimiento').value,
          phone: this.formaRegistroParametro.get('celular').value,
          username: this.formaRegistroParametro.get('nombreUsuario').value,
          pass: this.formaRegistroParametro.get('pass').value,
          email: this.formaRegistroParametro.get('correoElectronico').value,
          datecreate: this.formaRegistroParametro.get('fechaCreacion').value,
          dateexp: this.formaRegistroParametro.get('fechaExpiracion').value,
          ativeexp: this.formaRegistroParametro.get('Active').value,
          active: this.formaRegistroParametro.get('Active').value,
          superusersede: this.formaRegistroParametro.get('sede').value,
          imagenuser: this.foto != '' ? this.foto : ''

        };

        const Userid = this.formaRegistroParametro.value.userid;
        this.usuarioService.updateAsync(usuarioUpdate, Userid).then((data: any) => {
          this.closeVentana();
          this.cargarUsuarios();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Usuarios',
            Item:'Usuario',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Nombre: ' + usuarioUpdate.name + '| ' +'Apellido: ' + usuarioUpdate.lastname + '| ' + 'Username: ' + usuarioUpdate.username),
            DatosAnteriores: ('Nombre: ' + this.nameant + '| ' + 'Apellido: ' + this.lastnameant + '| ' + 'Username: ' + this.usernameant),
            Respuesta: JSON.stringify(usuarioUpdate),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')

          };
          this.usuariosService.createLogAsync(Loguser).then(respuesta => {
          });
        }, (error) => {
          // handle the error here, show some alerts, warnings, etc
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Usuarios',
            Item:'Usuario',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Nombre: ' + usuarioUpdate.name + '| ' +'Apellido: ' + usuarioUpdate.lastname + '| ' + 'Username: ' + usuarioUpdate.username),
            DatosAnteriores: ('Nombre: ' + this.nameant + '| ' + 'Apellido: ' + this.lastnameant + '| ' + 'Username: ' + this.usernameant),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          };
          this.usuarioService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }
  }

  titulosSwal() {
    this.translate.get('MODULES.SWALUSUARIO.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWALUSUARIO.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWALUSUARIO.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWALUSUARIO.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
  }

  eliminarUsuario(id: any) {

    var useridant = id;
    var nameuser = null;
    var lastnameuser = null;
    var username = null;
    this.usuariosService.getByIdAsync(useridant).then((datauser: any) => {

      nameuser = datauser.name;
      lastnameuser = datauser.lastname;
      username = datauser.username;

    });


    this.usuariosService.deleteAsync(id).then((data: any) => {

      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
      this.cargarUsuarios();

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Configuración',
        Submodulo: 'Usuarios',
        Item:'Usuario',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: (id + '| ' + nameuser + '| ' + lastnameuser + '| ' + username),
        respuesta: JSON.stringify(data),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      };
      this.usuarioService.createLogAsync(Loguser).then(respuesta => {
      });

    }, (error) => {
      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Configuración',
        Submodulo: 'Usuarios',
        Item:'Usuario',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: (id + '| ' + nameuser + '| ' + lastnameuser + '| ' + username),
        respuesta: error.message,
        tipoRespuesta: error.status,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      };
      this.usuarioService.createLogAsync(Loguser).then(respuesta => {
      });
    });

  }

  // asignacionMenu
  async openModalAsignarMenu(templateAsignarMenu: TemplateRef<any>, datos: any) {


    if( datos.userid ){

      this.asignarMenUsuarioFormulario(datos);
      this.idUsuario = datos.userid;
      this._getAllDataMenus();

    } else {

      this.asignarMenUsuarioFormulario(datos);
      this.idUsuario = datos.id;
      this._getAllDataMenus();

    }

    this.vantanaModal = this.modalService.show(templateAsignarMenu,{ class: 'modal-lg',backdrop: 'static', keyboard: false });

  }

  private async _getAllDataMenus() {
    this.menuIdsAssigned = await this.ValidateMenusXUser(this.idUsuario);

    this.MenusXuserid = await this.usuarioService.obtenerMenu()
    this.MenusXuserid.forEach((m: any) => {
     if(m.menuIcon != ''){
      m.menuIcon =  m.menuIcon.replace('iconos', 'iconosModal')
     }
     var filtro = this.menuIdsAssigned.filter(dato => dato.menuid == m.idMenu);

      if(filtro.length > 0){
       m.activeMenu = true
       m.id = filtro[0].id
      }else{
       m.activeMenu = false
       m.id = null
      }
      m.items.forEach((val:any)=>{
        if(val.menuIcon != ''){
          val.menuIcon =  val.menuIcon.replace('iconos', 'iconosModal')
            }
            var filtroSubMenu = this.menuIdsAssigned.filter(dato => dato.menuid == val.idMenu);


            if(filtroSubMenu.length > 0){
              val.activeSubMenu = true
              val.id = filtroSubMenu[0].id
            }else{
              val.activeSubMenu = false
              val.id = null
            }
            val.items.forEach((data:any)=>{
              var filtroSubMenu = this.menuIdsAssigned.filter(dato => dato.menuid == data.idMenu);
              if(filtroSubMenu.length > 0){
                data.activeSubMenu = true
                data.id = filtroSubMenu[0].id
              }else{
                data.activeSubMenu = false
                data.id = null
              }
            })
          })


    });

  }

  // TODO: Validar esta función, no se usa en ningún lado
  async openModalActualizarMenu(templateAsignarMenu: TemplateRef<any>, datos: any) {
    this.menuListAll = await this.sidebarService.obtenerMenuXUser(datos.userid);

    this.asignarMenUsuarioFormulario(datos);
    this.vantanaModal = this.modalService.show(templateAsignarMenu,{backdrop: 'static', keyboard: false });
    this.vantanaModal.setClass('modal-lg');
  }

  async obtenerMenu() {
    this.menuListAll = await this.sidebarService.obtenerMenu();
  }
  async crearEditar(data:any){

  if(data.id == null){
    const menu = {
      userid: this.idUsuario,
      menuid: data.idMenu
    }
    const resp = await this._saveUserMenu(menu);
    this._getAllDataMenus();


  }else{
    const resp = await this._deleteUserMenu(data.id);
    if (resp && resp.id && resp.id === data.id) {
      this._getAllDataMenus();
    }
  }
  }

  async dropped(event: CdkDragDrop<any[]>, action: 'add' | 'remove') {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
      const items = event.container.data;
      const menuIdsArray = this.menuListAssignedDb.map((i: any) => i.menuid);
      if (action === 'add') {
        const menu = items.find((m: any) => !menuIdsArray.includes(m.menuid));
        const resp = await this._saveUserMenu(menu);
        if (resp && resp.menuid && resp.menuid === menu.menuid) {
          this._getAllDataMenus();
        }
      } else {
        const menu = items.find((m: any) => menuIdsArray.includes(m.menuid));
        const itemRemove = this.menuIdsAssigned.find((i: any) => i.menuid === menu.menuid);
        const resp = await this._deleteUserMenu(itemRemove.id);
        if (resp && resp.id && resp.id === itemRemove.id) {
          this._getAllDataMenus();
        }
      }
    }
  }

  private _saveUserMenu(menuItem: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const InsertMenu: UserMenu = {
        userid: this.idUsuario,
        menuid: menuItem.menuid
      };
      this.usuariosService.usermenusSave(InsertMenu).subscribe(respuesta => {
        resolve(respuesta);
        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.MENU_ASIGNADO'));
      }, (error) => {
        // handle the error here, show some alerts, warnings, etc
        reject(error);
      });
    });
  }

  private _deleteUserMenu(id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.usuariosService.usermenusDelete(id).subscribe(respuesta => {
        resolve(respuesta);
        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.MENU_DESASIGNADO'));
      }, (error) => {

        reject(error);
      });
    });
  }

  async onSelect(id: number) {
    const user = sessionStorage.getItem('userid');
    const user1 = this.formAsignarMenUsuario.value.id;
    const menu = this.formAsignarMenUsuario.value.menuid;

    const InsertMenu: UserMenu = {
      userid: user1,
      menuid: menu,
    };

    this.usuariosService.createUserMenu(InsertMenu).subscribe(respuesta => {
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.MENU_ASIGNADO'));
    }, (error) => {
      // handle the error here, show some alerts, warnings, etc
    });
    // this.submenuList = await this.sidebarService.obtenerSubMenuXuser(id, user);
  }

  asignarMenUsuarioFormulario(datos: any) {
    this.formAsignarMenUsuario = this.fb.group({
      id: [datos.Userid ? datos.Userid : ''],
      menuid: ['', Validators.required],
      submenu: ['', Validators.required],
    });
  }

  // TODO: Validar en donde se está usando
  asignarEditarMenUsuario() {
    const user1 = this.formAsignarMenUsuario.value.id;

    for (let i = 0; i < this.menuListAll.length; i++) {
      const accion = this.seleccionados[i].accion;
      const url = this.seleccionados[i].url;
      const valMenuid = this.seleccionados[i].menuid;

      const insertSubMenuser: AddMenu = {
        userid: user1,
        menuid: valMenuid,
        accion,
        url,
      };

      this.usuariosService.create(insertSubMenuser).subscribe(respuesta => {
        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.MENU_ASIGNADO'));
      }, (error) => {
        // handle the error here, show some alerts, warnings, etc
      });

    }
  }
  //// desarrollo Fabian
}
import { Component, OnInit, TemplateRef, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigateService } from '@app/services/general/navigate.service';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { SidebarService } from '@app/services/general/sidebar.service';
import { NavigationEnd, Router } from '@angular/router';
import { MenuLevel3 } from '@app/Models/MenuLevel3';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  animations: [
    trigger('slide', [
      state('up', style({ height: 0 })),
      state('down', style({ height: '*' })),
      transition('up <=> down', animate(200)),
    ]),
  ],
})


export class MenuComponent implements OnInit {

  foto: string;

  formEditPerfil: FormGroup;

  accionEditar: any;
  tituloAccion: any;
  updateUser: any[];
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  spin: boolean = false;
  cancelar: any;
  confirmar: any;

  textUser: any;
  rolname: any;
  nombreRol = '';
  roluser: any;
  username: any;
  iduser: any;
  validuser: any;

  MenusXuserid: any;
  activeMenu = false;
  typeMenu = 'dropdown';

  menuList: any[] = [];
  subMenulist = [];
  moduleAcess = [];
  menus = [];
  urlSelected: string;
  tiempo: any;

  menuAll: Array<MenuLevel3> = [];

  constructor(
    private translate: TranslateService,
    public sidebarservice: SidebarService,
    public userService: UsuariosService,
    private navigateService: NavigateService,
    private sharedService: SharedService,
    private router: Router,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private usuariosService: UsuariosService) {
    this.menus = sidebarservice.getMenuList();
  }

  async ngOnInit() {

    this.foto = sessionStorage.getItem('imagenuser') || '';
    this.iduser = sessionStorage.getItem('userid');
    this.username = sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos');
    this.validuser = sessionStorage.getItem('rolid'); 

    await this.cargarMenus();
    this.rolUsuarioLogueado();
  }

  async openModalEditPerfil(templateEditPerfilUser: TemplateRef<any>, datos: any) {


    const UserEdit = await this.userService.detalleAsistente(datos);
    this.EditFormularioPerfil(UserEdit);

    this.vantanaModal = this.modalService.show(templateEditPerfilUser, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;

  }

  getFoto(foto: File) {

    if (foto != undefined) {

      this.spin = true;
      var reader = new FileReader();
      var base64: any;
      reader.readAsDataURL(foto);
      reader.onload = function () {

        base64 = reader.result;

      };

      setTimeout(() => {

        this.spin = false;
        this.foto = base64.substr(base64.indexOf(',') + 1);

      }, 3000)


    }

  }

  EditFormularioPerfil(datos: any) {

    datos.rolid == 1 ? this.nombreRol = 'Administrador' : datos.rolid == 2 ? this.nombreRol = 'Coordinador' : datos.rolid == 3 ? this.nombreRol = 'Bacteriologo' : this.nombreRol = 'Cliente';

    this.formEditPerfil = this.fb.group({

      userid: [datos.userid],
      typeid: [datos.typeid],
      name: [datos.name, [Validators.required]],
      lastname: [datos.lastname],
      username: [datos.username],
      pass: [''],
      idparametro: [datos.idparametro],
      nrodoc: [datos.nrodoc],
      phone: [datos.phone, [Validators.required]],
      birthdate: [datos.birthdate],
      tarprof: [datos.tarprof],
      email: [datos.email, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      rolid: [datos.rolid],
      active: [datos.active],
      superusersede: [datos.superusersede],
      datecreate: [datos.datecreate],
      dateexp: [datos.dateexp],
      ativeexp: [datos.ativeexp],

    });

  }

  EditarPerfilUsuario() {

    if (this.formEditPerfil.valid) {

      var data = this.formEditPerfil.value;

      const imagen = {
        imagenuser: this.foto
      }

      const datos = Object.assign(data, imagen);

      this.userService.updateAsync(datos, this.formEditPerfil.value.userid).then(_ => {

        sessionStorage.removeItem('imagenuser');
        sessionStorage.setItem('imagenuser', this.foto);
        window.location.reload();

      });

      this.username = this.formEditPerfil.value.name + this.formEditPerfil.value.lastname;
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.USUARIO_ACTUALIZADO'));

    }

  }

  closeVentana(): void {
    this.vantanaModal.hide();
  }

  async rolUsuarioLogueado() {
    const userid = sessionStorage.getItem('userid');
    this.roluser = await this.sidebarservice.obtenerNombreRolxuserid(userid);
    this.roluser.forEach(item => {
      this.rolname = item.rol.namerol;
    });
  }


  async cargarMenus() {
    const userid = sessionStorage.getItem('userid');
    this.MenusXuserid = await this.sidebarservice.obtenerMenus(userid);
    this.MenusXuserid = this.MenusXuserid.map(((m: any) =>
    ({
      ...m,
      Active: false,
      items: m.items.map((s: any) => ({ ...s, Active: false }))
    })
    ));
    this._mapMenu3Level();
  }

  async cargarMenu(getMenuXUser: boolean) { // TODO: Revisar si se está usando
    const user = sessionStorage.getItem('userid');
    this.menuList = getMenuXUser ? await this.sidebarservice.obtenerMenuXUser(user) : await this.sidebarservice.obtenerMenu();

    this.menuList.forEach(async (m: any) => {
      const subMenu = await this.sidebarservice.obtenerSubMenuXuser(
        m.menuid,
        user
      );

      if (subMenu.length > 0) {
        this.subMenulist.push(subMenu);
      }

    });

  }

  // async validarPermisosUser() {
  //   const user = sessionStorage.getItem('userid');
  //   const permisosUser = await this.sidebarservice.obtenerPermisosXuser(user);

  //   for (let i = 0; i < permisosUser.length; i++) {
  //     const ModuleAccess = await this.sidebarservice.ObtenerModule(
  //       permisosUser[i].idmoduleaccess
  //     );
  //     this.moduleAcess.push(ModuleAccess);

  //     if (ModuleAccess.length > 0) {
  //       this.moduleAcess.push(ModuleAccess);
  //     }
  //   }
  // }

  private _mapMenu3Level(): void {
    this.MenusXuserid.forEach((m1: any) => {
      if (m1.items.length <= 0) {
        this.addMenuLevel(m1.label, m1.Url);
        return;
      }
      m1.items.forEach((m2: any) => {
        if (m2.items.length <= 0) {
          this.addMenuLevel(m1.label, m1.Url, m2.label, m2.Url);
          return;
        }
        m2.items.forEach((m3: any) => {
          this.addMenuLevel(m1.label, m1.Url, m2.label, m2.Url, m3.label, m3.Url);
        });
      });
    });
    this.sharedService.setMenu = this.menuAll;
  }

  private addMenuLevel(label1: string, url1: string, label2: string = '', url2: string = '', label3: string = '', url3: string = ''): void {
    const menuLevel3: MenuLevel3 = {
      menuNameLevel1: label1,
      menuUrlLevel1: url1,
      menuNameLevel2: label2,
      menuUrlLevel2: url2,
      menuNameLevel3: label3,
      menuUrlLevel3: url3,
    };
    this.menuAll.push(menuLevel3);
  }

  getSideBarState() {
    return this.sidebarservice.getSidebarState();
  }

  toggle(currentMenu): void {
    if (this.typeMenu === 'dropdown') {
      this.MenusXuserid.forEach((element) => {
        if (element === currentMenu) {
          currentMenu.Active = !currentMenu.Active;
        } else {
          element.Active = false;
        }
      });
    }
  }

  togglesubMenu(currentSubmenu): void {
    this.MenusXuserid.forEach((data: any) => {
      data.items.forEach((data_elemento: any) => {
        data_elemento.Active = false
      })
    })

    this.MenusXuserid = this.MenusXuserid.map((menu: any) => {
      return {

        ...menu,
        items: this.mapSubmenus(currentSubmenu, menu),
      };
    });
    console.log(this.MenusXuserid)

  }

  mapSubmenus(currentSubmenu, menu): any[] {

    return menu.items.map((s: any) => ({
      ...s,
      Active: currentSubmenu.idMenu === s.idMenu && s.items.length > 0 ? !s.Active : s.Active,
    }));
  }

  getStateItemsMenu(item: any): string {
    return item.Active ? 'down' : 'up';
  }

  hasBackgroundImage() {
    return this.sidebarservice.hasBackgroundImage;
  }

  toggleSidebar() {
    this.sidebarservice.setSidebarState(!this.sidebarservice.getSidebarState());
  }

  async logout() {
    this.userService.logout();
    this.navigateService.goToLogin();
  }

  public navigate(url: string): void {
    if (url !== '#') {
      this.router.navigate(['/panel/' + url]);
      this.urlSelected = url;
    }
  }
}

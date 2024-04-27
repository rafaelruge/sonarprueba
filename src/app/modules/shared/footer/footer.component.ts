import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(
    public userService: UsuariosService
    ) {
  }
  public config: {version: string};
  ngOnInit(): void {
    this.config = require("../../../../assets/config.json");
  }

  showMenu() {
    if (this.userService.obtenerToken() != null) {
      return true;
    } else {
      return false;
    }
  }
}

import { DatePipe } from "@angular/common";
import { Component, OnInit, TemplateRef } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { ToastrService } from "ngx-toastr";
import { PreIndicadoresService } from "@app/services/pre-analitico/pre-indicadores.service";
import { MatTableDataSource } from "@angular/material/table";
import { HttpErrorResponse } from "@angular/common/http";
import { PreAreasService } from "@app/services/pre-analitico/pre-areas.service";
import { PreTurnosService } from "@app/services/pre-analitico/pre-turnos.service";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { UnitsQceService } from "@app/services/calidad-externo/unitsQce.service";
import { NgxSpinnerService } from "ngx-spinner";

// ---------Interfaces----------------
interface Indicador {
  idindicators: number;
  nameindicators: string;
  idarea: number;
  idturns: number;
  descriptionindicators: string;
  aim: number;
  unitofmeasurement: string;
  measurementfrequency: string;
  sourceofinformation: string;
  responsiblemeasurement: string;
  headanalysis: string;
  active: boolean;
}

@Component({
  selector: "app-indicadores-confg",
  templateUrl: "./indicadores-confg.component.html",
  styleUrls: ["./indicadores-confg.component.css"],
  providers: [DatePipe],
})
export class IndicadoresConfgComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();

  indicador: any;
  accionEditar: any;
  tituloAccion: any;
  accion: any;

  ventanaModal: BsModalRef;
  formulario: FormGroup;
  desactivar = false;
  messageError: string;

  dataSource: MatTableDataSource<any>;
  indicadoresArr = [];
  turnosArrTodo = [];
  turnosArrDone = [];
  areasArrTodo = [];
  areasArrDone = [];
  unidadesArr = [];
  menuListPending: any[] = [];
  turnosPending: any[] = [];

  sendArr = [];

  homeBtnHide: boolean = true;
  selectIndHide: boolean = false;
  page1Hide: boolean = true;
  page2Hide: boolean = true;
  page3Hide: boolean = true;
  tituloInd: string = "";
  IndSelected: number = -1;
  formShow: boolean = false;
  indFound: any;

  //------------------

  constructor(
    private fb: FormBuilder,
    private preIndicadoresService: PreIndicadoresService,
    private preAreasService: PreAreasService,
    private preTurnosService: PreTurnosService,
    private unitsQceService: UnitsQceService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.cargarIndicadores();
    this.cargarAreas();
    this.cargarTurnos();
    //this.cargarUnidades();

    //this.crearFormularioIndcador();
    this.titulosSwal();
  }

  //----------formulario------------

  // get nameindicatorsNoValido() {
  //   return this.formulario.get("nameindicators");
  // }

  get measurementfrequencyNoValido() {
    return this.formulario.get("measurementfrequency");
  }

  get aimNoValido() {
    return this.formulario.get("aim");
  }

  get unitofmeasurementNoValido() {
    return this.formulario.get("unitofmeasurement");
  }

  get sourceofinformationNoValido() {
    return this.formulario.get("sourceofinformation");
  }

  get responsiblemeasurementNoValido() {
    return this.formulario.get("responsiblemeasurement");
  }

  get headanalysisNoValido() {
    return this.formulario.get("headanalysis");
  }

  get descriptionindicatorsNoValido() {
    return this.formulario.get("descriptionindicators");
  }

  //----------------------------
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    //------Areas Validación------------


    const areaFilterFound = this.areasArrDone.filter(
      (element) => element.desarea !== "Todas"
    );


    const areaTodaFound = this.areasArrDone.find(
      (element) => element.desarea == "Todas"
    );



    if (areaTodaFound != undefined) {
      this.areasArrDone = [areaTodaFound];

      areaFilterFound.forEach((item) => this.areasArrTodo.push(item));

      this.areasArrTodo.forEach((item) => {
        item.disabled = true;
      });
    } else {
      this.areasArrTodo.forEach((item) => {
        item.disabled = false;
      });
    }
    //------Turnos Validación------------


    const turnoFilterFound = this.turnosArrDone.filter(
      (element) => element.desturns !== "Completo"
    );


    const turnoTodaFound = this.turnosArrDone.find(
      (element) => element.desturns == "Completo"
    );



    if (turnoTodaFound != undefined) {
      this.turnosArrDone = [turnoTodaFound];

      turnoFilterFound.forEach((item) => this.turnosArrTodo.push(item));

      this.turnosArrTodo.forEach((item) => {
        item.disabled = true;
      });
    } else {
      this.turnosArrTodo.forEach((item) => {
        item.disabled = false;
      });
    }

    // armardo Array con data para configurar

    this.sendArr = [];

    this.areasArrDone.forEach((item) => {
      let idarea = {
        idarea: item.idarea,
      };
      this.sendArr.push(idarea);
    });
    this.turnosArrDone.forEach((item) => {
      let idturns = {
        idturns: item.idturns,
      };
      this.sendArr.push(idturns);
    });
  }
  //----------------------------

  cargarIndicadores() {
    this.preIndicadoresService.getAllAsync().then((respuesta) => {
      console.log(respuesta);


      if (respuesta) {
        this.indicadoresArr = respuesta;
        //this.dataSource = new MatTableDataSource(respuesta);

        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
      }
    });
  }

  cargarTurnos() {
    this.preTurnosService.getAllAsync().then((respTurnos) => {
      if (respTurnos) {
        respTurnos.forEach((item) => {
          const itemTurno = {
            desturns: item.desturns,
            idturns: item.idturns,
            tbIndicatorsPre: item.tbIndicatorsPre,
            active: item.active,
            disabled: false,
          };

          this.turnosArrTodo.push(itemTurno);
        });


      }
    });
  }

  cargarAreas() {
    this.preAreasService.getAllAsync().then((respAreas) => {
      if (respAreas) {
        respAreas.forEach((item) => {
          const itemArea = {
            desarea: item.desarea,
            idarea: item.idarea,
            tbIndicatorsPre: item.tbIndicatorsPre,
            active: item.active,
            disabled: false,
          };

          this.areasArrTodo.push(itemArea);
        });


      }
    });
  }
  cargarUnidades() {
    this.unitsQceService.getAllAsync().then((respuesta) => {
      if (respuesta) {
        this.unidadesArr = respuesta;

      }
    });
  }
  // infoIndicador() {
  //   this.preIndicadoresService
  //     .getDatosIndicador(this.indFound.nameindicators)
  //     .subscribe((respuesta: any) => {

  //       const arrayIds = respuesta.map((m: any) => m.Idarea);
  //       const arrayTurnos = respuesta.map((m: any) => m.Desturns);

  //       this.areasArrDone = [];
  //       this.menuListPending = [];

  //       this.turnosArrDone = [];
  //       this.turnosPending = [];

  //       this.areasArrTodo.forEach((m: any) => {
  //         if (arrayIds.includes(m.idarea)) {
  //           this.areasArrDone.push(m);
  //         } else {
  //           this.menuListPending.push(m);
  //         }
  //       });

  //       this.turnosArrTodo.forEach((m: any) => {
  //         if (arrayTurnos.includes(m.desturns)) {
  //           this.turnosArrDone.push(m);
  //         } else {
  //           this.turnosPending.push(m);
  //         }
  //       });
  //     });
  // }

  //-------back Home-----
  getHome() {
    this.cargarIndicadores();
    this.homeBtnHide = true;
    this.selectIndHide = false;
    this.page1Hide = true;
    this.page2Hide = true;
    this.page3Hide = true;
  }

  getBackPage2() {
    this.homeBtnHide = false;
    this.selectIndHide = true;
    this.page1Hide = false;
    this.page2Hide = true;
    this.page3Hide = true;
  }

  getBackPage3() {
    if (this.IndSelected == 1) {
      this.homeBtnHide = false;
      this.selectIndHide = true;
      this.page1Hide = true;
      this.page2Hide = false;
      this.page3Hide = true;
    } else {
      this.getBackPage2();
    }
  }

  // -------------------------
  // --- configura solo Q2 ----
  // -------------------------
  getNext2() {
    if (this.areasArrDone.length == 0 || this.turnosArrDone.length == 0) {
      return;
    }

    this.spinner.show();



    const IndQ2Found = this.indicadoresArr.filter(
      (element) => element.nameindicators == this.tituloInd
    );



    if (IndQ2Found != undefined) {
      IndQ2Found.forEach(async (item) => {
        await this.eliminarIndicador(item.idindicators);
      });
    }

    setTimeout(() => {
      this.sendArr.forEach(async (item) => {
        if (item.idarea) {
          this.formulario.get("idarea").setValue(item.idarea);
        }
        if (item.idturns) {
          this.formulario.get("idturns").setValue(item.idturns);
        }

        // this.tituloAccion = 'Crear';
        // this.crearEditarIndicadores();
        this.formulario.removeControl("idindicators");

        await this.preIndicadoresService
          .create(this.formulario.value)
          .subscribe(
            (respuesta) => {
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.dateNowISO,
                Metodo: this.translate.instant(
                  "MODULES.NOTIFICACIONES.METODOLOGCREADO"
                ),
                Datos: JSON.stringify(this.formulario.value),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status,
              };

              this.preIndicadoresService
                .createLogAsync(Loguser)
                .then((respuesta) => {});
            },
            (error: HttpErrorResponse) => {
              this.toastr.error(this.messageError);

              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.dateNowISO,
                metodo: this.translate.instant(
                  "MODULES.NOTIFICACIONES.METODOLOGCREADO"
                ),
                datos: JSON.stringify(this.formulario.value),
                respuesta: error.message,
                tipoRespuesta: error.status,
              };
              this.preIndicadoresService
                .createLogAsync(Loguser)
                .then((respuesta) => {});
            }
          );
      });

      this.toastr.success(
        this.translate.instant("MODULES.NOTIFICACIONES.REGISTROCREADO")
      );
      this.cargarIndicadores();

      // navegacion
      this.homeBtnHide = false;
      this.selectIndHide = true;
      this.page1Hide = true;
      this.page2Hide = true;
      this.page3Hide = false;
      this.spinner.hide();
    }, 1000);
  }

  // -----Selección del Item Indicador-----------
  selectedIndicatorByApi(_indicador: Indicador, index: number) {


    this.tituloInd = _indicador.nameindicators;
    this.IndSelected = index; // referencia

    this.indicador = _indicador;

    this.crearFormularioIndcador(_indicador);
    this.formShow = true;

    const itemIndicador = document.getElementById(`ind-${index}`);
    this.aplicarActiveBtn(itemIndicador);

    // navegación
    this.homeBtnHide = false;
    this.selectIndHide = true;
    this.page1Hide = false;
    this.page2Hide = true;
    this.page3Hide = true;
  }

  crearFormularioIndcador(datos: Indicador) {
    this.formulario = this.fb.group({
      // idindicators: [datos.idindicators ? datos.idindicators : ""],
      //nameindicators: [datos.nameindicators ? datos.nameindicators : ""],
      // idarea: [datos.idarea ? datos.idarea : ""],
      // idturns: [datos.idturns ? datos.idturns : ""],
      descriptionindicators: [
        datos.descriptionindicators ? datos.descriptionindicators : "",
        [Validators.required, Validators.minLength(2)],
      ],
      aim: [
        datos.aim ? datos.aim : "",
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      unitofmeasurement: [
        datos.unitofmeasurement ? datos.unitofmeasurement : "",
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      measurementfrequency: [
        datos.measurementfrequency ? datos.measurementfrequency : "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      sourceofinformation: [
        datos.sourceofinformation ? datos.sourceofinformation : "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      responsiblemeasurement: [
        datos.responsiblemeasurement ? datos.responsiblemeasurement : "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      headanalysis: [
        datos.headanalysis ? datos.headanalysis : "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      // active: [datos.active ? datos.active : false],
    });
  }

  selectedIndicador(itemIndicador: Document, pElement: HTMLHRElement, ind: number) {
    this.tituloInd = pElement.innerText;
    this.IndSelected = ind; // referencia

    console.log(this.tituloInd);
    console.log(this.indicadoresArr);
    this.indFound = this.indicadoresArr.find((e) => e.nameindicators == this.tituloInd);

    if (this.indFound != undefined) {

      const idIndicador = this.indFound.idindicators;

      const linIni = document.getElementById(`linIni`);
      const num3Ini = document.getElementById(`num3Ini`);
      const num2Fin = document.getElementById(`num2Fin`);
      const linFin = document.getElementById(`linFin`);
      const num3Fin = document.getElementById(`num3Fin`);

      console.log("idIndicador", idIndicador);
      if(idIndicador == 7 || this.indicador == 9){
        num3Ini.style.display = 'none';
        linIni.style.display = 'none';


        num2Fin.classList.add('dot');
        linFin.style.display = 'none';
        num3Fin.style.display = 'none';
      }else{
        //num2Fin.classList.add('dot-border');
      }

      this.crearFormularioIndcador(this.indFound);
    } else {
      this.indicador = {
        idindicators: null,
        nameindicators: this.tituloInd,
        idarea: null,
        idturns: null,
        descriptionindicators: null,
        aim: null,
        unitofmeasurement: null,
        measurementfrequency: null,
        sourceofinformation: null,
        responsiblemeasurement: null,
        headanalysis: null,
        active: null,
      };

      this.crearFormularioIndcador(this.indicador);
    }

    //}

    this.formShow = true;

    // navegación
    this.homeBtnHide = false;
    this.selectIndHide = true;
    this.page1Hide = false;
    this.page2Hide = true;
    this.page3Hide = true;

    this.aplicarActiveBtn(itemIndicador);

    //this.infoIndicador();
  }

  // metodo para cambiar de activar el Boton
  aplicarActiveBtn(link: any) {
    const selectores: any = document.getElementsByClassName("indicador");

    for (const ref of selectores) {
      ref.classList.remove("active");
    }

    link.classList.add("active");
  }

  //-------------------------------------------------------------------
  //-------Seleccionando la Configuracion del Indicador----------------
  //-------------------------------------------------------------------
  setIndConfiguration() {

    if (this.formulario.invalid) {
      return Object.values(this.formulario.controls).forEach((control) => {
        control.markAsTouched();
      });
    }

    // si todo OK

    // condicion indicador diferente a Q2
    if (this.IndSelected !== 1) {
      this.spinner.show();

      //if(this.indicadoresArr.length < 3){

      const indFound = this.indicadoresArr.find(
        (element) => element.nameindicators == this.tituloInd
      );

      if (indFound == undefined) {


        this.tituloAccion = "Crear";
        this.crearEditarIndicadores();
      } else {
        this.tituloAccion = "Editar";
        this.crearEditarIndicadores();
      }

      // }else{

      //     this.tituloAccion = 'Editar';
      //     this.crearEditarIndicadores();

      // }
    }

    // navegacion
    if (this.IndSelected == 1) {
      this.selectIndHide = true;
      this.page1Hide = true;
      this.page2Hide = false;
      this.page3Hide = true;
    } else {
      this.selectIndHide = true;
      this.page1Hide = true;
      this.page2Hide = true;
      //this.page3Hide = false;
    }
  }

  // ------CRUD--------
  crearEditarIndicadores() {
    if (!this.formulario.invalid) {
      if (this.tituloAccion === "Crear") {
        this.desactivar = true;

        this.preIndicadoresService.create(this.formulario.value).subscribe(
          (respuesta) => {


            this.spinner.hide();

            this.page3Hide = false; // modal guardado correctamente
            this.cargarIndicadores();
            this.toastr.success(
              this.translate.instant("MODULES.NOTIFICACIONES.REGISTROCREADO")
            );

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: this.translate.instant(
                "MODULES.NOTIFICACIONES.METODOLOGCREADO"
              ),
              Datos: JSON.stringify(this.formulario.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: status,
            };

            this.preIndicadoresService
              .createLogAsync(Loguser)
              .then((respuesta) => {});
          },
          (error) => {
            this.spinner.hide();
            // navegacion
            this.page1Hide = false;
            this.page3Hide = true;

            this.toastr.error(this.messageError);

            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.dateNowISO,
              metodo: this.translate.instant(
                "MODULES.NOTIFICACIONES.METODOLOGCREADO"
              ),
              datos: JSON.stringify(this.formulario.value),
              respuesta: error.message,
              tipoRespuesta: error.status,
            };
            this.preIndicadoresService
              .createLogAsync(Loguser)
              .then((respuesta) => {});
          }
        );
      } else {
        // ------actualiza el indicador------
        this.preIndicadoresService
          .update(this.formulario.value, this.formulario.value.idindicators)
          .subscribe(
            (respuesta) => {


              this.spinner.hide();

              this.page3Hide = false; // modal guardado correctamente
              this.cargarIndicadores();
              this.toastr.success(
                this.translate.instant(
                  "MODULES.NOTIFICACIONES.REGISTROACTUALIZADO"
                )
              );

              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.dateNowISO,
                Metodo: this.translate.instant(
                  "MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION"
                ),
                Datos: JSON.stringify(this.formulario.value),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status,
              };
            },
            (error: HttpErrorResponse) => {
              this.spinner.hide();
              // navegacion
              this.page1Hide = false;
              this.page3Hide = true;

              this.toastr.error(this.messageError);

              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.dateNowISO,
                metodo: this.translate.instant(
                  "MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION"
                ),
                datos: JSON.stringify(this.formulario.value),
                respuesta: error.message,
                tipoRespuesta: error.status,
              };

              this.preIndicadoresService
                .createLogAsync(Loguser)
                .then((respuesta) => {});
            }
          );
      }
    }
  }

  // ---no usado--
  actualizarEstadoIndicador(datosIndicador) {
    const estado = datosIndicador.active ? false : true;

    const datos = { idindicators: datosIndicador.idindicators, active: estado };
    this.preIndicadoresService
      .update(datos, datosIndicador.idindicators)
      .subscribe((respuesta) => {
        this.cargarIndicadores();
      });
  }
  // ---no usado--
  async eliminarIndicador(id: any) {
    this.preIndicadoresService.delete("pre", id).subscribe(
      (respuesta) => {
        this.cargarIndicadores();
        //this.accion = '';
        //this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: this.translate.instant(
            "MODULES.NOTIFICACIONES.METODOLOGELIMINACION"
          ),
          datos: JSON.stringify(id),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: status,
        };
        this.preIndicadoresService.createLogAsync(Loguser).then((respuesta) => {

        });
      },
      (err: HttpErrorResponse) => {
        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: this.translate.instant(
            "MODULES.NOTIFICACIONES.METODOLOGELIMINACION"
          ),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
        };
        this.preIndicadoresService.createLogAsync(Loguser).then((respuesta) => {

        });
      }
    );
  }

  titulosSwal() {
    this.translate
      .get("MODULES.SWAL.MESAGEERROR")
      .subscribe((respuesta) => (this.messageError = respuesta));
  }
} // end class

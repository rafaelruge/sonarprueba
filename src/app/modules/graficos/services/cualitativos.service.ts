import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '@app/Constants/constants';
import { environment } from '@environment/environment';
import * as dayjs from 'dayjs';
import { IngresoDatosCualitativoService } from '@app/services/configuracion/ingreso-datos-cualitativo.service';
import { Resultqualitative } from '@app/Models/Resultqualitative';
import { ReportesFechasService } from './reportes-fechas.service';

@Injectable({
  providedIn: 'root'
})

export class CualitativosService {

  private urlBase = environment.apiUrl;
  private ptsLvl1 = [];
  private ptsLvl2 = [];
  private ptsLvl3 = [];
  private validacionReglas = [];
  private datos = [];
  private fecha = dayjs().format('YYYY-MM-DD');

  constructor(private http: HttpClient,
              private IDCL: IngresoDatosCualitativoService,
              private reportesFechasService: ReportesFechasService) { }

  getData(fecha: string, level: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number) {

    let urlEjes = `${this.urlBase}qce/Reportesqce/graphsqce/${fecha}/365/${level}/${idheadquaerters}/${idanalyzer}/${idcontrolmaterial}/${idlot}/${idanalyte}`;

    return this.http.get(urlEjes).toPromise();

  }

  async getEjes(level: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number, data: any) {

    this.datos = data;

    await this.getData(this.fecha, 1, idheadquaerters, idanalyzer, idcontrolmaterial, idlot, idanalyte).then((data0: any) => {

      this.ptsLvl1 = data0;
      

    }).catch(error => {

      this.ptsLvl1 = [];

    })

    if (level >= 2) {

      await this.getData(this.fecha, 2, idheadquaerters, idanalyzer, idcontrolmaterial, idlot, idanalyte).then((data2: any) => {

        this.ptsLvl2 = data2;
        
      }).catch(error => {

        this.ptsLvl2 = [];

      });

    }

    if (level == 3) {

      await this.getData(this.fecha, 3, idheadquaerters, idanalyzer, idcontrolmaterial, idlot, idanalyte).then((data3: any) => {

        this.ptsLvl3 = data3;

      }).catch(error => {

        this.ptsLvl3 = [];

      });

    }

  }


  get ejesNvlUno() {

    return this.ptsLvl1;

  }

  get ejesNvlDos() {

    return this.ptsLvl2;

  }

  get ejesNvlTres() {

    return this.ptsLvl3;

  }

  get ars() {

    return this.datos;

  }





  validarAR(sede: number, analyzer: number, material: number, lote: number, analito: number, level: number, data: any) {

    // setTimeout(() => {
    

    // }, 1000);

    this.IDCL.getAR(this.fecha, 1, sede, analyzer, material, lote, analito).then((response: any) => {

      this.validacionReglas = response;

    });

    if (level >= 2) {

      //setTimeout(() => {

        this.IDCL.getAR(this.fecha, 2, sede, analyzer, material, lote, analito).then((response: any) => {

          this.validacionReglas = response;

          // for (var j = 0; j < response.length; j++) {

          //   for (var i = 0; i < data.length; i++) {

          //     let resulup = data[i];

          //     if (parseInt(response[j].Idresultqualitative) == resulup.Idresultqualitative) {
          //       resulup.Arlevel2 = response[j].AR;

          //       response[j] = resulup;
          //       let idResultqualitative = response[j].Idresultqualitative;

          //       const resultsupdate: Resultqualitative = {

          //         IDRESULTQUALITATIVE: resulup.Idresultqualitative,
          //         IDTEST: resulup.IdTest,
          //         USERID: resulup.Userid,
          //         IDCORRECTIVEACTIONS: resulup.Idcorrectiveactions,
          //         SUPERVISOR: resulup.Supervisor,
          //         DATE: resulup.Date,
          //         HOUR: resulup.Hour,
          //         RESULTCHARLEVEL1: resulup.Resultcharlevel1,
          //         ARLEVEL1: resulup.Arlevel1,
          //         RESULTCHARLEVEL2: resulup.Resultcharlevel2,
          //         ARLEVEL2: resulup.Arlevel2,
          //         RESULTCHARLEVEL3: resulup.Resultcharlevel3,
          //         ARLEVEL3: resulup.Arlevel3,
          //         RESULTLEVEL1: resulup.Resultlevel1,
          //         RESULTLEVEL2: resulup.Resultlevel2,
          //         RESULTLEVEL3: resulup.Resultlevel3,
          //         EVENGROUP: resulup.Evengroup,
          //         COMMENTS: resulup.Comments,
          //         ACTIVE: resulup.Active

          //       }


          //       this.IDCL.update(resultsupdate, idResultqualitative).subscribe(respuesta => {

          //       }, (error) => {

          //       });

          //     }
          //   }
          // }
        });

      //}, 1000);

    }

    if (level == 3) {

      //setTimeout(() => {

        this.IDCL.getAR(this.fecha, 3, sede, analyzer, material, lote, analito).then((response: any) => {

          this.validacionReglas = response;

          // for (var j = 0; j < response.length; j++) {

          //   for (var i = 0; i < data.length; i++) {

          //     let resulup = data[i];

          //     if (parseInt(response[j].Idresultqualitative) == resulup.Idresultqualitative) {
          //       resulup.Arlevel2 = response[j].AR;

          //       response[j] = resulup;
          //       let idResultqualitative = response[j].Idresultqualitative;

          //       const resultsupdate: Resultqualitative = {

          //         IDRESULTQUALITATIVE: resulup.Idresultqualitative,
          //         IDTEST: resulup.IdTest,
          //         USERID: resulup.Userid,
          //         IDCORRECTIVEACTIONS: resulup.Idcorrectiveactions,
          //         SUPERVISOR: resulup.Supervisor,
          //         DATE: resulup.Date,
          //         HOUR: resulup.Hour,
          //         RESULTCHARLEVEL1: resulup.Resultcharlevel1,
          //         ARLEVEL1: resulup.Arlevel1,
          //         RESULTCHARLEVEL2: resulup.Resultcharlevel2,
          //         ARLEVEL2: resulup.Arlevel2,
          //         RESULTCHARLEVEL3: resulup.Resultcharlevel3,
          //         ARLEVEL3: resulup.Arlevel3,
          //         RESULTLEVEL1: resulup.Resultlevel1,
          //         RESULTLEVEL2: resulup.Resultlevel2,
          //         RESULTLEVEL3: resulup.Resultlevel3,
          //         EVENGROUP: resulup.Evengroup,
          //         COMMENTS: resulup.Comments,
          //         ACTIVE: resulup.Active

          //       }


          //       this.IDCL.update(resultsupdate, idResultqualitative).subscribe(respuesta => {

          //       }, (error) => {

          //       });

          //     }
          //   }
          // }
        });

      //}, 1000);

      setTimeout(() => {

        this.IDCL.getAR(this.fecha, 3, sede, analyzer, material, lote, analito).then((response: any) => {

          this.validacionReglas = response;

          // for (var j = 0; j < response.length; j++) {

          //   for (var i = 0; i < data.length; i++) {

          //     let resulup = data[i];

          //     if (parseInt(response[j].Idresultqualitative) == resulup.Idresultqualitative) {
          //       resulup.Arlevel3 = response[j].AR;

          //       response[i] = resulup;
          //       let idResultqualitative = response[i].Idresultqualitative;

          //       const resultsupdate: Resultqualitative = {

          //         IDRESULTQUALITATIVE: resulup.Idresultqualitative,
          //         IDTEST: resulup.IdTest,
          //         USERID: resulup.Userid,
          //         IDCORRECTIVEACTIONS: resulup.Idcorrectiveactions,
          //         SUPERVISOR: resulup.Supervisor,
          //         DATE: resulup.Date,
          //         HOUR: resulup.Hour,
          //         RESULTCHARLEVEL1: resulup.Resultcharlevel1,
          //         ARLEVEL1: resulup.Arlevel1,
          //         RESULTCHARLEVEL2: resulup.Resultcharlevel2,
          //         ARLEVEL2: resulup.Arlevel2,
          //         RESULTCHARLEVEL3: resulup.Resultcharlevel3,
          //         ARLEVEL3: resulup.Arlevel3,
          //         RESULTLEVEL1: resulup.Resultlevel1,
          //         RESULTLEVEL2: resulup.Resultlevel2,
          //         RESULTLEVEL3: resulup.Resultlevel3,
          //         EVENGROUP: resulup.Evengroup,
          //         COMMENTS: resulup.Comments,
          //         ACTIVE: resulup.Active

          //       }


          //       this.IDCL.update(resultsupdate, idResultqualitative).subscribe(respuesta => {

          //       }, (error) => {

          //       });

          //     }
          //   }
          // }
        });

      }, 1000);

    }

    return new Promise((resolve) => {

      return resolve(1);

    })

  }








  // ------------------------
  async getEjesByDates(fechaInicial: string, fechaFinal: string, level: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number, data: any) {

    this.datos = data;

    await this.reportesFechasService.getDataByDatesCuali(fechaInicial, fechaFinal, 1, idheadquaerters, idanalyzer, idcontrolmaterial, idlot, idanalyte).then((data: any) => {

      this.ptsLvl1 = data;

    }).catch(error => {

      this.ptsLvl1 = [];

    })

    if (level >= 2) {

      await this.reportesFechasService.getDataByDatesCuali(fechaInicial, fechaFinal, 2, idheadquaerters, idanalyzer, idcontrolmaterial, idlot, idanalyte).then((data: any) => {

        this.ptsLvl2 = data;

      }).catch(error => {

        this.ptsLvl2 = [];

      });

    }

    if (level == 3) {

      await this.reportesFechasService.getDataByDatesCuali(fechaInicial, fechaFinal, 3, idheadquaerters, idanalyzer, idcontrolmaterial, idlot, idanalyte).then((data: any) => {

        this.ptsLvl3 = data;

      }).catch(error => {

        this.ptsLvl3 = [];

      });

    }

  }
  // ------------------------

  validarARByDates(fechaInicial: string, fechaFinal: string, sede: number, analyzer: number, material: number, lote: number, analito: number, level: number, data: any) {

    setTimeout(() => {
      this.reportesFechasService.getARByDatesCuali(fechaInicial, fechaFinal, 1, sede, analyzer, material, lote, analito).then((response: any) => {

        this.validacionReglas = response;

        for (var j = 0; j < response.length; j++) {

          for (var i = 0; i < data.length; i++) {

            let resulup = data[i];

            if (parseInt(response[j].Idresultqualitative) == resulup.Idresultqualitative) {
              resulup.Arlevel1 = response[j].AR;

              response[i] = resulup;
              let idResultqualitative = response[i].Idresultqualitative;

              const resultsupdate: Resultqualitative = {

                IDRESULTQUALITATIVE: resulup.Idresultqualitative,
                IDTEST: resulup.IdTest,
                USERID: resulup.Userid,
                IDCORRECTIVEACTIONS: resulup.Idcorrectiveactions,
                SUPERVISOR: resulup.Supervisor,
                DATE: resulup.Date,
                HOUR: resulup.Hour,
                RESULTCHARLEVEL1: resulup.Resultcharlevel1,
                ARLEVEL1: resulup.Arlevel1,
                RESULTCHARLEVEL2: resulup.Resultcharlevel2,
                ARLEVEL2: resulup.Arlevel2,
                RESULTCHARLEVEL3: resulup.Resultcharlevel3,
                ARLEVEL3: resulup.Arlevel3,
                RESULTLEVEL1: resulup.Resultlevel1,
                RESULTLEVEL2: resulup.Resultlevel2,
                RESULTLEVEL3: resulup.Resultlevel3,
                EVENGROUP: resulup.Evengroup,
                COMMENTS: resulup.Comments,
                ACTIVE: resulup.Active

              }
              this.IDCL.update(resultsupdate, idResultqualitative).subscribe(respuesta => {

              }, (error) => {

              });

            }
          }
        }
      });

    }, 1000);

    if (level == 2) {

      setTimeout(() => {

        this.reportesFechasService.getARByDatesCuali(fechaInicial, fechaFinal, 2, sede, analyzer, material, lote, analito).then((response: any) => {

          this.validacionReglas = response;

          for (var j = 0; j < response.length; j++) {

            for (var i = 0; i < data.length; i++) {

              let resulup = data[i];

              if (parseInt(response[j].Idresultqualitative) == resulup.Idresultqualitative) {
                resulup.Arlevel2 = response[j].AR;

                response[i] = resulup;
                let idResultqualitative = response[i].Idresultqualitative;

                const resultsupdate: Resultqualitative = {

                  IDRESULTQUALITATIVE: resulup.Idresultqualitative,
                  IDTEST: resulup.IdTest,
                  USERID: resulup.Userid,
                  IDCORRECTIVEACTIONS: resulup.Idcorrectiveactions,
                  SUPERVISOR: resulup.Supervisor,
                  DATE: resulup.Date,
                  HOUR: resulup.Hour,
                  RESULTCHARLEVEL1: resulup.Resultcharlevel1,
                  ARLEVEL1: resulup.Arlevel1,
                  RESULTCHARLEVEL2: resulup.Resultcharlevel2,
                  ARLEVEL2: resulup.Arlevel2,
                  RESULTCHARLEVEL3: resulup.Resultcharlevel3,
                  ARLEVEL3: resulup.Arlevel3,
                  RESULTLEVEL1: resulup.Resultlevel1,
                  RESULTLEVEL2: resulup.Resultlevel2,
                  RESULTLEVEL3: resulup.Resultlevel3,
                  EVENGROUP: resulup.Evengroup,
                  COMMENTS: resulup.Comments,
                  ACTIVE: resulup.Active

                }


                this.IDCL.update(resultsupdate, idResultqualitative).subscribe(respuesta => {

                }, (error) => {

                });

              }
            }
          }
        });

      }, 1000);

    }

    if (level == 3) {

      setTimeout(() => {

        this.reportesFechasService.getARByDatesCuali(fechaInicial, fechaFinal, 2, sede, analyzer, material, lote, analito).then((response: any) => {

          this.validacionReglas = response;

          for (var j = 0; j < response.length; j++) {

            for (var i = 0; i < data.length; i++) {

              let resulup = data[i];

              if (parseInt(response[j].Idresultqualitative) == resulup.Idresultqualitative) {
                resulup.Arlevel2 = response[j].AR;

                response[i] = resulup;
                let idResultqualitative = response[i].Idresultqualitative;

                const resultsupdate: Resultqualitative = {

                  IDRESULTQUALITATIVE: resulup.Idresultqualitative,
                  IDTEST: resulup.IdTest,
                  USERID: resulup.Userid,
                  IDCORRECTIVEACTIONS: resulup.Idcorrectiveactions,
                  SUPERVISOR: resulup.Supervisor,
                  DATE: resulup.Date,
                  HOUR: resulup.Hour,
                  RESULTCHARLEVEL1: resulup.Resultcharlevel1,
                  ARLEVEL1: resulup.Arlevel1,
                  RESULTCHARLEVEL2: resulup.Resultcharlevel2,
                  ARLEVEL2: resulup.Arlevel2,
                  RESULTCHARLEVEL3: resulup.Resultcharlevel3,
                  ARLEVEL3: resulup.Arlevel3,
                  RESULTLEVEL1: resulup.Resultlevel1,
                  RESULTLEVEL2: resulup.Resultlevel2,
                  RESULTLEVEL3: resulup.Resultlevel3,
                  EVENGROUP: resulup.Evengroup,
                  COMMENTS: resulup.Comments,
                  ACTIVE: resulup.Active

                }


                this.IDCL.update(resultsupdate, idResultqualitative).subscribe(respuesta => {

                }, (error) => {

                });

              }
            }
          }
        });

      }, 1000);

      setTimeout(() => {

        this.reportesFechasService.getARByDatesCuali(fechaInicial, fechaFinal, 3, sede, analyzer, material, lote, analito).then((response: any) => {

          this.validacionReglas = response;

          for (var j = 0; j < response.length; j++) {

            for (var i = 0; i < data.length; i++) {

              let resulup = data[i];

              if (parseInt(response[j].Idresultqualitative) == resulup.Idresultqualitative) {
                resulup.Arlevel3 = response[j].AR;

                response[i] = resulup;
                let idResultqualitative = response[i].Idresultqualitative;

                const resultsupdate: Resultqualitative = {

                  IDRESULTQUALITATIVE: resulup.Idresultqualitative,
                  IDTEST: resulup.IdTest,
                  USERID: resulup.Userid,
                  IDCORRECTIVEACTIONS: resulup.Idcorrectiveactions,
                  SUPERVISOR: resulup.Supervisor,
                  DATE: resulup.Date,
                  HOUR: resulup.Hour,
                  RESULTCHARLEVEL1: resulup.Resultcharlevel1,
                  ARLEVEL1: resulup.Arlevel1,
                  RESULTCHARLEVEL2: resulup.Resultcharlevel2,
                  ARLEVEL2: resulup.Arlevel2,
                  RESULTCHARLEVEL3: resulup.Resultcharlevel3,
                  ARLEVEL3: resulup.Arlevel3,
                  RESULTLEVEL1: resulup.Resultlevel1,
                  RESULTLEVEL2: resulup.Resultlevel2,
                  RESULTLEVEL3: resulup.Resultlevel3,
                  EVENGROUP: resulup.Evengroup,
                  COMMENTS: resulup.Comments,
                  ACTIVE: resulup.Active

                }


                this.IDCL.update(resultsupdate, idResultqualitative).subscribe(respuesta => {

                }, (error) => {

                });

              }
            }
          }
        });

      }, 1000);

    }

    return new Promise((resolve) => {

      return resolve(1);

    })

  }


}

import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Canvas, Cell, Columns, Img, Line, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
import { async } from '@angular/core/testing';
import { AppConstantsPdf } from "../../Constants/imgPdf";
import { LaboratoriosService } from '../configuracion/laboratorios.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Injectable({
  providedIn: 'root'
})

export class PdfSemicualitativoService {

  private no_image = AppConstantsPdf.no_image;
  private qc_blanco = AppConstantsPdf.qc_blanco;

  private clienteName: any;
  private clienteNit: any;
  private clienteAddres: any;
  private nameUser:string= sessionStorage.getItem('nombres');
  private lastNameUser:string= sessionStorage.getItem('apellidos');
  logoSourceToPDF: any;

  constructor(private laboratoriosService: LaboratoriosService,) {
    this.validarCliente();
    this.getLogoSource();
  }

  get returnQc_blanco() {
    return this.qc_blanco;
  }
  get returnNo_image() {
    return this.no_image;
  }

  get returnNit() {
    return this.clienteNit;
  }
  get returnNameLab() {
    return this.clienteName;
  }
  get returnAddresLab() {
    return this.clienteAddres;
  }

  validarCliente() {
    this.laboratoriosService.getAllAsync().then(lab => {
      this.clienteName = lab[0].name;
      this.clienteNit = lab[0].nit;
      this.clienteAddres = lab[0].addres;
    });
  }

  getLogoSource() {
    this.laboratoriosService.getLogoImage()
      .subscribe(logo => {
        this.logoSourceToPDF = `data:image/jpg;base64,${logo}`;
        if (logo == "") {
          this.logoSourceToPDF = 'data:image/jpg;base64,' + this.no_image;
        }
      })
  }


  // REPORTE DESEMPEÑO SEMICUALITATIVO CLIENTE

  async PdfPlantillaCualiCliente(infoCabecera: any, arrGraficas: any, cabeceros: any, colTBL: any) {
    setTimeout(async () => {

      PdfMakeWrapper.setFonts(pdfFonts);
      const pdf = new PdfMakeWrapper();
      pdf.pageSize('B4');
      pdf.pageMargins([30, 210, 30, 50]);
      pdf.header(
        new Stack([
          new Canvas([
            new Line([298, 70], [300, 70]).lineWidth(190).lineColor('#6b4b8b').end,
          ]).absolutePosition(-50, 55).end,
          await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(80, 40).build(),
          '\n',
          new Txt(`Cliente : ${this.clienteName}`).relativePosition(60, 140).fontSize(11).end,
          new Stack([
            new Txt('Resultado del ensayo de aptitud\n(Evaluación externa del desempeño)').margin([250, 0, 0, 20]).bold().fontSize(18).end,
            new Table([['Programa', 'Código de identificación'],
            [
              new Cell(new Txt(`${infoCabecera.programa}`).bold().end).end,
              new Cell(new Txt(`${this.clienteNit}`).bold().end).end,
            ],
            ['Cod. Lab:', 'Fecha de evento:'],
            [
              new Cell(new Txt(`${infoCabecera.codLab}`).bold().end).end,
              new Cell(new Txt(`${infoCabecera.fechaD}`).bold().end).end,
            ],
            ['Metodología:', 'Ronda'],
            [
              new Cell(new Txt(`${infoCabecera.metodologia}`).bold().end).end,
              new Cell(new Txt(infoCabecera.ronda).bold().end).end,
            ],
            ]).widths('*')
              .margin([250, 0, 0, 20])
              .layout('noBorders')
              .fontSize(11)
              .end,
          ]).margin(20).end,
        ]).width('100%').height('auto').alignment('left').end);

      // CONTENEDOR 1
      pdf.add(
        new Stack([
          new Stack([
            new Canvas([
              new Line([-50, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
            ]).relativePosition(0, 0).end,
            new Canvas([
              new Line([140, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
            ]).relativePosition(0, 0).end,
            new Txt(`Estadística general`).margin([0, 15, 0, 0]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
          ]).end,
          new Columns([
            this.tbl1Vertical(cabeceros.headerTblCont1, colTBL.colCont1).margin([0, 50, 0, 0]).widths('auto').end,
            {
              alignment: "center",
              image: arrGraficas.cont1,
              height: 150,
              width: 450,
            }
          ]).margin([0, 10, 0, 0]).width('*').end,
        ]).end
      )

      // CONTENEDOR 2
      pdf.add(
        new Stack([
          new Stack([
            new Canvas([
              new Line([-50, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
            ]).relativePosition(0, 0).end,
            new Canvas([
              new Line([280, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
            ]).relativePosition(0, 0).end,
            new Txt(`Evaluación del procedimiento de medida`).margin([0, 15, 0, 0]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
          ]).end,
          new Columns([
            this.tbl2Vertical(cabeceros.headerTbl1Cont2, [colTBL.colCont2Tbl1]),
            this.tbl3Vertical(cabeceros.headerTbl2Cont2, colTBL.colCont2Tbl2),
          ]).margin([110, 20, 0, 0]).end,
          {
            alignment: "center",
            image: arrGraficas.cont2,
            height: 150,
            width: 600,
            margin: [0, 10, 30, 0],
          },
        ]).end,
      )

      // CONTENEDOR 3
      pdf.add(
        new Stack([
          new Stack([
            new Canvas([
              new Line([-50, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
            ]).relativePosition(0, 0).end,
            new Canvas([
              new Line([180, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
            ]).relativePosition(0, 0).end,
            new Txt(`Gráficas de concordancia`).margin([0, 15, 0, 0]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
          ]).end,
          new Stack([
            this.crearTablaCont1_2(cabeceros.headerTblCont3, colTBL.colCont3),
          ]).margin([40, 20, 0, 0]).end,
          {
            alignment: "center",
            image: arrGraficas.cont3.graf1,
            width: 600,
            height: 100
          },
          this.crearColumnas(arrGraficas.cont3.graf2)
        ]).end,
      )

      // CONTENEDOR 4

      pdf.add(
        new Stack([
          new Stack([
            new Canvas([
              new Line([-50, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
            ]).relativePosition(0, 0).end,
            new Canvas([
              new Line([80, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
            ]).relativePosition(0, 0).end,
            new Txt(`Fin de ciclo`).margin([0, 15, 0, 0]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
          ]).end,
          new Stack([
            this.crearTablaCont1_2(cabeceros.headerTblCont4, colTBL.colCont4),
          ]).margin([40, 20, 0, 0]).end,
          {
            alignment: "center",
            image: arrGraficas.cont4.graf1,
            width: 600,
          },
          this.crearColumnas(arrGraficas.cont4.graf2),
          new Txt(`Homogeneidad y estabilidad: La información relacionada con la homogeneidad y estabilidad de esta muestra
          ha sido declarada por el fabricante.
          Confidencialidad: El informe presentado a continuación presenta información de caracter confidencia; la
          divulgación del mismo se realiza únicamente con el participante al cual corresponde; en caso que alguna
          autoridad requiera la socialización del mismo, esta solo se realiza con autorización expresa del participante.
          Subcontratación: Annar Health Technologies no realiza la subcontratación de actividades relacionadas con la
          planificación, análisis y emisión de los reportes de resultados relacionados con los reportes de control de
          calidad externo. Autorizado por: Leydy Paola González, Especialista de producto.
          Tener presente que la información de autorización puede a futuro modificarse y se diferente por programa
          En el reporte incluir por favor la información de condiciones de la muestra, fecha de recepción… y
          demás ítems que estan en el Excel. No se si en el reporte cuantitativo se encuentra esta
          información, pero en el cualitativo no permite ingresarla. `).end
        ]).end,
      )

      function footerFunc(img) {
        pdf.footer(function (page: any, pages: any) {
          return {
            margin: [5, 0, 10, 0],
            height: 30,
            columns: [
              {
                canvas: [{ type: 'line', x1: 0, y1: 100, x2: 0, y2: 0, lineWidth: 2000, lineColor: '#0040FF' }],
                absolutePosition: { x: 0, y: 0 },
              },
              {
                alignment: "center",
                image: img,
                height: 30,
                width: 100,
                margin: [0, 10, 0, 0],
              },
              {
                alignment: "right",
                text: [
                  { text: 'Pag ' + page.toString() },
                  " - ",
                  { text: pages.toString() }
                ],
                color: 'white',
                margin: [0, 20, 20, 0],
              },

            ],

          }
        });
      }
      footerFunc('data:image/png;base64,' + this.qc_blanco);
      pdf.create().open();
    }, 3000);
  }

  async PdfPlantillaCualiClienteConsolidado(infoCabecera: any, arrInformacion: any[]) {
    setTimeout(async () => {

      PdfMakeWrapper.setFonts(pdfFonts);
      const pdf = new PdfMakeWrapper();
      pdf.pageSize('B4');
      pdf.pageMargins([30, 220, 30, 50]);
      pdf.header(
        new Stack([
          new Canvas([
            new Line([298, 70], [300, 70]).lineWidth(190).lineColor('#6b4b8b').end,
          ]).absolutePosition(-50, 55).end,
          await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(80, 40).build(),
          '\n',
          new Txt(`Cliente : ${this.clienteName}`).relativePosition(60, 140).fontSize(11).end,
          new Stack([
            new Txt('Resultado del ensayo de aptitud\n(Evaluación externa del desempeño)').color('#6b4b8b').margin([250, 0, 0, 20]).bold().fontSize(18).end,
            new Table([['Programa', 'Código de identificación'],
            [
              new Cell(new Txt(`${infoCabecera.programa}`).bold().end).end,
              new Cell(new Txt(`${this.clienteNit}`).bold().end).end,
            ],
            ['Cod. Lab:', 'Fecha de evento:'],
            [
              new Cell(new Txt(`${infoCabecera.codLab}`).bold().end).end,
              new Cell(new Txt(`${infoCabecera.fechaD}`).bold().end).end,
            ],
            ['Metodología:', 'Ronda'],
            [
              new Cell(new Txt(`${infoCabecera.metodologia}`).bold().end).end,
              new Cell(new Txt(infoCabecera.ronda).bold().end).end,
            ],
            ]).widths('*')
              .margin([250, 0, 0, 20])
              .layout('noBorders')
              .fontSize(11)
              .end,
          ]).margin(20).end,
        ]).width('100%').height('auto').alignment('left').end);


      arrInformacion.map(async (x, i) => {
        // CONTENEDOR 1
        pdf.add(
          new Stack([
            new Stack([
              new Canvas([
                new Line([-50, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
              ]).relativePosition(0, 0).end,
              new Canvas([
                new Line([140, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
              ]).relativePosition(0, 0).end,
              new Txt(`Estadística general`).margin([0, 15, 0, 0]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
            ]).end,
            new Columns([
              this.tbl1Vertical(x.headerTBL.headerTblCont1, x.colTBL.colCont1).margin([0, 50, 0, 0]).widths('auto').end,
              {
                alignment: "center",
                image: x.arrImg[0],
                height: 150,
                width: 450,
              }
            ]).margin([0, 10, 0, 0]).width('*').end,
          ]).end
        ) // CONTENEDOR 1

        // CONTENEDOR 2
        pdf.add(
          new Stack([
            new Stack([
              new Canvas([
                new Line([-50, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
              ]).relativePosition(0, 0).end,
              new Canvas([
                new Line([280, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
              ]).relativePosition(0, 0).end,
              new Txt(`Evaluación del procedimiento de medida`).margin([0, 15, 0, 0]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
            ]).end,
            new Columns([
              this.tbl2Vertical(x.headerTBL.headerTbl1Cont2, [x.colTBL.colCont2Tbl1]),
              this.tbl3Vertical(x.headerTBL.headerTbl2Cont2, x.colTBL.colCont2Tbl2),
            ]).margin([110, 20, 0, 0]).end,
            {
              alignment: "center",
              image: x.arrImg[1],
              height: 150,
              width: 600,
              margin: [0, 10, 30, 0],
            },
          ]).end,
        ) // CONTENEDOR 2

        // CONTENEDOR 3
        pdf.add(
          new Stack([
            new Stack([
              new Canvas([
                new Line([-50, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
              ]).relativePosition(0, 0).end,
              new Canvas([
                new Line([180, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
              ]).relativePosition(0, 0).end,
              new Txt(`Gráficas de concordancia`).margin([0, 15, 0, 0]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
            ]).end,
            new Stack([
              this.crearTablaCont1_2(x.headerTBL.headerTblCont3, x.colTBL.colCont3),
            ]).margin([40, 20, 0, 0]).end,
            {
              alignment: "center",
              image: x.arrImg[2].shift(),
              width: 600,
              height: 100
            },
            this.crearColumnas(x.arrImg[2])
          ]).end,
        ) // CONTENEDOR 3

        // CONTENEDOR 4
        pdf.add(
          new Stack([
            new Stack([
              new Canvas([
                new Line([-50, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
              ]).relativePosition(0, 0).end,
              new Canvas([
                new Line([80, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
              ]).relativePosition(0, 0).end,
              new Txt(`Fin de ciclo`).margin([0, 15, 0, 0]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
            ]).end,
            new Stack([
              this.crearTablaCont1_2(x.headerTBL.headerTblCont4, x.colTBL.colCont4),
            ]).margin([40, 20, 0, 0]).end,
            {
              alignment: "center",
              image: x.arrImg[3].shift(),
              width: 600,
            },
            this.crearColumnas(x.arrImg[3]),
            i+1 === arrInformacion.length? new Stack([
              new Txt( [new Txt(`Homogeneidad y estabilidad:`).bold().end, ` La información relacionada con la homogeneidad y estabilidad de esta muestra ha sido declarada por el fabricante.
               `, new Txt(`Confidencialidad:`).bold().end, ` El informe presentado a continuación presenta información de caracter confidencia; la divulgación del mismo se realiza únicamente con el participante al cual corresponde; en caso que alguna autoridad requiera la socialización del mismo, esta solo se realiza con autorización expresa del participante.
               `, new Txt(`Subcontratación:`).bold().end, ` Annar Health Technologies no realiza la subcontratación de actividades relacionadas con la planificación, análisis y emisión de los reportes de resultados relacionados con los reportes de control de calidad externo. 
               `, new Txt(`Autorizado Por :`).bold().end, ` ${this.nameUser+' '+this.lastNameUser}, especialista de producto`
              ]).end
            ]).margin(20).end:new Txt(``).bold().pageBreak('after').end
          ]).margin([0, 60, 0, 0]).end,
        ) // CONTENEDOR 4
      })

      function footerFunc(img) {
        pdf.footer(function (page: any, pages: any) {
          return {
            margin: [5, 0, 10, 0],
            height: 30,
            columns: [
              {
                canvas: [{ type: 'line', x1: 0, y1: 100, x2: 0, y2: 0, lineWidth: 2000, lineColor: '#0040FF' }],
                absolutePosition: { x: 0, y: 0 },
              },
              {
                alignment: "center",
                image: img,
                height: 30,
                width: 100,
                margin: [0, 10, 0, 0],
              },
              {
                alignment: "right",
                text: [
                  { text: 'Pag ' + page.toString() },
                  " - ",
                  { text: pages.toString() }
                ],
                color: 'white',
                margin: [0, 20, 20, 0],
              },

            ],

          }
        });
      }
      footerFunc('data:image/png;base64,' + this.qc_blanco);
      pdf.create().open();
    }, 3000);
  }


  crearColumnas(graf, titulos?: any): any[] {
    let newArray = [];
    let arregloDeArreglos = [];
    let arregloDeTitulos = [];
    const long = 2; // Partir en arreglo de 3
    for (let i = 0; i < graf.length; i += long) {
      let itemArr = graf.slice(i, i + long);
      arregloDeArreglos.push(itemArr);

      if (titulos != undefined) {
        let titleArr = titulos.slice(i, i + long);
        arregloDeTitulos.push(titleArr);
      }
    }
    console.log(arregloDeArreglos);
    
    arregloDeArreglos.map((x: any, index: number) => {
      newArray[index] = new Stack([
        new Columns([
          new Stack([
            titulos != undefined ? new Txt(arregloDeTitulos[index][0].sample).margin([0, 0, 0, 0]).fontSize(15).alignment('center').bold().color('#3850EB').end : '',
            { alignment: "center", image: x[0], height: 200, width: 300 }
          ]).end,
          new Stack([
            titulos != undefined && arregloDeTitulos[index][1] != undefined ? new Txt(arregloDeTitulos[index][1].sample).margin([0, 0, 0, 0]).fontSize(15).alignment('center').bold().color('#3850EB').end : '',
            x[1] != undefined ? { alignment: "center", image: x[1], height: 200, width: 300 } : ''
          ]).end
        ]).columnGap(5).alignment('center').fontSize(11).margin([0, 10, 0, 10]).width('90%').end
      ]).end
    });
    return newArray
  }

  tbl1Vertical(cabeceros: string[], body: any[]) {
    let relleno = '';
    let head = cabeceros.map((x: any) => {
      let newarr = [
        new Cell(new Txt(x).bold().color('blue').noWrap().end).end,
      ]
      return newarr
    })
    let celdas = body.map((x: any, index: number) => {
      let newarr = [
        new Cell(new Txt(x.results).noWrap().bold().end).end,
        new Cell(new Txt(x.metodo).noWrap().bold().end).end,
        new Cell(new Txt(x.totalResults).noWrap().bold().end).end
      ]
      return newarr
    })

    return new Table([[head, ...celdas]])
      .heights(rowIndex => rowIndex === 0 ? 25 : 0)
      .fontSize(11)
      .layout({
        fillColor: (rowIndex: number | undefined, node: any, columnIndex: number | undefined) => {
          relleno = 'white';
          return relleno;
        },
        hLineColor: () => '#C5C5C5',
        vLineColor(rowIndex, node, columnIndex) {
          return 'C5C5C5';
        },
      })
      .alignment('center')
  }

  tbl2Vertical(cabeceros: string[], body: any[]) {
    let relleno = '';
    let head = cabeceros.map((x: any) => {
      let newarr = [
        new Cell(new Txt(x).bold().color('blue').end).end,
      ]
      return newarr
    })
    let celdas = body.map((x: any, index: number) => {
      let newarr = [
        new Cell(new Txt(x.name_Analyzer).bold().end).end,
        new Cell(new Txt(x.desreagents).bold().end).end,
        new Cell(new Txt(x.desAnalytes).bold().end).end,
        new Cell(new Txt(x.desunits).bold().end).end
      ]
      return newarr
    })

    return new Table([[head, ...celdas]])
      .heights(rowIndex => rowIndex === 0 ? 25 : 0)
      .fontSize(11)
      .layout({
        fillColor: (rowIndex: number | undefined, node: any, columnIndex: number | undefined) => {
          relleno = 'white';
          return relleno;
        },
        hLineColor: () => '#C5C5C5',
        vLineColor(rowIndex, node, columnIndex) {
          return 'C5C5C5';
        },
      })
      .alignment('center')
      .dontBreakRows(true)
      .end
  }

  tbl3Vertical(cabeceros: string[], body: any[]) {
    let relleno = '';
    let head = cabeceros.map((x: any) => {
      let newarr = [
        new Cell(new Txt(x).bold().color('blue').end).end,
      ]
      return newarr
    })
    let celdas = body.map((x: any, index: number) => {
      let newarr = [
        new Cell(new Txt(x.serialSample).bold().end).end,
        new Cell(new Txt(x.results).bold().end).end,
        new Cell(new Txt(x.valueAsing).bold().end).end,
        new Cell(new Txt(x.score).bold().end).end,
        new Cell(new Txt(x.prom).bold().end).end
      ]
      return newarr
    })

    return new Table([[head, ...celdas]])
      .heights(rowIndex => rowIndex === 0 ? 25 : 0)
      .fontSize(11)
      .layout({
        fillColor: (rowIndex: number | undefined, node: any, columnIndex: number | undefined) => {
          relleno = 'white';
          return relleno;
        },
        hLineColor: () => '#C5C5C5',
        vLineColor(rowIndex, node, columnIndex) {
          return 'C5C5C5';
        },
      })
      .alignment('center')
      .dontBreakRows(true)
      .end
  }

  crearTablaCont1_2(cabeceros: string[], body: any[]) {
    let relleno = '';
    let head = cabeceros.map((x: any) => {
      let newarr = [
        new Cell(new Txt(x).bold().color('white').end).end,
      ]
      return newarr
    })
    let celdas = body.map((x: any, index: number) => {
      let newarr = [
        new Cell(new Txt(x.samples == undefined ? x.serialNumber : x.samples).bold().end).end,
        new Cell(new Txt(x.total).bold().end).end,
        new Cell(new Txt(x.aceptados).bold().end).end,
        new Cell(new Txt(x.rechazados).bold().end).end,
        new Cell(new Txt(x.acepPorcentaje).bold().end).end,
        new Cell(new Txt(x.recPorcentaje).bold().end).end
      ]
      return newarr
    })

    return new Table([head, ...celdas])
      .widths([100, 60, 80, 80, 80, 90])
      .heights(rowIndex => rowIndex === 0 ? 25 : 0)
      .fontSize(11)
      .layout({
        fillColor: (rowIndex: number | undefined, node: any, columnIndex: number | undefined) => {
          relleno = rowIndex === 0 ? '#3850EB' : rowIndex! % 2 === 0 ? '#ECF3F8' : 'white';
          return relleno;
        },
        hLineColor: () => '#C5C5C5',
        vLineColor(rowIndex, node, columnIndex) {
          return 'C5C5C5';
        },
      })
      .dontBreakRows(true)
      .alignment('center')
      .end
  }

}

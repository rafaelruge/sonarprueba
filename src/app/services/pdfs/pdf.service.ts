import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { AppConstantsPdf } from "../../Constants/imgPdf";
import { Canvas, Cell, Columns, Img, Line, PdfMakeWrapper, Stack, Table, Txt, Ul } from 'pdfmake-wrapper';
import { LaboratoriosService } from '../configuracion/laboratorios.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Injectable({
  providedIn: 'root'
})

export class PdfService {

  private no_image = AppConstantsPdf.no_image;
  private qc_blanco = AppConstantsPdf.qc_blanco;
  private clienteName: any;
  private clienteNit: any;
  private clienteAddres: any;
  logoSourceToPDF: any;

  private nameUser: string = sessionStorage.getItem('nombres');
  private lastNameUser: string = sessionStorage.getItem('apellidos');

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
  async getLogoSourceClient(header: any) {
    sessionStorage.setItem('clientLogo', header);
    try {
      const logo = await this.laboratoriosService.getLogoImageClient(header).toPromise();
      this.logoSourceToPDF = `data:image/jpg;base64,${logo}`;
    } catch (error) {
    } finally {
      sessionStorage.removeItem('clientLogo');
    }
  }

  crearTabla(cabeceros: string[], body: any[]) {
    let relleno = '';
    let header = ''
    let celdas = body.map((x: any, index: number) => {
      x?.Seccion ? header = x.Seccion : header = 'Nivel ' + (index + 1);
      let newarr = [
        new Cell(new Txt(header).bold().end).end,
        new Cell(new Txt((x.totalaceptados + x.totalrechazados)).bold().end).end,
        new Cell(new Txt(x.totalaceptados).bold().end).end,
        new Cell(new Txt(x.totalrechazados).bold().end).end,
        new Cell(new Txt(x.pctaceptados + ' %').bold().end).end,
        new Cell(new Txt(x.pctrechazados + ' %').bold().end).end,
        new Cell(new Txt(x.sigma).bold().end).end
      ]
      return newarr
    })

    return new Table([cabeceros, ...celdas])
      .widths('*')
      .fontSize(11)
      .layout({
        fillColor: (rowIndex: number | undefined, node: any, columnIndex: number | undefined) => {
          if (rowIndex === 0) {
            relleno = '#9FA7FD'
          } else {
            if (rowIndex! % 2 === 0) {
              relleno = '#ECF3F8'
            } else {
              relleno = 'white'
            }
          }
          return relleno
        },
      })
      .alignment('center')
      .end
  }

  cabecero(infoCabecera: any) {
    console.log(infoCabecera);
    let header: any;
    if (!infoCabecera?.analito) {
      header = new Table([['Fecha desde', '', ''],
      [
        new Cell(new Txt(`${infoCabecera.fechaD}`).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
      ],
      ['Fecha Hasta', '', ''],
      [
        new Cell(new Txt(`${infoCabecera.fechaH}`).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
      ]
      ]).widths('*')
        .margin([250, 0, 0, 20])
        .layout('noBorders')
        .fontSize(11)
        .end
    } else {
      header = new Table([['Fecha desde', 'N° lote', 'Equipo'],
      [
        new Cell(new Txt(`${infoCabecera.fechaD}`).bold().end).end,
        new Cell(new Txt(`${infoCabecera.lote}`).bold().end).end,
        new Cell(new Txt(`${infoCabecera.equipo}`).bold().end).end,
      ],
      ['Fecha Hasta', '', ''],
      [
        new Cell(new Txt(`${infoCabecera.fechaH}`).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
      ],
      ['Sección', 'Analito', ''],
      [
        new Cell(new Txt(`${infoCabecera.seccion}`).bold().end).end,
        new Cell(new Txt(`${infoCabecera.analito}`).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
      ],
      ]).widths('*')
        .margin([250, 0, 0, 20])
        .layout('noBorders')
        .fontSize(11)
        .end
    }
    return header
  }

  async PdfPlantilla1(arrGraficas: string[], cabeceros: string[], body: any[], infoCabecera: any, titulo?: string) {
    setTimeout(async () => {

      PdfMakeWrapper.setFonts(pdfFonts);
      const pdf = new PdfMakeWrapper();
      pdf.pageSize('B4');
      pdf.pageMargins([20, 240, 30, 50]);
      pdf.header(
        new Stack([
          new Canvas([
            new Line([298, 70], [300, 70]).lineWidth(160).lineColor('#6E6E6E').end,
          ]).absolutePosition(-50, 55).end,
          await new Img('assets/imagenes/headerPDF.png').relativePosition(0, 0).width(700).height(100).build(),
          await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(80, 40).build(),
          '\n',

          new Stack([
            new Columns([
              new Txt(`Cliente : ${this.clienteName}`).width(200).fontSize(11).end,
              new Txt(``).fontSize(11).end,
              new Txt(``).fontSize(11).end,
            ]).end,
            new Columns([
              new Txt(`Nit : ${this.clienteNit}`).fontSize(11).end,
              new Txt(``).fontSize(11).end,
              new Txt(``).fontSize(11).end,
            ]).end
          ]).width(100).relativePosition(20, 140).end,
          // new Txt (`Cliente : ${this.clienteName} \nNit : ${this.clienteNit}\nDirección : ${this.clienteAddres}`).relativePosition(60,140).fontSize(11).end,
          new Stack([
            new Txt('Reporte de Analitos\nCualitativos').margin([250, 0, 0, 20]).bold().fontSize(20).end,
            this.cabecero(infoCabecera)
          ]).margin(20).end
        ]).width('100%').height('auto').alignment('left').end);

      pdf.add(
        new Stack([
          this.crearTabla(cabeceros, body)
        ]).margin(20).width('*').alignment('center').end,
      )

      for (const key in arrGraficas) { //Graficas
        pdf.add(
          {
            alignment: "center",
            image: arrGraficas[key],
            height: 200,
            width: 600,
          }
        );
        // pdf.add('\n');
      }
      pdf.add(
        new Stack([
          new Txt([new Txt(`Homogeneidad y estabilidad:`).bold().end, ` La información relacionada con la homogeneidad y estabilidad de esta muestra ha sido declarada por el fabricante.
           `, new Txt(`Confidencialidad:`).bold().end, ` El informe presentado a continuación presenta información de caracter confidencia; la divulgación del mismo se realiza únicamente con el participante al cual corresponde; en caso que alguna autoridad requiera la socialización del mismo, esta solo se realiza con autorización expresa del participante.
           `, new Txt(`Subcontratación:`).bold().end, ` Annar Health Technologies no realiza la subcontratación de actividades relacionadas con la planificación, análisis y emisión de los reportes de resultados relacionados con los reportes de control de calidad externo.
           `, new Txt(`Autorizado Por :`).bold().end, ` ${this.nameUser + ' ' + this.lastNameUser}, especialista de producto`
          ]).end
        ]).pageBreak("before").end
      )

      async function getBase64ImageFromUrl(imageUrl) {
        var res = await fetch(imageUrl);
        var blob = await res.blob();

        return new Promise((resolve, reject) => {
          var reader = new FileReader();
          reader.addEventListener("load", function () {
            resolve(reader.result);
          }, false);

          reader.onerror = () => {
            return reject(this);
          };
          reader.readAsDataURL(blob);
        })
      }
      function footerFunc(img) {
        pdf.footer(function (page: any, pages: any) {
          return {
            // margin: [5, 0, 10, 0],
            height: 30,
            columns: [
              {
                alignment: "center",
                image: img,

                fit: [700, 100],
                absolutePosition: { x: 10, y: 10 }
              },
              {
                text: [
                  { text: 'Pag ' + page.toString() },
                  " - ",
                  { text: pages.toString() }
                ],
                color: 'white',
                fontSize: 8,
                absolutePosition: { x: 640, y: 38 }
              },

            ],

          }
        });
      }
      let base64Footer: any = '';
      await getBase64ImageFromUrl('assets/imagenes/footerPDF.png')
        .then(result => base64Footer = result)
        .catch(err => console.error(err));
      footerFunc(base64Footer);
      pdf.create().open();
    }, 3000);
  }

  // REPORTE DESEMPEÑO CUALITATIVO CLIENTE

  async PdfPlantillaCualiCliente(arrGraficas: any, cabeceros: string[], body: any[], cabeceros2: string[], body2: any[], headPuntuacion: any[], puntuacion: any[], infoCabecera: any, titulo?: string) {
    setTimeout(async () => {

      PdfMakeWrapper.setFonts(pdfFonts);
      const pdf = new PdfMakeWrapper();
      pdf.pageSize('B4');
      pdf.pageMargins([30, 230, 30, 50]);
      pdf.header(
        new Stack([
          new Canvas([
            new Line([298, 70], [300, 70]).lineWidth(160).lineColor('#6b4b8b').end,
          ]).absolutePosition(-50, 55).end,
          await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(80, 40).build(),
          '\n',
          new Txt(`Cliente : ${this.clienteName} \n`).relativePosition(60, 140).fontSize(11).end,
          new Stack([
            new Txt('Resultado del ensayo de aptitud\n(Evaluación externa del desempeño)').color('#6b4b8b').margin([250, 0, 0, 20]).bold().fontSize(20).end,
            new Table([['Programa:', 'Código de identificación'],
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
            ['Analito', ''],
            [
              new Cell(new Txt(`${infoCabecera.analito}`).bold().end).end,
              new Cell(new Txt('').bold().end).end,
            ],
            ]).widths('*')
              .margin([260, 0, 0, 20])
              .layout('noBorders')
              .fontSize(11)
              .end,
          ]).margin(20).end,
        ]).width('100%').height('auto').alignment('left').end);

      pdf.add(
        new Stack([
          new Txt([`Estimado participante, se sugiere leer atentamente el siguiente instructivo de interpretación de resultados, antes de proceder a su análisis.

            `,
            new Txt(`PARTE 1: DE LOS RESULTADOS`).bold().end,
            `

            `, new Txt(`N°:`).bold().end, ` El primer cuadro, indica el número de muestra del programa y las representa con código de colores.
            `, new Txt(`Código de Muestra:`).bold().end, ` Identificación de la muestra reportada.
            `, new Txt(`N :`).bold().end, ` Indica el total de laboratorios participantes.
            `, new Txt(`VP :`).bold().end, ` Verdaderos Reactivos Globales.
            `, new Txt(`VN :`).bold().end, ` Verdaderos No Reactivos Globales.
            `, new Txt(`FN :`).bold().end, ` Falsos No Reactivos Globales.
            `, new Txt(`FP :`).bold().end, ` Falsos Reactivos Globales.
            `, new Txt(`I :`).bold().end, ` Indeterminados.
            `, new Txt(`Consenso :`).bold().end, ` Indica el acuerdo consenso de cada una de las muestras del evento, el cual se obtiene a partir de un 80% de concordancia en los resultados obtenidos por todos los laboratorios participantes.
            `, new Txt(`Su Resultado :`).bold().end, ` Indica el resultado que su laboratorio reportó para cada una de las muestras del evento.
            `, new Txt(`C% o Concordancia :`).bold().end, ` Indica el grado de acuerdo existente entre lo reportado por el laboratorio y el consenso de los laboratorios participantes para determinada muestra; sin embargo, al tratarse valores cualitativos (Reactivo o No Reactivo) sólo existen dos posibilidades, o se obtiene 100% de concordancia, o se obtiene 0% de concordancia.
            `, new Txt(`Desempeño :`).bold().end, ` Califica la participación del laboratorio como Satisfactorio (si se tiene 100% de concordancia con el consenso) o Insatisfactorio (Si se tiene 0% de concordancia con el el consenso).
            `, new Txt(`Resultado :`).bold().end, ` Total de Concordancia%: Indica en porcentaje el número de resultados que el laboratorio reportó y que concuerdan 100% con el consenso.
            `, new Txt(`Desempeño :`).bold().end, ` Global: Califica el desempeño del laboratorio como Satisfactorio, si es que el 80% (4 resultados correctos de un total de 5) de los resultados emitidos por el laboratorio concuerdan con los resultados del Consenso, o Insatisfactorio si el consenso frente al grupo es < 80%.

            `,
            new Txt(`PARTE 2: DE LOS GRÁFICOS DE BARRA`).bold().end,
            `

            El gráfico de barras refleja el desempeño de todos los laboratorios participantes en cada una de las muestras del evento. El eje de las Ordenadas (Y) representa la cantidad de laboratorios participantes en el evento. El eje de las Abscisas (X) representa los posibles resultados. Se podrían llegar a observar una o más barras de acuerdo a los resultados reportados por los laboratorios participantes. El triángulo negro indica en dónde se ubica el resultado que su laboratorio reportó en una muestra determinada.

            `,
            new Txt(`PARTE 3: DE LOS GRÁFICOS DE PASTEL`).bold().end,
            `

            Estos gráficos expresan en porcentaje la cantidad de resultados obtenidos de todos los participantes en este evento para cada una de las muestras, nos indica el porcentaje de VP, VN, FN, FP o I que ha obtenido una muestra determinada.

            `,
            new Txt(`PARTE 4: DE LA PUNTUACIÓN SCORE`).bold().end,
            `

            La puntuación Score, permite calificar de forma proporcional el acierto o error en el que ha incurrido el laboratorio participante, de tal manera que se puede representar este desempeño en una gráfica Levey-Jenings.
            Cuando se habla en términos de proporcionalidad, se hace referencia a la gravedad del error que el laboratorio ha cometido, siendo así, un Falso No Reactivo (FN) representa el mayor de los errores en el que un laboratorio puede incurrir, motivo por el cual se le da una calificación de -10, mientras que un resultado Indeterminado representa un error menor, siendo sus calificaciones respectivas de  2 y un falso positivo 6.`]).margin([0, 15, 0, 0]).fontSize(12).alignment('left').end,
        ]).fontSize(11).margin([15, 0, 15, 80]).pageBreak('after').end,
      );

      pdf.add(
        new Stack([
          new Canvas([
            new Line([-40, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
          ]).relativePosition(0, 0).end,
          new Canvas([
            new Line([200, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
          ]).relativePosition(0, 0).end,
          new Txt(`Concordancia de resultados`).margin([0, 15, 0, 10]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
          this.crearTablaCualiCiente(cabeceros, body).end
        ]).margin([0, 0, 20, 0]).width(70).end,
      )

      pdf.add(
        new Stack([
          this.crearTablaCualiCiente2(cabeceros2, body2)
        ]).margin([0, 10, 20, 0]).width(50).alignment('center').end,
      )

      pdf.add(
        new Stack([
          new Canvas([
            new Line([-40, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
          ]).relativePosition(0, 0).end,
          new Canvas([
            new Line([130, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
          ]).relativePosition(0, 0).end,
          new Txt(`Desempeño global`).margin([0, 15, 0, 0]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
          this.crearColumnas(arrGraficas.barras)
        ]).margin([0, 0, 20, 0]).pageBreak('after').width(70).end,
      );

      pdf.add(
        new Stack([
          new Canvas([
            new Line([-40, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
          ]).relativePosition(0, 0).end,
          new Canvas([
            new Line([140, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
          ]).relativePosition(0, 0).end,
          new Txt(`Resultado consenso`).margin([0, 15, 0, 0]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
          this.crearColumnas(arrGraficas.torta, body)
        ]).margin([0, 0, 20, 60]).width(70).end,
      );

      pdf.add(
        new Stack([
          new Canvas([
            new Line([-40, 11], [-11, 11]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
          ]).relativePosition(0, 0).end,
          new Canvas([
            new Line([130, 11], [750, 11]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
          ]).relativePosition(0, 0).end,


          new Txt(`Puntuación SCORE`).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
          new Columns([
            this.crearTablaPuntuacion(headPuntuacion, puntuacion),
            await new Img(arrGraficas.lineas).fit([500, 180]).width(500).build(),
          ]).alignment('center').end
        ]).margin([0, 0, 20, 10]).width('100%').end,
      );

      pdf.add(
        new Stack([
          new Txt([new Txt(`Homogeneidad y estabilidad:`).bold().end, ` La información relacionada con la homogeneidad y estabilidad de esta muestra ha sido declarada por el fabricante.
           `, new Txt(`Confidencialidad:`).bold().end, ` El informe presentado a continuación presenta información de caracter confidencia; la divulgación del mismo se realiza únicamente con el participante al cual corresponde; en caso que alguna autoridad requiera la socialización del mismo, esta solo se realiza con autorización expresa del participante.
           `, new Txt(`Subcontratación:`).bold().end, ` Annar Health Technologies no realiza la subcontratación de actividades relacionadas con la planificación, análisis y emisión de los reportes de resultados relacionados con los reportes de control de calidad externo.
           `, new Txt(`Autorizado Por :`).bold().end, ` ${this.nameUser + ' ' + this.lastNameUser},especialista de producto`
          ]).end
        ]).margin(20).end
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


  crearColumnas(graf, titulos?: any): any[] {
    let newArray = [];
    let arregloDeArreglos = [];
    let arregloDeTitulos = [];
    const long = 3; // Partir en arreglo de 4
    for (let i = 0; i < graf.length; i += long) {
      let itemArr = graf.slice(i, i + long);
      arregloDeArreglos.push(itemArr);

      if (titulos != undefined) {
        let titleArr = titulos.slice(i, i + long);
        arregloDeTitulos.push(titleArr);
      }
    }

    arregloDeArreglos.map((x: any, index: number) => {
      newArray[index] = new Stack([
        new Columns([
          new Stack([
            titulos != undefined ? '' : '',
            { alignment: "center", image: x[0], height: 200, width: 200 }
          ]).end,
          new Stack([
            x[1] != undefined ? { alignment: "center", image: x[1], height: 200, width: 200 } : ''
          ]).end,
          new Stack([
            x[2] != undefined ? { alignment: "center", image: x[2], height: 200, width: 200 } : ''
          ]).end
        ]).columnGap(5).alignment('center').fontSize(11).margin([0, 10, 0, 10]).width('90%').end
      ]).end
    });
    return newArray
  }

  crearTablaCualiCiente(cabeceros: string[], body: any[]) {
    let relleno = '';
    let head = cabeceros.map((x: any) => {
      let newarr = [
        new Cell(new Txt(x).bold().color('white').end).end,
      ]
      return newarr
    })
    let celdas = body.map((x: any, index: number) => {
      let newarr = [
        new Cell(new Txt(x.n).bold().end).end,
        new Cell(new Txt(x.sample).bold().end).end,
        new Cell(new Txt(x.tvp).bold().end).end,
        new Cell(new Txt(x.tvn).bold().end).end,
        new Cell(new Txt(x.tfp).bold().end).end,
        new Cell(new Txt(x.tfn).bold().end).end,
        new Cell(new Txt(x.ti).bold().end).end,
        new Cell(new Txt(x.consenso).bold().end).end,
        new Cell(new Txt(x.resultado).bold().end).end,
        new Cell(new Txt(x.c).bold().end).end,
        new Cell(new Txt(x.desempeno).bold().end).end
      ]
      return newarr
    })

    return new Table([head, ...celdas])
      .widths([20, 90, 20, 20, 20, 20, 20, 70, 70, 60, 90])
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
      .alignment('center')

  }


  crearTablaCualiCiente2(cabeceros: string[], body: any[]) {
    let relleno = '';
    let head = cabeceros.map((x: any) => {
      let newarr = [
        new Cell(new Txt(x).bold().color('white').end).end,
      ]
      return newarr
    })
    let celdas = body.map((x: any, index: number) => {
      let newarr = [
        new Cell(new Txt(x.resultConcor).bold().end).end,
        new Cell(new Txt(x.desempeGlobal).bold().end).end,
      ]
      return newarr
    })

    return new Table([head, ...celdas])
      .widths([100, 100])
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
      // .alignment('center')
      .end
  }

  crearTablaPuntuacion(cabeceros: string[], body: any[]) {
    let relleno = '';
    let head = cabeceros.map((x: any) => {
      let newarr = [
        new Cell(new Txt(x).bold().color('white').end).end,
      ]
      return newarr
    })
    let celdas = body.map((x: any, index: number) => {
      let newarr = [
        new Cell(new Txt(x.cod).bold().end).end,
        new Cell(new Txt(x.dev).bold().end).end,
      ]
      return newarr
    })

    return new Table([head, ...celdas])
      .widths([70, 70])
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
      .margin([0, 20])
      // .alignment('center')
      .end
  }


  definirColor(titulo:string,dato1:number,dato2:number){
    if(titulo === 'Z-score'){
      return dato1 === dato2 && dato1 ? '' :'' 
    }
  }

  // Reporte cuantitativo externo

  crearTablaExternoCuantitativo(cabeceros: string[], body: any,posicionIndex:number, ancho: any = '*') {
    let relleno = '';
    let color:string='';
    let numBase = posicionIndex;
    let celdas: any[] = body.map((datos: any, index: number) => {
      let newObj = [];
      Object.keys(datos).map((x2: any, index: number) => {
        color='black';
        // Las posicion de colores en la primera tabla la cual inicia en 7 ---- en caso de ser resumen de muestra o ronda
        if (posicionIndex === 7){
          if(index === 7){
            color = 'red';
            if(datos[x2] < 1 && datos[x2] > -1) color = 'green';
          }
          if(index === 8){
            color = 'red';
            if(datos[x2] < 2 && datos[x2] > -2) color = 'green';
          }
        }   
        // Las posicion de colores en la segunda tabla la cual inicia en 8  ---- en caso de ser resumen de muestra o ronda
        if (posicionIndex === 8){
          if(index === 8){
            color = 'red';
            if(datos[x2] < 1 && datos[x2] > -1) color = 'green';
          }
          if(index === 9){
            color = 'red';
            if(datos[x2] < 2 && datos[x2] > -2) color = 'green';
          }
        }     
        newObj.push(new Cell(new Txt(datos[x2]).color(color).bold().end).border([false]).end)
      })
      return newObj
    })

    const divisor = ancho !== '*'?456:650
    const anchoCeldas =  cabeceros.map(x => divisor/cabeceros.length ) ;

    return new Table([cabeceros.map(x => new Cell(new Txt(x).bold().color('white').end).border([false]).end), ...celdas])
      .width(ancho)
      .widths(anchoCeldas)
      .fontSize(11)
      .layout({
        fillColor: (rowIndex: number | undefined, node: any, columnIndex: number | undefined) => {
          if (rowIndex === 0) {
            relleno = '#3850eb'
          } else {
            if (rowIndex! % 2 === 0) {
              relleno = '#ECF3F8'
            } else {
              relleno = 'white'
            }
          }
          return relleno
        },
      })
      .margin([0, 10, 0, 10])
      .alignment('center')
      .dontBreakRows(false)
      .end
  }

  async PdfExternoCuantitativo(arrInformacionPDF: any[], infoCabero: any, resumenMuestras: any[], cabecerosResumen: any[],resumenRonda: any[],imagenesRonda:any[] ,clienteInfo:any) {

    if (clienteInfo.isClient) {
      await this.getLogoSourceClient(clienteInfo.header);
      this.clienteName = clienteInfo.nameClient;
    }
    PdfMakeWrapper.setFonts(pdfFonts);
    const pdf = new PdfMakeWrapper();
    pdf.pageSize({ width: 789, height: 1001 });
    pdf.pageMargins([30, 30, 40, 50]);
    pdf.add(
      new Stack([
        new Canvas([
          new Line([298, 70], [300, 70]).lineWidth(200).lineColor('#6E6E6E').end,
        ]).absolutePosition(-20, 75).end,
        await new Img('assets/imagenes/headerPDF.png').absolutePosition(0, 0).width(789).height(100).build(),
        await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(60, 10).build(),
        '\n',
        new Stack([
          new Columns([
            new Txt(`Cliente : ${this.clienteName}`).fontSize(11).end,
            new Txt(``).fontSize(11).end,
            new Txt(``).fontSize(11).end,
          ]).end,
        ]).width(100).relativePosition(0, 120).end,
        new Stack([
          new Txt('Reporte de control de \ncalidad externo cuantitativo').bold().fontSize(20).end,
          {
            canvas: [{ type: 'line', x1: 0, y1: 10, x2: 250, y2: 10, lineWidth: 2, lineColor: '#6E6E6E' },]
          },
          new Txt('Evaluación externa de la calidad / ensayo de aptitud').margin([0, 5, 0, 5]).color('#0059ff').bold().fontSize(11).end,
          new Table([
                    ['Programa', 'Ronda','Cod. Lab'],
                    [
                      new Cell(new Txt(`${infoCabero.programa}`).bold().end).end,
                      new Cell(new Txt(`${infoCabero.ronda}`).bold().end).end,
                      new Cell(new Txt(`${infoCabero.cod}`).bold().end).end,
                    ],
                    [ 'Muestra','Condiciones de la muestra', 'Tipo de muestra:'],
                    [
                      new Cell(new Txt(`${infoCabero.muestra}`).bold().end).end,
                      new Cell(new Txt(`${infoCabero.condicionesmuestra}`).bold().end).end,
                      new Cell(new Txt(`${infoCabero.tipomuestra}`).bold().end).end,
                    ],
                    ['Fecha de impresion', 'Fecha de Recepción','Fecha final'],
                    [
                      new Cell(new Txt(`${infoCabero.fecha}`).bold().end).end,
                      new Cell(new Txt(`${infoCabero.fecharecepcion}`).bold().end).end,
                      new Cell(new Txt(`${infoCabero.fechaFinal}`).bold().end).end,
                    ]
          ]).widths('*')
            .layout('noBorders')
            .fontSize(11)
            .end,
            new Txt(['Muestras recibidas en buenas condiciones  ', new Txt(`Si :  ${infoCabero.si}     No: ${infoCabero.no}`).bold().end]).margin([0,10,0,0]).end
        ]).margin([280, 0, 0, 0]).end
      ]).margin([0, 0, 0, 0]).width('100%').height('auto').alignment('left').end);

    pdf.add(
      new Stack([
        new Txt([
           new Txt(`INFORMACIÓN GENERAL`).width('*').alignment('center').bold().fontSize(14).end, `
          `, new Txt('').bold().end, ` 
          `, new Txt(`Homogeneidad y estabilidad:`).bold().end, ` La información relacionada con la homogeneidad y estabilidad de esta muestra ha sido declarada por el fabricante.\n
          `, new Txt(`Confidencialidad:`).bold().end, ` El informe presentado a continuación presenta información de caracter confidencia; la divulgación del mismo se realiza únicamente con el participante al cual corresponde; en caso que alguna autoridad requiera la socialización del mismo, esta solo se realiza con autorización expresa del participante.\n
          `, new Txt(`Subcontratación:`).bold().end, ` Annar Health Technologies no realiza la subcontratación de actividades relacionadas con la planificación, análisis y emisión de los reportes de resultados relacionados con los reportes de control de calidad externo.
          `, new Txt(`\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n Autorizado Por :`).bold().end, ` ${this.nameUser + ' ' + this.lastNameUser}, especialista de producto`
        ]).end
      ]).margin([0, 30]).pageBreak("after").end
    );

    pdf.add(
      new Stack([
        new Txt([
            new Txt('CRITERIOS DE EVALUACIÓN').width('*').alignment('center').bold().margin([ 0, 0, 30, 0]).fontSize(14).end, `
          `, new Txt(`\nCada uno de los analitos contemplados en el informe se evaluan frente a dos criterios de evaluación:\n`).bold().end, ` 
          `, new Txt(`Índice de desvio:`).bold().end, ` El resultado es evaluado contra el valor previamente asignado como verdadero; el resultado se considera satisfactorio si el índice del desvio se encuentra entre +/- 1.\n
          `, new Txt(`Z-score:`).bold().end, ` El resultado es evaluado contra un grupo de comparación seleccionado: Equipo-método, método o Todos los resultados; el resultado se considera satisfactorio si el Z-score o puntaje Z se encuentra entre +/- 2. \n
          `, new Txt(`Interpretación del informe:\n`).bold().end, ` 
          `, new Txt(`Convenciones:\n`).bold().end, ` 
          `, new Txt(`DS:`).bold().end, ` Desviación Estándar. 
          `, new Txt(`CV:`).bold().end, ` Coeficiente de variación.
          `, new Txt(`Um:`).bold().end, ` Incertidumbre.
          `, new Txt(`RMZs:`).bold().end, ` Acumulado Z-score, a partir de la sexta muestra.
          `, new Txt(`RMID:`).bold().end, ` Acumulado indice de desviación estándar, a partir de la sexta muestra.\n
          `, new Txt(`ID:`).bold().end, ` Indice de desvio.
          `, new Txt(`ZS:`).bold().end, ` Z-score.`,
        ]).end
      ]).margin([0, 0]).pageBreak("after").end
    );

    arrInformacionPDF.forEach((x: any, j) => {
      let i = 0;
      const arrGraficas: any[] = x[0];
      const cabecerosTablas: any[] = x[2];
      const arrTablas: any[] = x[1];
      const cabeceroDocumento: any = x[3];

      pdf.add(
        new Stack([
          new Txt('Analito: ' + cabeceroDocumento.analito).width('*').alignment('left').bold().margin([0, 0, 0, 0]).fontSize(20).end,
          new Txt([`Equipo: `, new Txt(cabeceroDocumento.equipo).decoration('underline').color('#0059ff').end ,
                 `    Metodo: `, new Txt(cabeceroDocumento.metodo).decoration('underline').color('#0059ff').end ,
                 `    Reactivo: `, new Txt(cabeceroDocumento.reactivo).decoration('underline').color('#0059ff').end ,
                 `    Unidades: `, new Txt(cabeceroDocumento.unidades).decoration('underline').color('#0059ff').end ,` `
                ]).width('*').alignment('left').bold().margin([0, 0, 0, 0]).fontSize(11).end,
          new Txt('\nEstadística General').color('#0059ff').width('*').bold().fontSize(20).end,
          { canvas: [{ type: 'line', x1: -30, y1: 10, x2: 780, y2: 10, lineWidth: 2, lineColor: '#0059ff', }] },
        ]).end
      );

      for (const key in arrGraficas) {
        let img: any[] = []
        //Graficas
        if (typeof arrGraficas[key] !== 'string') {
          img = arrGraficas[key];
        } else {
          img = [arrGraficas[key]];
        }
        const retornarGrafica = () => {
          if(img === null ) return new Txt('').end
          let imagenes = img.map(x => {
            return {
              alignment: "center",
              image: x,
              height: 180,
              width: 600,
              margin:[0,0,0,20]
            }
          })
          return new Stack([...imagenes]).alignment('center').end
        }

        const tablaReturn = () => {
          let nuevoObj: any[] = [];
          let titulo = ''
          switch (arrGraficas[key]) {
            case arrGraficas[0]:
              titulo = 'Estadística de Comparación';
              break;
              //Por requerimiento de quitar el valor asignado y zcore se cambia el 1 por el 0 
              // case arrGraficas[1]:
            case arrGraficas[0]:
              titulo = 'Evaluación de Procedimiento';
              break;
            default:
              break;
          }

          if (arrGraficas[key] !== arrGraficas[2]) {
            let tituloEstilo = [
              new Txt(titulo).width('*').alignment('left').bold().margin([0, 25, 0, 0]).decoration('underline').color('#0059ff').fontSize(18).end,
              //Descomentarear una vez se pida que vuelva a ponerse el valor asignado
              //arrGraficas[key] === arrGraficas[0] ? new Txt('Valor asignado : ' + cabeceroDocumento.valorAsign).width('*').alignment('left').bold().margin([0, 10, 0, 0]).fontSize(11).end:'',
              arrGraficas[key] === arrGraficas[0] ? new Txt('Muestra : ' + infoCabero.muestra).width('*').alignment('left').bold().margin([0, 10, 0, 0]).fontSize(11).end : '',
            ];
            nuevoObj.push(...tituloEstilo);
          }

          //Se salta la posición uno donde son guardadas las graficas de indices de desvio. 
          //Esto es nuevo con el requerimiento de Leidy Paola, por favor quitarlo una vez se agregue el indice de desvio y zcore
          let e = 1;
          if (i === 1){
            e++;
          }
          else{
            e = i;
          }

          //Antes
          //let tablaTitulo = arrGraficas[key] === arrGraficas[1] ?'Comparación Valor Asignado':arrGraficas[key] === arrGraficas[2] ?'Comparación Z-score':null;
          //tablaTitulo === null? tablaTitulo = '':'';
          //nuevoObj.push(
          //  new Stack([
          //    new Txt(tablaTitulo).width('*').alignment('left').bold().margin([0, 25, 0, 0]).color('#0059ff').fontSize(14).end,
          //    new Columns([
          //      this.crearTablaExternoCuantitativo(cabecerosTablas[i], arrTablas[i],0, '*')
          //    ]).columnGap(20).end
          //  ]).end);
          //return nuevoObj
        //}
        
          //Req Leidy Paola
          //Ahora 
          let tablaTitulo =arrGraficas[key] === arrGraficas[2] ?'Comparación Z-score':null;
          tablaTitulo === null? tablaTitulo = '':'';
          nuevoObj.push(
            new Stack([
              new Txt(tablaTitulo).width('*').alignment('left').bold().margin([0, 25, 0, 0]).color('#0059ff').fontSize(14).end,
              new Columns([
                this.crearTablaExternoCuantitativo(cabecerosTablas[e], arrTablas[e],0, '*')
              ]).columnGap(20).end
            ]).end);
          return nuevoObj
        }
      

        pdf.add(
          new Stack([
            new Stack([
              tablaReturn()
            ]).end,
            retornarGrafica()
          ]).end
        );
        i++;
      }

      if (x !== arrInformacionPDF[arrInformacionPDF.length - 1]) {
        pdf.add(new Txt('').pageBreak("after").end);
      }
    })

    //Req Leidy Paola
    //Eliminar por el momento el indice de desvio y valor asignado. 
    const iterarResumenMuestra = resumenMuestras.filter(x => x.resultado !== '');
    iterarResumenMuestra.forEach(el => delete el.indiceDesvio && delete el.valorAsignado);

    if(iterarResumenMuestra.length !== 0 ){
      pdf.add(new Txt('').pageBreak("after").end);
      pdf.add(
        new Stack([
          new Txt('Resumen de muestra').width('*').alignment('left').bold().margin([0, 25, 0, 0]).color('#0059ff').fontSize(20).end,
          { canvas: [{ type: 'line', x1: -30, y1: 10, x2: 780, y2: 10, lineWidth: 2, lineColor: '#0059ff', }]},
          new Stack([
            new Columns([
              this.crearTablaExternoCuantitativo(cabecerosResumen[0], iterarResumenMuestra,7, '*')
            ]).columnGap(20).end,
            await new Img(imagenesRonda[0]).width(600).alignment('center').build(),
            //Req Leidy Paola
            //await new Img(imagenesRonda[1]).width(600).alignment('center').build()
          ]).end
        ]).end
      )
    }

    //Req Leidy Paola
    //Se quita el indice de desvio
    debugger
    resumenRonda.forEach(el => delete el.IndiceDesv);

    pdf.add(new Txt('').pageBreak("after").end);
    pdf.add(
      new Stack([
        new Txt('Resumen de ronda').width('*').alignment('left').bold().margin([0, 25, 0, 0]).color('#0059ff').fontSize(20).end,
        { canvas: [{ type: 'line', x1: -30, y1: 10, x2: 780, y2: 10, lineWidth: 2, lineColor: '#0059ff', }]},
        new Stack([
          new Columns([
            this.crearTablaExternoCuantitativo(cabecerosResumen[1], resumenRonda.filter(x => x.Result !== ''),8,'*')
          ]).columnGap(20).end
        ]).end
      ]).end
    )

    async function getBase64ImageFromUrl(imageUrl) {
      var res = await fetch(imageUrl);
      var blob = await res.blob();

        return await new Promise((resolve, reject) => {
          var reader = new FileReader();
          reader.addEventListener("load", function () {
            resolve(reader.result);
          }, false);
          reader.onerror = () => {
            return reject(this);
          };
          reader.readAsDataURL(blob);
        })  
      
    }

    function footerFunc(img) {
      pdf.footer(function (page: any, pages: any) {
        return {
          height: 40,
          columns: [
            {
              alignment: "center",
              image: img,
              fit: [789, 150],
              absolutePosition: { x: 10, y: 10 }
            },
            {
              text: [
                { text: 'Pag ' + page.toString() },
                " - ",
                { text: pages.toString() }
              ],
              color: 'white',
              fontSize: 8,
              absolutePosition: { x: 640, y: 38 }
            },

          ],

        }
      });
    }

    await getBase64ImageFromUrl('assets/imagenes/footerPDF.png')
      .then(result => footerFunc(result))
      .catch(err => console.error(err));

    pdf.create().open();
  }
}

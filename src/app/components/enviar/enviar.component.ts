import { Component, OnInit } from '@angular/core';
import * as jsPDF from "jspdf";
import { ActivatedRoute, Router } from "@angular/router";
import { AnalisisService } from "../../services/analisis/analisis.service";
import { imgData } from "../../globals";
import { Analisis } from "src/app/common/interface";
import { delay } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-enviar',
  templateUrl: './enviar.component.html'
})
export class EnviarComponent implements OnInit {

  jwt: string;
  prefix: string;
  actID: number;
  actString: string;
  actRoute: Array<string> = [];
  analisisEnv: Array<Analisis> = [];
  paciente: string;
  fecha: string;
  doc = new jsPDF();
  decision: string;
  sangria: number;
  altura: number;
  alturaItems: number;

  constructor(
    private serviceA: AnalisisService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    console.log(this.activatedRoute);
    this.actString = this.activatedRoute.snapshot.params["an"];
    this.actID = this.activatedRoute.snapshot.params["id"];
   }

  ngOnInit() {
    var reqdata;
    this.jwt = localStorage.getItem("token");
    this.prefix = localStorage.getItem('prefix');
    this.actRoute = JSON.parse("[" + this.actString + "]");
    for (var i = 0; i < this.actRoute.length; i++) {
      this.serviceA
        .getUnAnalisis(this.jwt, this.prefix, this.actID, this.actRoute[i])
        .then(ok => {
          this.analisisEnv.push(ok.body);
        })
        .catch(error => {
          // this.load = false;
        });
    }
    this.decision = 'si';
    setTimeout(() => {
    this.downloadPDF(this.decision);
    }, 8000);
    this.router.navigate(["/pacientes/" + this.actID + "/analisis"]);
  }


  getFormatoFecha(fecha: string) {
    let splitted = fecha.split("T", 1);
    let dd: string, mm: string, yyyy: string, mes: Number;
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "Mayo", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    fecha = splitted[0];
    fecha = fecha.substring(0, 10);
    yyyy = fecha.substring(0, 4);
    mm = fecha.substring(5, 7);
    mes = Number(mm) -1;
    mm = monthNames[mes.toString()];
    dd = fecha.substring(8, 10);

    fecha = dd.concat("-", mm, "-", yyyy);
    console.log(fecha);
    return fecha;
  }

  cabecera() {
    this.doc.addImage(imgData, "JPEG", 10, 10, 40, 25);

    this.doc.setDrawColor(0, 0, 255);
    this.doc.line(5, 5, 205, 5);

    this.doc.setFont("helvetica");
    this.doc.setFontType("normal");
    this.doc.setFontSize(14);
    this.doc.text(55, 16, "LABORATORIOS DE ANALISIS CLINICOS ESPINOSA");

    this.doc.setFontSize(8);
    this.doc.text(
      61,
      21,
      "Suc. Centro, Calle Hidalgo No. 9 Int 1-A Tel. (469) 692 08 75 Pénjamo. Gto."
    );
    this.doc.text(
      60,
      25,
      "Suc. Arboledas, Prol. Insurgentes No. 100 Tel.(469) 692 21 95 Pénjamo. Gto."
    );
    this.doc.text(
      69,
      29,
      "Universidad de Guanajuato Ced. Profesional 1888051 SSA 1931"
    );
    this.doc.text(
      65,
      33,
      "Instituto de Hemopatología Ced. Especialidad 5554071 SSA Esp. 4564"
    );

    this.doc.line(5, 40, 205, 40);
  }


  downloadPDF(membrete: string) {
    if (membrete != null) {
      this.cabecera();
    }
    this.altura = 50;
    this.alturaItems = 60;

    this.sangria = 10;
    this.doc.setFontSize(8.5);
    this.doc.setFontType("normal");
    this.doc.text("Examen practicado a: ", this.sangria, this.altura);
    this.doc.setFontType("normal");
    this.sangria = 156;
    this.doc.text("Fecha de aplicación: ", this.sangria, this.altura);
    //console.log(this.analisisEnv);
    this.sangria = 40;
    this.doc.setFontType("bold");
    this.doc.text(
      this.analisisEnv[0].paciente.toString(),
      this.sangria,
      this.altura
    );
    this.sangria = 185;
    this.fecha = this.analisisEnv[0].fecha.toString();
    this.fecha = this.getFormatoFecha(this.fecha);
    this.doc.text(this.fecha, this.sangria, this.altura);
    this.altura = 50;
    this.sangria = 10;
    this.doc.setFontType("normal");
    this.doc.text("Practicado por  el médico: ", this.sangria, this.altura + 4);
    this.sangria = 45;
    this.doc.setFontType("bold");
    this.doc.text(
      this.analisisEnv[0].medico.toString(),
      this.sangria,
      this.altura + 4
    );

    this.doc.line(5, this.altura + 8, 205, this.altura + 8);

    for (var i = 0; i < this.analisisEnv.length; i++) {
      if (this.alturaItems >= 240) {
        this.doc.addPage();
        if (membrete != null) {
          this.cabecera();
        }
        this.alturaItems = 60;
      }
      let product = this.analisisEnv[i];
      this.paciente = product.paciente;

      this.alturaItems = this.alturaItems + 5;
      this.sangria = 10;
      this.doc.setFontSize(10);
      this.doc.setFontType("bold");
      this.doc.text(
        product.analisis.toString(),
        this.sangria,
        this.alturaItems
      );

      /**
       * Cambio para Espermatobioscopía
       * 02-03-2020
       * INICIO
       */
      if (product.analisis.toString() == "ESPERMATOBIOSCOPIA") {
        product.json.forEach(x => {
          this.doc.setFontSize(8);
          this.doc.setFontType("bold");

          if (x.subtitulo.toString() == "ESPERMATOBIOSCOPIA DIRECTA") {
            this.sangria = 10;
            this.alturaItems = 70;
          }
          if (x.subtitulo.toString() == "MORFOLOGIA") {
            this.sangria = 50;
            this.alturaItems = 155;
            this.doc.text(
              "VALORES DE REFERENCIA: POR CRITERIOS ESTRICTOS DE KRUGER >= 14%",
              this.sangria,
              this.alturaItems
            );
            this.doc.rect(47, 146.5, 112, 9.6);
            this.sangria = 90;
            this.alturaItems = 150;
          }
          if (
            x.subtitulo.toString() == "MOTILIDAD" ||
            x.subtitulo.toString() == "MOBILIDAD"
          ) {
            this.sangria = 140;
            this.alturaItems = 70;
          }
          this.doc.text(x.subtitulo.toString(), this.sangria, this.alturaItems);

          this.doc.setFontType("normal");
          this.doc.setFontSize(8);
          this.alturaItems = this.alturaItems + 1;

          x.items.forEach(y => {
            if (y.prueba == "Días de abstinencia:") {
              this.alturaItems = 74;
              this.sangria = 10;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 38;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString() + "     Días",
                  this.sangria,
                  this.alturaItems
                );
              this.doc.rect(37, 71.5, 5.2, 3);
            }

            if (y.prueba == "Aspecto:") {
              this.alturaItems = 78;
              this.sangria = 10;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 38;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.rect(37, 75.5, 5.2, 3);
              this.sangria = 44;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "Licuefacción:") {
              this.alturaItems = 82;
              this.sangria = 10;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 38;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.rect(37, 79.5, 5.2, 3);
            }

            if (y.prueba == "Viscosidad:") {
              this.alturaItems = 86;
              this.sangria = 10;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 38;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.rect(37, 83.5, 5.2, 3);
            }

            if (y.prueba == "Volumen:") {
              this.alturaItems = 90;
              this.sangria = 10;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 38;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.rect(37, 87.5, 5.2, 3);
              this.sangria = 44;
              if (y.unidades != null)
                this.doc.text(
                  y.unidades.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 48;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "pH:") {
              this.alturaItems = 94;
              this.sangria = 10;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 38;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.rect(37, 91.5, 5.2, 3);
              this.sangria = 44;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "Concentración:") {
              this.alturaItems = 110;
              this.sangria = 20;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 50;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(40, this.alturaItems + 1, 63, this.alturaItems + 1);
              this.sangria = 67;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.rect(65, 107, 39, 4);
            }

            if (y.prueba == "Viabilidad:") {
              this.alturaItems = 115;
              this.sangria = 20;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 50;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(40, this.alturaItems + 1, 63, this.alturaItems + 1);
              this.sangria = 67;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "Leucocitos:") {
              this.alturaItems = 120;
              this.sangria = 20;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 50;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(40, this.alturaItems + 1, 63, this.alturaItems + 1);
              this.sangria = 67;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "Aglutinación:") {
              this.alturaItems = 125;
              this.sangria = 20;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 45;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(40, this.alturaItems + 1, 63, this.alturaItems + 1);
              this.sangria = 67;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "Bacterias:") {
              this.alturaItems = 110;
              this.sangria = 120;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 137;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(
                134,
                this.alturaItems + 1,
                153,
                this.alturaItems + 1
              );
              this.sangria = 157;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "Eritrocitos:") {
              this.alturaItems = 115;
              this.sangria = 120;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 140;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(
                134,
                this.alturaItems + 1,
                153,
                this.alturaItems + 1
              );
              this.sangria = 157;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "Cel. Germinales:") {
              this.alturaItems = 120;
              this.sangria = 120;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 153;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(
                145,
                this.alturaItems + 1,
                164,
                this.alturaItems + 1
              );
              this.sangria = 167;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "Cel. Epiteliales:") {
              this.alturaItems = 125;
              this.sangria = 120;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 153;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(
                145,
                this.alturaItems + 1,
                164,
                this.alturaItems + 1
              );
              this.sangria = 167;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "Dentritus celulares:") {
              this.alturaItems = 130;
              this.sangria = 120;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 153;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(
                145,
                this.alturaItems + 1,
                164,
                this.alturaItems + 1
              );
              this.sangria = 167;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "A") {
              this.alturaItems = 74;
              this.sangria = 140;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 152;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 155;
              if (y.unidades != null)
                this.doc.text(
                  y.unidades.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(
                145,
                this.alturaItems + 1,
                164,
                this.alturaItems + 1
              );
              this.sangria = 167;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.text(
                "VR. A >= 25%",
                this.sangria,
                66
              );
              this.doc.text(
                "A y B >= 50%",
                this.sangria,
                69
              );
            }

            if (y.prueba == "B") {
              this.alturaItems = 78;
              this.sangria = 140;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 152;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 155;
              if (y.unidades != null)
                this.doc.text(
                  y.unidades.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(
                145,
                this.alturaItems + 1,
                164,
                this.alturaItems + 1
              );
              this.sangria = 167;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "C") {
              this.alturaItems = 82;
              this.sangria = 140;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 152;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 155;
              if (y.unidades != null)
                this.doc.text(
                  y.unidades.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(
                145,
                this.alturaItems + 1,
                164,
                this.alturaItems + 1
              );
              this.sangria = 167;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "D") {
              this.alturaItems = 86;
              this.sangria = 140;
              if (y.prueba != null)
                this.doc.text(
                  y.prueba.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 152;
              if (y.resultados != null)
                this.doc.text(
                  y.resultados.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.sangria = 155;
              if (y.unidades != null)
                this.doc.text(
                  y.unidades.toString(),
                  this.sangria,
                  this.alturaItems
                );
              this.doc.line(
                145,
                this.alturaItems + 1,
                164,
                this.alturaItems + 1
              );
              this.sangria = 167;
              if (y.referencia != null)
                this.doc.text(
                  y.referencia.toString(),
                  this.sangria,
                  this.alturaItems
                );
            }

            if (y.prueba == "NORMALES") {
              this.alturaItems = 160;
              this.sangria = 20;
              if (y.prueba != null)
                this.doc.text(y.prueba.toString(), this.sangria, this.alturaItems);
              this.sangria = 46;
              if (y.resultados != null)
                this.doc.text(y.resultados.toString(), this.sangria, this.alturaItems);
              this.doc.rect(45, 157, 8, 4);
              this.sangria = 50;
              if (y.unidades != null)
                this.doc.text(y.unidades.toString(), this.sangria, this.alturaItems);
            }

            if (y.prueba == "MACROCEFALOS") {
              this.alturaItems = 165;
              this.sangria = 20;
              if (y.prueba != null)
                this.doc.text(y.prueba.toString(), this.sangria, this.alturaItems);
              this.sangria = 46;
              if (y.resultados != null)
                this.doc.text(y.resultados.toString(), this.sangria, this.alturaItems);
              this.doc.rect(45, 162, 8, 4);
              this.sangria = 50;
              if (y.unidades != null)
                this.doc.text(y.unidades.toString(), this.sangria, this.alturaItems);
            }

            if (y.prueba == "MICROCEFALOS") {
              this.alturaItems = 170;
              this.sangria = 20;
              if (y.prueba != null)
                this.doc.text(y.prueba.toString(), this.sangria, this.alturaItems);
              this.sangria = 46;
              if (y.resultados != null)
                this.doc.text(y.resultados.toString(), this.sangria, this.alturaItems);
              this.doc.rect(45, 167, 8, 4);
              this.sangria = 50;
              if (y.unidades != null)
                this.doc.text(y.unidades.toString(), this.sangria, this.alturaItems);
            }


            if (y.prueba == "PIRIFORMES") {
              this.alturaItems = 160;
              this.sangria = 80;
              if (y.prueba != null)
                this.doc.text(y.prueba.toString(), this.sangria, this.alturaItems);
              this.sangria = 105;
              if (y.resultados != null)
                this.doc.text(y.resultados.toString(), this.sangria, this.alturaItems);
              this.doc.rect(104, 157, 8, 4);
              this.sangria = 109;
              if (y.unidades != null)
                this.doc.text(y.unidades.toString(), this.sangria, this.alturaItems);
            }

            if (y.prueba == "COLA ANORMAL") {
              this.alturaItems = 165;
              this.sangria = 80;
              if (y.prueba != null)
                this.doc.text(y.prueba.toString(), this.sangria, this.alturaItems);
              this.sangria = 105;
              if (y.resultados != null)
                this.doc.text(y.resultados.toString(), this.sangria, this.alturaItems);
              this.doc.rect(104, 162, 8, 4);
              this.sangria = 109;
              if (y.unidades != null)
                this.doc.text(y.unidades.toString(), this.sangria, this.alturaItems);
            }

            if (y.prueba == "AMORFOS") {
              this.alturaItems = 170;
              this.sangria = 80;
              if (y.prueba != null)
                this.doc.text(y.prueba.toString(), this.sangria, this.alturaItems);
              this.sangria = 105;
              if (y.resultados != null)
                this.doc.text(y.resultados.toString(), this.sangria, this.alturaItems);
              this.doc.rect(104, 167, 8, 4);
              this.sangria = 109;
              if (y.unidades != null)
                this.doc.text(y.unidades.toString(), this.sangria, this.alturaItems);
            }

            if (y.prueba == "ACINTADOS") {
              this.alturaItems = 160;
              this.sangria = 140;
              if (y.prueba != null)
                this.doc.text(y.prueba.toString(), this.sangria, this.alturaItems);
              this.sangria = 172;
              if (y.resultados != null)
                this.doc.text(y.resultados.toString(), this.sangria, this.alturaItems);
              this.doc.rect(171, 157, 8, 4);
              this.sangria = 176;
              if (y.unidades != null)
                this.doc.text(y.unidades.toString(), this.sangria, this.alturaItems);
            }

            if (y.prueba == "ALFILER") {
              this.alturaItems = 165;
              this.sangria = 140;
              if (y.prueba != null)
                this.doc.text(y.prueba.toString(), this.sangria, this.alturaItems);
              this.sangria = 172;
              if (y.resultados != null)
                this.doc.text(y.resultados.toString(), this.sangria, this.alturaItems);
              this.doc.rect(171, 162, 8, 4);
              this.sangria = 176;
              if (y.unidades != null)
                this.doc.text(y.unidades.toString(), this.sangria, this.alturaItems);
            }

            if (y.prueba == "DUPLICADOS") {
              this.alturaItems = 170;
              this.sangria = 140;
              if (y.prueba != null)
                this.doc.text(y.prueba.toString(), this.sangria, this.alturaItems);
              this.sangria = 172;
              if (y.resultados != null)
                this.doc.text(y.resultados.toString(), this.sangria, this.alturaItems);
              this.doc.rect(171, 167, 8, 4);
              this.sangria = 176;
              if (y.unidades != null)
                this.doc.text(y.unidades.toString(), this.sangria, this.alturaItems);
            }

            if (y.prueba == "GOTA CITOPLASMICA") {
              this.alturaItems = 175;
              this.sangria = 140;
              if (y.prueba != null)
                this.doc.text(y.prueba.toString(), this.sangria, this.alturaItems);
              this.sangria = 172;
              if (y.resultados != null)
                this.doc.text(y.resultados.toString(), this.sangria, this.alturaItems);
              this.doc.rect(171, 172, 8, 4);
              this.sangria = 176;
              if (y.unidades != null)
                this.doc.text(y.unidades.toString(), this.sangria, this.alturaItems);
            }

            if (y.prueba == "P. Hinchamiento Hiposmótica") {
              this.alturaItems = 195;
              this.sangria = 40;
              if (y.prueba != null)
                this.doc.text(y.prueba.toString(), this.sangria, this.alturaItems);
              this.sangria = 79;
              if (y.resultados != null)
                this.doc.text(y.resultados.toString(), this.sangria, this.alturaItems);
              this.doc.rect(78, 192, 9, 4);
              this.sangria = 84;
              if (y.unidades != null)
                this.doc.text(y.unidades.toString(), this.sangria, this.alturaItems);
              this.sangria = 124;
              if (y.referencia != null)
                this.doc.text(y.referencia.toString(), this.sangria, this.alturaItems);
            }

            if (y.prueba == "Concentración Espermatica Total") {
              this.alturaItems = 200;
              this.sangria = 35;
              if (y.prueba != null)
                this.doc.text(y.prueba.toString(), this.sangria, this.alturaItems);
              this.sangria = 79;
              if (y.resultados != null)
                this.doc.text(y.resultados.toString(), this.sangria, this.alturaItems);
              this.doc.rect(78, 197, 9, 4);
              this.sangria = 88;
              if (y.unidades != null)
                this.doc.text(y.unidades.toString(), this.sangria, this.alturaItems);
              this.sangria = 124;
              if (y.referencia != null)
                this.doc.text(y.referencia.toString(), this.sangria, this.alturaItems);
            }
          });
        });
        if (product.comentario != "") {
          this.alturaItems = this.alturaItems + 5;
          this.doc.text(20, this.alturaItems, "Observaciones: ");

          let numberBreaks = product.comentario.match(/\n/g) || [];
          let split = product.comentario.split("\n");

          /*
                    split.forEach(s => {
                      if (s.length > 120) {
                        comentarioFinal = s.substring(0, 120);
                        comentarioFinal =
                          comentarioFinal + "\n" + s.substring(120, s.length);
                      } else {
                        comentarioFinal = comentarioFinal + "\n" + s;
                      }
                    });
                    this.doc.text(comentarioFinal, 40, this.alturaItems);
          
                    this.alturaItems = this.alturaItems + 3 * (numberBreaks.length + 2);
                    */
          let comentarioFinal: string = "";
          /*
                    split.forEach(s => {
                      if (s.length > 100) {
                        comentarioFinal = s.substring(0, 120);
                        comentarioFinal =
                          comentarioFinal + "\n" + s.substring(120, s.length);
                      } else {
                        comentarioFinal = comentarioFinal + "\n" + s;
                      }
                    });
          */

          comentarioFinal = product.comentario;
          let comentarioFinal2 = this.doc.splitTextToSize(comentarioFinal, 150);
          this.doc.text(comentarioFinal2, 40, this.alturaItems);

          console.log(comentarioFinal);

          //this.doc.text(product.comentario.toString(), 40, this.alturaItems);
          //this.doc.text(comentarioFinal, 40, this.alturaItems);

          //this.alturaItems = this.alturaItems + 3 * (numberBreaks.length + 2);
          this.alturaItems = this.alturaItems + 3 * comentarioFinal2.length;
        } else {
          this.alturaItems = this.alturaItems + 4;
        }
        this.doc.line(5, this.alturaItems, 205, this.alturaItems);
        this.doc.rect(15, 156, 170, 22);
      } else {
        /**
         * Cambio para Espermatobioscopía
         * 02-03-2020
         * FIN
         */
        product.json.forEach(x => {
          this.doc.setFontSize(8);
          this.doc.setFontType("bold");
          this.alturaItems = this.alturaItems + 5;
          this.sangria = 80;
          this.doc.text(x.subtitulo.toString(), this.sangria, this.alturaItems);

          this.alturaItems = this.alturaItems + 5;
          this.doc.text(10, this.alturaItems, "Prueba");
          this.doc.text(85, this.alturaItems, "Resultados");
          this.doc.text(105, this.alturaItems, "Unidades");
          this.doc.text(125, this.alturaItems, "Referencia");
          this.doc.text(155, this.alturaItems, "Comentarios");
          this.doc.setFontType("normal");
          this.doc.setFontSize(8);

          this.doc.line(10, this.alturaItems + 1, 205, this.alturaItems + 1);
          this.alturaItems = this.alturaItems + 1;

          x.items.forEach(y => {
            if (this.alturaItems >= 240) {
              this.doc.addPage();
              if (membrete != null) {
                this.cabecera();
              }
              this.alturaItems = 40;
            }
            this.alturaItems = this.alturaItems + 5;
            if (y.prueba != null) {
              this.sangria = 10;
              this.doc.text(
                y.prueba.toString(),
                this.sangria,
                this.alturaItems
              );
            }

            if (y.resultados != null) {
              this.sangria = 85;
              this.doc.text(
                y.resultados.toString(),
                this.sangria,
                this.alturaItems
              );
            }
            if (y.unidades != null) {
              this.sangria = 105;
              this.doc.text(
                y.unidades.toString(),
                this.sangria,
                this.alturaItems
              );
            }

            if (y.referencia != null) {
              this.sangria = 125;
              this.doc.text(
                y.referencia.toString(),
                this.sangria,
                this.alturaItems
              );
            }

            if (y.comentario != null) {
              this.sangria = 155;
              this.doc.text(
                y.comentario.toString(),
                this.sangria,
                this.alturaItems
              );
            }
          });
        });

        /**
         * Cambio para los comentarios
         * 26-02-2020
         * INICIO
         */
        if (product.comentario != "") {
          this.alturaItems = this.alturaItems + 5;
          this.doc.text(20, this.alturaItems, "Observaciones: ");

          //let numberBreaks = product.comentario.match(/\n/g) || [];
          //let split = product.comentario.split("\n");
          let comentarioFinal: string = "";
          /*
                    split.forEach(s => {
                      if (s.length > 100) {
                        comentarioFinal = s.substring(0, 120);
                        comentarioFinal =
                          comentarioFinal + "\n" + s.substring(120, s.length);
                      } else {
                        comentarioFinal = comentarioFinal + "\n" + s;
                      }
                    });
          */

          comentarioFinal = product.comentario;
          let comentarioFinal2 = this.doc.splitTextToSize(comentarioFinal, 150);
          this.doc.text(comentarioFinal2, 40, this.alturaItems);

          console.log(comentarioFinal);

          //this.doc.text(product.comentario.toString(), 40, this.alturaItems);
          //this.doc.text(comentarioFinal, 40, this.alturaItems);

          //this.alturaItems = this.alturaItems + 3 * (numberBreaks.length + 2);
          this.alturaItems = this.alturaItems + 3 * comentarioFinal2.length;

        } else {
          this.alturaItems = this.alturaItems + 4;
        }
        /**
         * Cambio para los comentarios
         * 26-02-2020
         * FIN
         */
        this.doc.line(5, this.alturaItems, 205, this.alturaItems);
      }
    }
    let nombre: string;
    nombre = this.paciente + ".pdf";

    this.doc.setProperties({
      title: this.paciente + ".pdf"
    }); 

    var data = new Blob([this.doc.output()], {
      type: 'application/pdf'
    });

    console.log('se genero el pdf');
    
    var formData = new FormData();
    formData.append('pdf', data, nombre);
    // this.http.post(ApiUrl + prefix + '/pacientes/' + idp + '/analisis/', analisis,
    // {
    //   headers: {
    //     'Authorization': 'Bearer ' + jwt,
    //     'time-zone': timeZone
    //   }
    // })
    this.http.put('https://989ff4d2f353.ngrok.io/noltik_api/v1/lab/pacientes/11/enviar/', formData,
      {
        observe: 'response',
        headers: {
          'Authorization': 'Bearer ' + this.jwt
        }
      })
      .subscribe((response) => {
        if (response.status === 200) {
          alert('se envio el pdf al paciente');
        }
        else {
          console.log('error');
        }
      });
    // var request = new XMLHttpRequest();
    // request.open("POST","http://7559f35c52e1.ngrok.io");
    // request.send(formData);

    //this.doc.output("dataurlnewwindow");
  }

}



    






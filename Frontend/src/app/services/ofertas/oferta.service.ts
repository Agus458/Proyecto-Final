import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SocialAuthService } from 'angularx-social-login';
import { proyectConfig } from 'proyectConfig';
import { Oferta } from 'src/app/models/oferta.model';
import { Pagination } from 'src/app/models/pagination.mode';
import { Postulante } from 'src/app/models/postulante.model';

@Injectable({
  providedIn: 'root'
})
export class OfertaService {

  private url: string = proyectConfig.backEndURL + "/api/ofertas";

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }

  getOfertas(skip?: number, take?: number, filters?: any) {
    const params: any = {
      skip: skip ?? 0,
      take: take ?? 9
    }

    Object.assign(params, filters);

    return this.http.get<Pagination<Oferta>>(this.url, {
      params
    });
  }

  postulado(oferta: number) {
    return this.http.get<{ postulado: boolean }>(this.url + "/postulado/" + oferta)
  }

  getOfertasEmpresaActual(skip?: number, take?: number) {
    return this.http.get<Pagination<Oferta>>(this.url + "/empresa", {
      params: {
        skip: skip ?? 0,
        take: take ?? 9
      }
    });
  }

  getAll(skip?: number, take?: number) {
    return this.http.get<Pagination<Oferta>>(this.url + "/all", {
      params: {
        skip: skip ?? 0,
        take: take ?? 9
      }
    });
  }

  getOfertasPostulante(skip?: number, take?: number) {
    return this.http.get<Pagination<Oferta>>(this.url + "/postulante", {
      params: {
        skip: skip ?? 0,
        take: take ?? 10
      }
    });
  }

  getOferta(id: number) {
    return this.http.get<Oferta>(this.url + "/" + id);
  }

  getPostulantesOferta(id: number, skip?: number, take?: number, filters?: any) {
    const params: any = {
      skip: skip ?? 0,
      take: take ?? 9
    }

    Object.assign(params, filters);
    if (params?.edad) {
      params.edadmin = params.edad.edadmin;
      params.edadmax = params.edad.edadmax;
      params.edad = undefined;
    }

    return this.http.get<Pagination<Postulante>>(this.url + "/postulantes/" + id, {
      params
    });
  }

  inscribirse(id: number) {
    return this.http.post(this.url + "/inscribirse/" + id, {});
  }

  postOferta(oferta: Oferta) {
    return this.http.post<Oferta>(this.url, oferta);
  }

  putOferta(id: number, oferta: Oferta) {
    return this.http.put(this.url + `/${id}`, oferta);
  }

  delete(id: number) {
    return this.http.delete(this.url + `/${id}`);
  }

  finish(id: number) {
    return this.http.post(this.url + `/finish/${id}`, {});
  }
}

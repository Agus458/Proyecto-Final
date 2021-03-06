import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { proyectConfig } from 'proyectConfig';
import { Observable } from 'rxjs';
import { Pagination } from 'src/app/models/pagination.mode';
import { Postulante } from 'src/app/models/postulante.model';

@Injectable({
  providedIn: 'root'
})
export class PostulantesService {

  private url: string = proyectConfig.backEndURL + "/api/postulantes";
  private postulanteActual!: Observable<Postulante>;

  constructor(
    private http: HttpClient
  ) { }

  getPerfil(): void {
    this.postulanteActual = this.http.get<Postulante>(this.url + "/perfil");
  }

  getPerfilById(id: number): void {
    this.postulanteActual = this.http.get<Postulante>(this.url + "/perfil/" + id);
  }

  getPerfilActual(): Observable<Postulante> {
    return this.postulanteActual;
  }

  validarPerfil() {
    return this.http.get(this.url + "/validarPerfil");
  }

  deshabilitar() {
    return this.http.post(this.url + "/deshabilitar", {});
  }

  getPostulantesPublicos(skip?: number, take?: number, filters?: any) {
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

    return this.http.get<Pagination<Postulante>>(this.url, {
      params
    });
  }
  
  async getArchivo(url: string) {
    let archivo;

    try {
      const response = await this.http.get(url, {
        observe: 'response', responseType: 'blob'
      }).toPromise();

      archivo = URL.createObjectURL(response.body);
    } catch (error) {
      console.log(error);
    }

    return archivo;
  }

  async generarPdf(id: number) {
    let archivo;

    try {
      const response = await this.http.get(this.url + "/generatePDF/" + id, {
        observe: 'response', responseType: 'blob'
      }).toPromise();

      archivo = URL.createObjectURL(response.body);
    } catch (error) {
      console.log(error);
    }

    return archivo;
  }

  putImagen(formData: FormData) {
    return this.http.put(this.url + "/perfil/imagen", formData);
  }

  putCV(formData: FormData) {
    return this.http.put(this.url + "/perfil/cv", formData);
  }

  putPerfil(data: Postulante) {
    return this.http.put(this.url + "/perfil", data);
  }

  deleteCapacitacion(id: number) {
    return this.http.delete(this.url + "/perfil/capacitacion/" + id);
  }

  deleteConocimientoInformatico(id: number) {
    return this.http.delete(this.url + "/perfil/conocimientoInformatico/" + id);
  }

  deleteExperienciaLaboral(id: number) {
    return this.http.delete(this.url + "/perfil/experienciaLaboral/" + id);
  }

  deleteIdioma(id: number) {
    return this.http.delete(this.url + "/perfil/idioma/" + id);
  }

  deletePermiso(id: number) {
    return this.http.delete(this.url + "/perfil/permiso/" + id);
  }

  deletePreferenciaLaboral(id: number) {
    return this.http.delete(this.url + "/perfil/preferenciaLaboral/" + id);
  }

}
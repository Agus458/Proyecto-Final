import { Capacitacion } from "./capacitacion.model";
import { ConocimientoInformatico } from "./conocimientoInformatico.model";
import { Domicilio } from "./domicilio.model";
import { ExperienciaLaboral } from "./experienciaLaboral.model";
import { Idioma } from "./idioma.model";
import { Permiso } from "./permiso.model";
import { PreferenciaLaboral } from "./preferenciaLaboral.model";
import { Usuario } from "./usuario.model";

export interface Postulante extends Usuario {

    id?: number;
    
    primerNombre?: string;

    segundoNombre?: string;

    primerApellido?: string;

    segundoApellido?: string;

    imagen?: string;

    cv?: string;

    domicilio?: Domicilio;

    tipoDocumento?: string;

    documento?: string;

    sexo?: string;

    fechaNacimiento?: Date;

    primerTelefono?: string;

    segundoTelefono?: string;

    nivelEducativo?: any;

    estadoNivelEducativo?: any;

    orientacion?: string;

    recivirEmails?: boolean;

    perfilPublico?: boolean;

    jornadaIndiferente?: boolean;

    jornadaCompleta?: boolean;

    jornadaManiana?: boolean;

    jornadaTarde?: boolean;

    jornadaNoche?: boolean;

    capacitaciones?: Capacitacion[];

    conocimientosInformaticos?: ConocimientoInformatico[];

    idiomas?: Idioma[];

    experienciasLaborales?: ExperienciaLaboral[];

    preferenciasLaborales?: PreferenciaLaboral[];

    permisos?: Permiso[];

}
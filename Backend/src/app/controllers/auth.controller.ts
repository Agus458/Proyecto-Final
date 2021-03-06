import { Request, Response } from "express";
import validator from "validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { AppError } from "../../config/error/appError";
import { encryptPassword, verifyPassword } from "../libraries/encryptation.library";

import * as postulantesService from "../services/postulantes.service";
import * as usuariosService from "../services/usuarios.service";
import * as empresasService from "../services/empresas.service";
import * as localidadesService from "../services/localidades.service";
import * as appSociosService from "../services/appSocios.service";
import * as restablecerContraseniaService from "../services/restablecerContrasenia.service";
import * as solicitudesEmpresaService from "../services/solicitudesEmpresa.service";
import { createToken, verifyToken } from "../libraries/tokens.library";
import { EstadoUsuario } from "../models/enums";
import { resetTemplate, sendEmail, solicitudTemplate } from "../libraries/email.library";
import { verifyFacebookIdToken, verifyGoogleIdToken } from "../libraries/google.library";
import { Empresa } from "../models/empresa.model";
import moment from "moment";
import { request } from "http";
import { validarEmpresa } from "../libraries/validation.library";

/* ---------------------------------------< AUTH CONTROLLER >--------------------------------------- */

export const registrarse = async (request: Request, response: Response): Promise<Response> => {
    if (typeof request.body.email != "string") throw AppError.badRequestError("No se ingreso el email");
    if (typeof request.body.contrasenia != "string") throw AppError.badRequestError("No se ingreso la contraseña");
    if (!validator.isEmail(request.body.email)) throw AppError.badRequestError("El email ingresado no es valido");

    if (await usuariosService.getByEmail(request.body.email)) throw AppError.badRequestError("Ya existe un usuario con el email ingresado");

    request.body.contrasenia = await encryptPassword(request.body.contrasenia);
    request.body.estado = EstadoUsuario.ACTIVO;

    const result = await postulantesService.post(request.body);

    const { token, exp } = createToken(result.email);

    return response.status(201).json({ usuario: { email: result.email, tipo: result.constructor.name }, token, exp });
}

export const iniciarSesion = async (request: Request, response: Response): Promise<Response> => {
    if (typeof request.body.email != "string") throw AppError.badRequestError("No se ingreso el email");
    if (typeof request.body.contrasenia != "string") throw AppError.badRequestError("No se ingreso la contraseña");

    const usuario = await usuariosService.getByEmailContrasenia(request.body.email, request.body.contrasenia);

    if (!usuario) throw AppError.badRequestError("Credenciales Invalidas");

    if (usuario.estado != EstadoUsuario.ACTIVO) throw AppError.badRequestError("El usuario no se encuentra activo");

    if (usuario.constructor.name == "Empresa") {
        const empresa: Empresa = usuario as Empresa;
        if (moment().isAfter(moment(empresa.vencimiento))) {
            empresa.estado = EstadoUsuario.INACTIVO;
            await usuariosService.actualizar(empresa);
            throw AppError.badRequestError("La fecha de utlizacion ya expiro");
        }
    }

    const { token, exp } = createToken(usuario.email);

    return response.status(200).json({ usuario: { email: usuario.email, tipo: usuario.constructor.name }, token, exp });
}

export const solicitarEmpresa = async (request: Request, response: Response): Promise<Response> => {
    if (typeof request.body.rut != "string" || !validator.isInt(request.body.rut) || !validator.isLength(request.body.rut, {
        max: 12
    })) throw AppError.badRequestError("No se ingreso el rut de la empresa");
    if (typeof request.body.contrasenia != "string") throw AppError.badRequestError("No se ingreso la contrasenia de la empresa");

    const pass = request.body.contrasenia;

    let empresa = await empresasService.getByRut(request.body.rut);

    if (!empresa) {
        request.body.contrasenia = await encryptPassword(request.body.contrasenia);
        request.body.estado = EstadoUsuario.PENDIENTE;

        const empresaAppSocios = await appSociosService.getEmpresa(request.body.rut);

        if (empresaAppSocios) {
            const localidadAppSocios = await appSociosService.getLocalidad(empresaAppSocios.localidadId);
            if (localidadAppSocios) {
                const localidad = await localidadesService.getByNombre(localidadAppSocios.name);
                request.body.localidad = localidad;
            }

            request.body.razonSocial = empresaAppSocios.razon_social;
            request.body.socia = empresaAppSocios.activa;
            request.body.telefono = empresaAppSocios.telefono;
            request.body.nombreFantasia = empresaAppSocios.nombre_fantasia;
        }

        empresa = await empresasService.post(request.body);
    }

    if (!await verifyPassword(pass, empresa.contrasenia)) throw AppError.badRequestError("Contraseña Invalida");

    if (moment().isBefore(moment(empresa.vencimiento)) && empresa.estado == EstadoUsuario.ACTIVO) throw AppError.badRequestError("Empresa Activa");

    empresa.estado = EstadoUsuario.PENDIENTE;
    await usuariosService.actualizar(empresa);

    const token = jwt.sign({ rut: empresa.rut }, process.env.SECRET + empresa.contrasenia as string);

    await solicitudesEmpresaService.post(token, empresa.rut.toString());

    empresa.contrasenia = "";

    return response.json({ token, empresa });
}

export const confirmarSolicitud = async (request: Request, response: Response): Promise<Response> => {
    const token = request.body.token;
    if (typeof token != "string") throw AppError.badRequestError("No se ingreso el token");
    if (typeof request.body.contrasenia != "string") throw AppError.badRequestError("No se ingreso la contraseña");

    const rest = await solicitudesEmpresaService.getByToken(token);
    if (!rest) throw AppError.badRequestError("Token invalido");

    const empresa = await empresasService.getByRut(rest.rut);
    if (!empresa) throw AppError.badRequestError("No existe la empresa");

    if (!empresa.email || empresa.email != request.body.email) {
        if (typeof request.body.email != "string") throw AppError.badRequestError("No se ingreso el email");
        if (!validator.isEmail(request.body.email)) throw AppError.badRequestError("El email ingresado no es valido");

        if (await usuariosService.getByEmail(request.body.email)) throw AppError.badRequestError("Ya existe un usuario con el email ingresado");
    }

    if (!await verifyPassword(request.body.contrasenia, empresa.contrasenia)) throw AppError.badRequestError("Contraseña Invalida");

    const data = verifyToken(token, process.env.SECRET + empresa.contrasenia as string);
    if (!data) throw AppError.badRequestError("Token ya utilizado o invalido");

    await validarEmpresa(request.body);

    empresa.email = request.body.email;
    empresa.nombreFantasia = request.body.nombreFantasia;
    empresa.localidad = request.body.localidad;
    empresa.razonSocial = request.body.razonSocial;
    empresa.telefono = request.body.telefono;
    empresa.visibilidad = request.body.visibilidad;
    empresa.contrasenia = await encryptPassword(request.body.contrasenia);
    empresa.socia = false;

    await usuariosService.actualizar(empresa);

    if (process.env.ADMINMAIL) {
        sendEmail(process.env.ADMINMAIL, "Solicitud de Empresa", solicitudTemplate(empresa));
    }

    return response.status(200).json();
}

export const restablecerContrasenia = async (request: Request, response: Response): Promise<Response> => {
    if (typeof request.body.email != "string") throw AppError.badRequestError("Email invalido o no ingresado");

    const usuario = await usuariosService.getContraseniaByEmail(request.body.email);
    if (!usuario) throw AppError.badRequestError("No existe un usuario con el email ingresado");

    const token = jwt.sign({ email: usuario.email }, process.env.SECRET + usuario.contrasenia as string, { expiresIn: "15m" });

    await restablecerContraseniaService.post(token, usuario.email);

    sendEmail(usuario.email, "Restablecer Contrasenia", resetTemplate(token));

    return response.status(204).json();
}

export const cambiarContrasenia = async (request: Request, response: Response): Promise<Response> => {
    const token = request.body.token;
    if (typeof token != "string") throw AppError.badRequestError("No se ingreso el token");
    if (typeof request.body.contrasenia != "string") throw AppError.badRequestError("No se ingreso la nueva contraseña");

    const rest = await restablecerContraseniaService.getByToken(token);
    if (!rest) throw AppError.badRequestError("Token invalido");

    const usuario = await usuariosService.getContraseniaByEmail(rest.email);
    if (!usuario) throw AppError.badRequestError("No existe el usuario");

    const email = verifyToken(token, process.env.SECRET + usuario.contrasenia as string);

    if (!email) throw AppError.badRequestError("Token ya utilizado o invalido");

    usuario.contrasenia = await encryptPassword(request.body.contrasenia);

    usuariosService.actualizar(usuario);

    return response.status(200).json();
}

export const iniciarSocial = async (request: Request, response: Response): Promise<Response> => {
    if (!request.body.user) throw AppError.badRequestError("No se ingreso el usuario");
    if (!request.body.user.email) throw AppError.badRequestError("No se ingreso el email del usuario");

    if (request.body.user.provider == "GOOGLE") {
        if (! await verifyGoogleIdToken(request.body.user.idToken)) throw AppError.badRequestError("Token de sesion invalido");
    } else if (request.body.user.provider == "FACEBOOK") {
        if (! await verifyFacebookIdToken(request.body.user.idToken)) throw AppError.badRequestError("Token de sesion invalido");
    } else {
        throw AppError.badRequestError("Proveedor Invalido");
    }

    let usuario = await usuariosService.getByEmail(request.body.user.email);
    if (!usuario) {
        request.body.estado = EstadoUsuario.ACTIVO;

        usuario = await postulantesService.post({
            email: request.body.user.email,
            contrasenia: await encryptPassword(crypto.randomBytes(20).toString('hex')),
            estado: EstadoUsuario.ACTIVO
        });
    } else {
        if (usuario.estado != EstadoUsuario.ACTIVO) throw AppError.badRequestError("El usuario no se encuentra activo");
    }

    const { token, exp } = createToken(usuario.email);

    return response.status(200).json({ usuario: { email: usuario.email, tipo: usuario.constructor.name }, token, exp });
}
import { Request, Response } from "express";
import validator from "validator";

import { AppError } from "../../config/error/appError";
import * as paisesService from "../services/paises.service";

/* ---------------------------------------< PAISES CONTROLLER >--------------------------------------- */

export const getPaises = async (request: Request, response: Response): Promise<Response> => {
    const paises = await paisesService.get();

    return response.status(200).json(paises);
}

export const getPaisById = async (request: Request, response: Response): Promise<Response> => {
    if (!request.params.id) throw AppError.badRequestError("No se ingreso el id del pais");
    if (typeof request.params.id != "number") throw AppError.badRequestError("Id de pais invalido");

    const pais = await paisesService.getById(request.params.id);

    if (!pais) throw AppError.badRequestError("No existe ningun pais con el id ingresado");

    return response.status(200).json(pais);
}

export const postPais = async (request: Request, response: Response): Promise<Response> => {
    await paisesService.post(request.body);

    return response.status(201).json();
}

export const putPais = async (request: Request, response: Response): Promise<Response> => {
    if (!request.params.id) throw AppError.badRequestError("No se ingreso el id del pais");
    if (typeof request.params.id != "number") throw AppError.badRequestError("Id de pais invalido");

    if (! await paisesService.getById(request.params.id)) throw AppError.badRequestError("No existe ningun pais con el id ingresado");

    await paisesService.put(request.params.id, request.body);

    return response.status(200).json();
}
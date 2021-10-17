import { json } from "stream/consumers";
import { DeepPartial,getRepository } from "typeorm";
import { Offerta} from "../models/offerta.model";
import { Request, Response } from "express";

export const get = async (): Promise<Offerta[]> => {
    return await getRepository(Offerta).find();
};

export const getById = async (id: number): Promise<Offerta | undefined> => {
    return await getRepository(Offerta).findOne(id);
};
/*
export const getByNombreEmpresa = async (nombreEmpresa: string): Promise<Offerta | undefined>=>{
    return await getRepository(Offerta).findOne({
        where:{ nombreEmpresa}
    });
};
*/
/*
export const getByRut = async (Rut: string): Promise<Offerta | undefined>=>{
    return await getRepository(Offerta).findOne({
        where:{ Rut}
    });
};
*/
export const post = async(data: DeepPartial<Offerta>): Promise<Offerta>=>{
    const nuevaOfferta = getRepository(Offerta).create(data);
    return await getRepository(Offerta).save(nuevaOfferta);
}

export const put = async (id: number, data:DeepPartial<Offerta>): Promise<void> =>{
    data.id = id;
    await getRepository(Offerta).save(data);
};
/*
export const guardarPostulante= async(request:Request,response:Response):Promise<Response> =>{

     
   // if(!request.body) throw AppError.badRequestError("No se ingreso el id de la offerta");

   return response.status(201).json();
}
*/
/*
export const Suscribirse = async(id:number,Suscripcion:boolean,data:DeepPartial<Offerta>): Promise<Offerta>=>{
    data.id=id;
    
}
*/



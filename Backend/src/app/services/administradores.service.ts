import { DeepPartial, getRepository } from "typeorm";
import { verifyPassword } from "../libraries/encryptation.library";
import { Administrador } from "../models/administrador.model";

/* ---------------------------------------< ADMINISTRADORES SERVICE >--------------------------------------- */

// Retorna todos los Administradores almacenados en el sistema.
export const get = async (): Promise<Administrador[]> => {
    return await getRepository(Administrador).find();
};

// Retorna el Administrador almacenado en el sistema cuyo id sea el ingresado.
export const getById = async (id: number): Promise<Administrador | undefined> => {
    return await getRepository(Administrador).findOne(id);
};

// Retorna el Administrador almacenado en el sistema cuyo email sea el ingresado.
export const getByEmail = async (email: string): Promise<Administrador | undefined> => {
    return await getRepository(Administrador).findOne({
        where: { email }
    });
};

export const getContraseniaByEmail = async (email: string): Promise<Administrador | undefined> => {
    return await getRepository(Administrador).findOne({
        select: ["id", "email", "contrasenia"],
        where: { email }
    });
};

// Retorna el administrador almacenado en el sistema cuyo email y contrasenia sea el ingresado.
export const getByEmailContrasenia = async (email: string, contrasenia: string): Promise<Administrador | undefined> => {
    const usuario = await getRepository(Administrador).findOne({
        select: ["id", "email", "contrasenia", "estado"],
        where: { email }
    });

    if (usuario && await verifyPassword(contrasenia, usuario.contrasenia)) return usuario;

    return undefined;
};

// Almacena en el sistema un nuevo Administrador.
export const post = async (data: DeepPartial<Administrador>): Promise<Administrador> => {
    const nuevoAdministrador = getRepository(Administrador).create(data);

    return await getRepository(Administrador).save(nuevoAdministrador);
};

// Actualiza un Administrador almacenado en el sistema.
export const put = async (id: number, data: DeepPartial<Administrador>): Promise<void> => {
    data.id = id;
    await getRepository(Administrador).save(data);
};
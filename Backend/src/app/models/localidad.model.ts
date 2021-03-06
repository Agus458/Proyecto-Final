import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Departamento } from "./departamento.model";
import { Domicilio } from "./domicilio.model";

@Entity("localidades")
export class Localidad extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @ManyToOne(() => Departamento, departamento => departamento.localidades)
    departamento: Departamento;

    @OneToMany(() => Domicilio, domicilio => domicilio.localidad)
    domicilios: Domicilio[];

}
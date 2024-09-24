import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class PersonalInfo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    address: string

    @Column()
    fuga:number
}
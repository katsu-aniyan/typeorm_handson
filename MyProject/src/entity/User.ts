import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { PersonalInfo } from "./PersionalInfo"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    age: number

    @OneToOne(() => PersonalInfo, { cascade: true })
    @JoinColumn()
    personalInfo: PersonalInfo

}

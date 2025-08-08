import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { Rating } from "./rating.model";

export type UserRole = "ADMIN" | "USER" | "STORE_OWNER";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 60 })
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ length: 400, nullable: true })
    address?: string;

    @Column()
    password!: string; // hashed

    @Column({ type: "enum", enum: ["ADMIN", "USER", "STORE_OWNER"], default: "USER" })
    role!: UserRole;

    @OneToMany(() => Rating, rating => rating.user)
    ratings!: Rating[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

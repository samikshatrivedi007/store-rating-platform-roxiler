import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { User } from "./user.model";
import { Store } from "./store.model";

@Entity()
export class Rating {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int" })
    value!: number; // 1 to 5

    @ManyToOne(() => User, user => user.ratings, { onDelete: "CASCADE" })
    user!: User;

    @ManyToOne(() => Store, store => store.ratings, { onDelete: "CASCADE" })
    store!: Store;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

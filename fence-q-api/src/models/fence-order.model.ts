import { FenceBlueprint } from './fence-blueprint.model';
import { Fence } from './fence.model';
import { Customer } from './customer.model';
import { FenceOrderInterface, FenceOrderStatus } from './../types/fence-order';
import { Model } from "./model";
import {Entity, Column, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, OneToOne} from 'typeorm';
import { ApiUser } from './user.model';

@Entity()
export class FenceOrder extends Model implements FenceOrderInterface {
    @ManyToOne(type => ApiUser)
    @JoinColumn()
    user: ApiUser;

    @OneToOne(type => Customer, { nullable: true, cascade: true })
    @JoinColumn()
    customer: Customer;

    @ManyToOne(type => Fence)
    @JoinColumn()
    fence: Fence;

    @CreateDateColumn({
		default: () => "NOW()",
		type: "timestamp"
	})
    created: Date;

    @UpdateDateColumn({
		default: () => "NOW()",
		type: "timestamp"
	})
    updated: Date;

    @Column()
    quantity: number;

    @Column({
        nullable: true
    })
    message?: string;

    @Column({
        type: 'enum',
        enum: FenceOrderStatus,
        default: FenceOrderStatus.NONE
    })
    status?: FenceOrderStatus;

    @OneToMany(
        type => FenceBlueprint,
        (blueprint: FenceBlueprint) => blueprint.fenceOrder,
        { cascade: true }
    )
    @JoinColumn()
    fenceBlueprints: FenceBlueprint[];
}

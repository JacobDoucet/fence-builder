import { FenceOrder } from './fence-order.model';
import { FenceMeasurement } from './fence-measurement.model';
import { Model } from './model';
import { FenceBlueprintInterface } from '../types/fence-blueprint';
import { Column, OneToMany, ManyToOne, JoinColumn, Entity } from 'typeorm';

@Entity()
export class FenceBlueprint extends Model implements FenceBlueprintInterface {
    @Column()
    name: string;

    @OneToMany(
        type => FenceMeasurement,
        measurement => measurement.fenceBlueprint,
        { eager: true, cascade: true }
    )
    @JoinColumn()
    fenceMeasurements: FenceMeasurement[];
    
    @ManyToOne(type => FenceOrder, (order: FenceOrder) => order.fenceBlueprints)
    @JoinColumn()
    fenceOrder: FenceOrder;
}

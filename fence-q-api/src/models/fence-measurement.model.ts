import { FenceMeasurementInterface } from '../types/fence-measurement';
import { Model } from './model';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FenceBlueprint } from './fence-blueprint.model';

@Entity()
export class FenceMeasurement extends Model implements FenceMeasurementInterface {

    @Column({ type: 'float8' })
    start_x: number;
    
    @Column({ type: 'float8' })
    start_y: number;

    @Column({ type: 'float8' })
    end_x: number;

    @Column({ type: 'float8' })
    end_y: number;
    
    @ManyToOne(type => FenceBlueprint, blueprint => blueprint.fenceMeasurements)
    @JoinColumn()
    fenceBlueprint: FenceBlueprint;
}

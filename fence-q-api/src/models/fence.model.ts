import { Model } from './model';
import { Entity, Column } from 'typeorm';
import { FenceInterface } from '../types/fence';

@Entity()
export class Fence extends Model implements FenceInterface {
    @Column()
    name: string;

    @Column()
    price: number;

    @Column()
    image_url: string;

    @Column({ nullable: true })
    description?: string;
}

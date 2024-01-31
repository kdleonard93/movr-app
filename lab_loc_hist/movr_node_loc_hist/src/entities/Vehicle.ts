import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { LocationHistory } from "./LocationHistory";

@Entity("vehicles")
export class Vehicle {

    @PrimaryColumn("uuid")
    id: string;

    @Column()
    battery: number;

    @Column()
    in_use: boolean;

    @Column()
    vehicle_type: string;

    // Lab TODO: Add a property containing a
    // list of location history entries 
}
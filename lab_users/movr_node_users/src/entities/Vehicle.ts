import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { LocationHistory } from "./LocationHistory";
import { Ride } from "./Ride";

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

    @OneToMany(type => LocationHistory, LocationHistory => LocationHistory.vehicle) 
    locationHistory: LocationHistory[];  

    @OneToMany(type => Ride, Ride => Ride.vehicle) 
    rideList: Ride[];    
}
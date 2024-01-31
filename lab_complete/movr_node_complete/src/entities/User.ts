import {Entity, PrimaryColumn, Column, OneToMany} from "typeorm";
import { Ride } from "./Ride";

@Entity("users")
export class User {

    @PrimaryColumn()
    email: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column("string", { array: true })
    phone_numbers: string[];
    
    @OneToMany(type => Ride, Ride => Ride.user) 
    rideList: Ride[];   
}

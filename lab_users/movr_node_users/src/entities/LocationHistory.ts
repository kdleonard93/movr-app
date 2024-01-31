import {Entity, PrimaryColumn, Column, AfterLoad, ManyToOne, JoinColumn } from "typeorm";
import * as moment from "moment"
import { Vehicle } from "./Vehicle";

@Entity("location_history")
export class LocationHistory {

    @PrimaryColumn("uuid")
    id: string;

    @ManyToOne(() => Vehicle, Vehicle => Vehicle.locationHistory)
    @JoinColumn({ name: "vehicle_id" })
    vehicle: Vehicle;

    @Column({ type:"timestamp" })
    ts: string;

    @Column({ type: 'decimal', precision: 5, scale: 1})
    longitude: number;

    @Column({ type: 'decimal', precision: 5, scale: 1})
    latitude: number;

    @AfterLoad()
    formatTime(){
        const pattern = 'YYYY-MM-DD HH:mm:ss'
        this.ts = moment(this.ts).format(pattern)
    }
}
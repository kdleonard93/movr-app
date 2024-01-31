import { getManager, FindOneOptions } from "typeorm";
import { Request, Response } from "express";
import { Vehicle } from "../entities/Vehicle";
import { LocationHistory } from "../entities/LocationHistory";
import { v4 as uuidv4 } from "uuid";
import { Calculations } from "../utils/calculations";
import * as moment from "moment";

class VehicleController {


    /**
     * Gets a list of all vehicles (limited by passed value).
     *
     * @param maxVehicles              the maximum number of vehicle rows to return
     * @return                         a json array containing the vehicle details and it's latest location history
     * @throws                         if you pass 0 or a negative value for the maximum rows to return
     */   
    static all = async(req: Request, res: Response) => {
        const max = req.query.max_vehicles|| 20 ;

        const entityManager = getManager();
        try{
            const query = `SELECT vehicles.id, vehicles.in_use,
                            vehicles.battery, vehicles.vehicle_type,
                            longitude AS last_longitude, latitude AS last_latitude,
                            ts AS timestamp
                    FROM (SELECT * FROM vehicles AS v LIMIT ${max}) AS vehicles
                INNER JOIN location_history
                        ON vehicles.id = location_history.vehicle_id
                INNER JOIN (  SELECT vehicle_id, max(ts) AS max_ts
                                FROM location_history 
                            GROUP BY vehicle_id) AS grouped_location_history
                        ON grouped_location_history.max_ts = location_history.ts
                    WHERE location_history.vehicle_id = vehicles.id;`

            const vehicles = await entityManager.query(query)

            res.status(200).json(vehicles);

        } catch (err) {
                console.error('Error performing transaction:\n', err);
                return res.status(500).json({message:"No vehicles found"});
                
        }
     
    }
    /**
     * Adds a vehicle.
     *
     * @param body                      JSON of vehicle details
     * @return                          the generated uuid (key) of the added vehicle
     */

    public static add = async(req: Request, res: Response) => {
        const battery = req.body.battery;
        const latitude = req.body.latitude;
        const longitude = req.body.longitude;
        const vehicle_type = req.body.vehicle_type;
       
        try {
            const entityManager = getManager();
            const newVehicle = entityManager.create(Vehicle,{
                id: uuidv4(), 
                battery:battery, 
                in_use:false, 
                vehicle_type:vehicle_type
            });
            
            const location = entityManager.create(LocationHistory,{
                id: uuidv4(), 
                vehicle: newVehicle, 
                ts:Date(), 
                latitude:latitude, 
                longitude: longitude});
            
            await entityManager.save([newVehicle, location]);   

            res.status(200).json(newVehicle.id);

        } catch(err) {
            console.error('Error performing transaction:\n', err);
            return res.status(500).json({message:"Cannot create vehicle"});

        };
    }

        /**
     * Gets a specific vehicle with its location history.
     *
     * @param vehicleId               the uuid of the vehicle to return location history for
     * @return                        json with the vehicle details and a json array of all its past locations
     * @throws 500                    if the passed vehicleId is not in the database
     */

    public static one = async(req: Request, res: Response) => {
        const vehicle_id = req.params.vehicle_id;

        try {
            await getManager().transaction(async transactionalEntityManager => {
                
                    const vehicle = await transactionalEntityManager.findOneOrFail(Vehicle,vehicle_id);
                    const locationHistory = await transactionalEntityManager.find(LocationHistory,{
                        where: {vehicle: {id : vehicle_id}}, 
                        order:{ts:"ASC"}
                    });
        
                    vehicle.locationHistory = locationHistory;
                    
                    res.status(200).json(vehicle);
            }); 
        
        } catch(err) {
            console.error('Error performing transaction:\n', err);
            res.status(500).send("Vehicle not found");
        }


    }
    /**
     * Removes a specific vehicle.
     *
     * @param vehicleId               the uuid of the vehicle to delete
     * @return                        confirmation message
     * @throws 500                   if the passed vehicleId is not in the database
     * @throws 409                   if the vehicle is in use
     */

    static delete = async(req: Request, res: Response) => {
        const vehicle_id = req.params.vehicle_id;

        try {
            let deleted = false
            await getManager().transaction(async transactionalEntityManager => {

                    const vehicle = await transactionalEntityManager.findOneOrFail(Vehicle,vehicle_id);
                    if (!vehicle.in_use) {
                        await transactionalEntityManager.remove(vehicle);
                        deleted = true
                    }
            }); 
            if (deleted) {
                res.status(200).json({messages:[`Deleted vehicle with id ${vehicle_id} from database.`]});
            } else {
                res.status(409).json({message:"Vehicle ${vehicle_id} is currently in use"});
            }

        } catch(err) {
            console.error('Error performing transaction:\n', err);
            res.status(500).json({message:"No vehicle to delete"});
        }
    }

    /**
     * Check out a vehicle: log location and current time, set in_use = true
     *
     * @param vehicleId                 UUID of the vehicle to check out
     * @return                          confirmation message
     * @throws 500                      if the passed vehicleId is not in the database
     * @throws 409                      if the vehicle is in use
     */

     public static checkout = async(req: Request, res: Response) => {
        const vehicle_id = req.params.vehicle_id;

        if(vehicle_id === undefined){
            return res.status(400).json({messages:["Unable to start ride. No vehicle id provided."]})
        }

        try {
            await getManager().transaction(async transactionalEntityManager => {
                
                    // retrieve vehicle object based on vehicle ID
                    const vehicle = await transactionalEntityManager.findOneOrFail(Vehicle,vehicle_id);

                    // you can't start a ride on an in-use vehicle
                    if (vehicle.in_use) {
                        return res.status(409).json({message:"Vehicle ${vehicle_id} is currently in use"});
                    }

                    // Get the most recent location history entry for this vehicle 
                    const lastLocation = await transactionalEntityManager.findOneOrFail(LocationHistory, {
                        where: {"vehicle" : {id : vehicle_id, in_use: false}},
                        orderBy: {ts: 'DESC'} 
                    } as FindOneOptions);

                    // Create a new location history entry with most recent 
                    // latitude and longitude and current time 

                    const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        
                    const newLocation = transactionalEntityManager.create(LocationHistory, {
                        id: uuidv4(),
                        vehicle: vehicle,
                        ts: now,
                        latitude: lastLocation.latitude,
                        longitude: lastLocation.longitude
                    });

                    /* Mark vehicle as in use */
                    vehicle.in_use = true;

                    await transactionalEntityManager.save([newLocation, vehicle]);    

                    res.status(200).send("Ride started with vehicle ${vehicle_id}");
            }); 
        
        } catch(err) {
            console.error('Error performing transaction:\n', err);
            res.status(500).send("Vehicle not found");
        }

    }


    /**
     * Check in a vehicle: log location and current time, set in_use = false,
     * calucate speed and distance
     *
     * @param vehicleId                 UUID of the vehicle to check out
     * @return                          confirmation message
     * @throws 500                      if the passed vehicleId is not in the database
     * @throws 409                      if the vehicle is not use
     */

     static checkin = async(req: Request, res: Response) => {
        const vehicle_id = req.params.vehicle_id;
        const battery = req.body.battery;
        const endLongitude = req.body.longitude;
        const endLatitude = req.body.latitude;
        const now = Date();
        const messages = [];

        let startLongitude = 0;
        let startLatitude = 0;
        let startTime = null;

        // Check that parameters have valid values
        if ((endLongitude < -180 || endLongitude > 180) || (endLatitude < -90 || endLatitude > 90) || (battery < 0 || battery >100)) {
            if (endLongitude < -180 || endLongitude > 180) {
                messages.push("Longitude must be between -180 and 180")
            }
            if (endLatitude < -90 || endLatitude > 90) {
                messages.push("Latitude must be between -90 and 90")
            }
            if (battery < 0 || battery > 100) {
                messages.push("Battery (percent) must be between 0 and 100.")
            }
            return res.status(400).json({messages:messages});
        }
        
        try{
            await getManager().transaction(async transactionalEntityManager => {

                // get vehicle from ID and update values
                const vehicle = await transactionalEntityManager.findOneOrFail(Vehicle, vehicle_id);  
                vehicle.in_use = false
                vehicle.battery = battery

                // Get the most recent location history entry for this vehicle 
                // This is the ride start location
                // Used below to calculate distance and velocity
                const startLocation = await transactionalEntityManager.findOneOrFail(LocationHistory, {
                    where: {"vehicle" : {id : vehicle_id}},
                    orderBy: {ts: 'DESC'} 
                } as FindOneOptions);

                startLatitude = startLocation.latitude
                startLongitude = startLocation.longitude
                startTime = startLocation.ts

                // Create a new vehicle history entry for ride end location
                const endLocation = transactionalEntityManager.create(LocationHistory, {
                        id: uuidv4(), 
                        vehicle: vehicle, 
                        ts: now, 
                        longitude:endLongitude, 
                        latitude:endLatitude
                    });

                // Save updated vehicle and new location 
                await transactionalEntityManager.save([endLocation, vehicle])
            });

        // Calculate distance and velocity for this ride
        const distance= Calculations.calculate_distance({
            latitude1:+startLatitude,
            longitude1:+startLongitude,
            latitude2:+endLatitude,
            longitude2:+endLongitude
        });
        const duration = Calculations.calculate_duration_minutes({
            startTime:startTime,
            endTime:now
        });
        const speed = Calculations.calculate_velocity({
            distance:distance,
            startTime:startTime,
            endTime:now
        });

        res.status(200).json({messages:[
            `You have completed your ride on vehicle ${vehicle_id}.`, 
            `You traveled ${distance} km in ${duration} minutes, for an average velocity of ${speed} km/h`
            ]}); 

        } catch(err) {
            console.error('error performing transaction', err);
            res.status(500).json({message:`Unable to end ride on vehicle ${vehicle_id}`});
        };
 
    }

}
export default VehicleController;

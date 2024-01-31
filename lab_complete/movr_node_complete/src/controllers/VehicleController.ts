import { getManager} from "typeorm";
import { Request, Response } from "express";
import { Vehicle } from "../entities/Vehicle";
import { LocationHistory } from "../entities/LocationHistory";
import { v4 as uuidv4 } from "uuid";

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
            const query = `SELECT vehicles.id, vehicles.in_use, vehicles.serial_number,
                            vehicles.battery, vehicles.vehicle_info,
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
     * @param body                      JSON of vehcile details
     * @return                          the generated uuid (key) of the added vehicle
     */

    public static add = async(req: Request, res: Response) => {
        const battery = req.body.battery;
        const vehicle_info = {
            color: req.body.color,
            purchase_information: {
                manufacturer: req.body.manufacturer,
                purchase_date: req.body.purchase_date,
                serial_number: req.body.serial_number
            },
            type: req.body.vehicle_type,
            wear: req.body.wear
        };
        const latitude = req.body.latitude;
        const longitude = req.body.longitude;
       
        try {
            const entityManager = getManager();
            const newVehicle = entityManager.create(Vehicle,{
                id: uuidv4(), 
                battery:battery, 
                in_use:false, 
                vehicle_info:vehicle_info
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
                
                    const vehicleHistory = await transactionalEntityManager.findOneOrFail(Vehicle,vehicle_id);
                    const locationHistory = await transactionalEntityManager.find(LocationHistory,{
                        where: {vehicle: {id : vehicle_id}}, 
                        order:{ts:"ASC"}
                    });
        
                    vehicleHistory.locationHistory = locationHistory;
                    
                    res.status(200).json(vehicleHistory);
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
}
export default VehicleController;

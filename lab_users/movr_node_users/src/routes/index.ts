import { Application} from "express";
import { UserRouter } from "./api/user";
import { VehicleRouter } from "./api/vehicle";
import { RideRouter } from "./api/ride";

export class RouterInit {
	// Inits each router file
	public static init(express: Application){
		UserRouter.init(express);
		VehicleRouter.init(express);
		RideRouter.init(express);
	}
}
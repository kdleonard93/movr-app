import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Ride } from '../entities/Ride';
//Subscriber for events in the Rides table
@EventSubscriber()
export class PersonSubscriber implements EntitySubscriberInterface<Ride> {
    listenTo() {
        return Ride;
    }
//Provides the ability to retrieve the data from the table after an insert within the same transaction
    async afterInsert(event: InsertEvent<Ride>) {
        const ride = new Ride();
        const newRide = event.entity;
        await event.manager
            .getRepository(Ride)
            .save(newRide);
    }
}
  

const Event = require('../../models/event');
const User = require('../../models/user'); 
const { transformEvent } = require('./merge');

module.exports = { //Resolvers
    events: async () => {
        // Populate is very powerful --> Populated any relations it knows. It knows the relation throught the 'ref' key in model.
        // ref: 'User', fetches the user object using the IDs.
        try {
            let events = await Event.find();//.populate('creator')
            return events.map(event => {
                return transformEvent(event);
            });
        } catch (err) {
            throw err;
        }
    },
    createEvent: async (args, req) => {
        if(!req.isAuth) throw new Error('Unauthenticated!');
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            //+ here ensures to convert args.eventInput.price to float. cool!!
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            // Hardcoded for now. 
            creator: req.userId
        });
        let createdEvent;
        // We need to return the promise here to ensure that graphql waits for the async operation.
        try {
            const result = await event.save();
            createdEvent =  transformEvent(result);

            const creator = await User.findById(req.userId);
            if(!creator) {
                throw new Error('User not found.');
            }
            creator.createdEvents.push(event);
            
            await creator.save();
            return createdEvent;
        } catch (err) {
            throw err;
        }
    }
}
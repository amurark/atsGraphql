const Event = require('../../models/event');
const Booking = require('../../models/booking');
const {transformBooking, transformEvent} = require('./merge');

module.exports = { //Resolvers
    bookings: async (args, req) => {
        if(!req.isAuth) throw new Error('Unauthenticated!');
        try {
            let bookings = await Booking.find();
            return bookings.map(booking => {
                return transformBooking(booking);
            });
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async (args, req) => {
        if(!req.isAuth) throw new Error('Unauthenticated!');
        try {
            const fetchedEvent = await Event.findOne({_id: args.eventId});
            console.log(fetchedEvent);
            const booking = new Booking({
                event: fetchedEvent,
                user: req.userId
            });

            const result = await booking.save();
            return transformBooking(result);
        } catch (err) {
            throw err;
        }
    },
    cancelBooking: async (args, req) => {
        if(!req.isAuth) throw new Error('Unauthenticated!');
        try {
            // Populate populates the event field using its reference from the model. 
            const fetchBooking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEvent(fetchBooking._doc.event);
            await Booking.deleteOne({_id: args.bookingId});
            return event;
        } catch (err) {
            throw err;
        }
    }
}
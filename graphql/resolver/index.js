const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const { dateToString } = require('../../helpers/date');


// const events = eventIds => {
//     return Event
//             .find({_id: {$in: eventIds}})
//             .then(events => {
//                 return events.map(event => {
//                     return { 
//                         ...event._doc,
//                         date: new Date(event._doc.date).toISOString(),
//                         creator: user.bind(this, event.creator)
//                     }
//                 })
//             })
//             .catch(err => {
//                 throw err;
//             });
// }

const transformEvent = event => {
    return {
        ...event._doc,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator)
    };
};

const transformBooking = booking => {
    return {
        ...booking._doc,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    }
};

const events = async eventIds => {
    try {
        const events = await Event.find({_id: {$in: eventIds}});
        return events.map(event => {
            return transformEvent(event);
        });
    } catch (err) {
        throw err;
    }
}

// const user = userId => {
//     return User.findById(userId)
//         .then(user => {
//             return {
//                 ...user._doc,
//                 createdEvents: events.bind(this, user._doc.createdEvents)
//             };
//         })
//         .catch(err => {
//             throw err;
//         });
// }

const user = async userId => {
    try {
        let user = await User.findById(userId);
        return {
            ...user._doc,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
}

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return {
            ...event._doc,
            creator: user.bind(this, event._doc.creator)
        }
    } catch (err) {
        throw err;
    }
}

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
    bookings: async () => {
        try {
            let bookings = await Booking.find();
            return bookings.map(booking => {
                return transformBooking(booking);
            });
        } catch (err) {
            throw err;
        }
    }, 
    // createEvent: (args) => {
    //     // const event = {
    //     //     _id: Math.random().toString(),
    //     //     title: args.eventInput.title,
    //     //     description: args.eventInput.description,
    //     //     //+ here ensures to convert args.eventInput.price to float. cool!!
    //     //     price: +args.eventInput.price,
    //     //     date: args.eventInput.date
    //     // }
    //     const event = new Event({
    //         title: args.eventInput.title,
    //         description: args.eventInput.description,
    //         //+ here ensures to convert args.eventInput.price to float. cool!!
    //         price: +args.eventInput.price,
    //         date: new Date(args.eventInput.date),
    //         // Hardcoded for now. 
    //         creator: '5de890235b88af162450f96a'
    //     });
    //     let createdEvent;
    //     // We need to return the promise here to ensure that graphql waits for the async operation.
    //     return event
    //         .save()
    //         .then(result => {
    //             console.log(result);
    //             // Commented shenanigans not required because mongoose handles ObjectID to string conversions. 
    //             createdEvent =  { 
    //                 ...result._doc,
    //                 date: new Date(event._doc.date).toISOString(),
    //                 /*, _id: result.doc._id.toString()*/
    //                 creator: user.bind(this, result._doc.creator) 
    //             };
    //             return User.findById('5de890235b88af162450f96a');
    //         })
    //         .then(user => {
    //             if(!user) {
    //                 throw new Error('User not found.');
    //             }
    //             user.createdEvents.push(event);
    //             return user.save();
    //         })
    //         .then(result => {
    //             return createdEvent;
    //         })
    //         .catch(err => {
    //             console.log(err);
    //             throw err;
    //         });
    //     // events.push(event);
    //     // return event;
    // },
    createEvent: async args => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            //+ here ensures to convert args.eventInput.price to float. cool!!
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            // Hardcoded for now. 
            creator: '5de890235b88af162450f96a'
        });
        let createdEvent;
        // We need to return the promise here to ensure that graphql waits for the async operation.
        try {
            const result = await event.save();
            createdEvent =  transformEvent(result);

            const creator = await User.findById('5de890235b88af162450f96a');
            if(!creator) {
                throw new Error('User not found.');
            }
            creator.createdEvents.push(event);
            
            await creator.save();
            return createdEvent;
        } catch (err) {
            throw err;
        }
    },
    createUser: async args => {
        try {
            if(await User.findOne({email: args.userInput.email})) {
                throw new Error("User exists already.");
            }
            // Second argument is a Salt. Length of salt. 
            const user = new User({
                email: args.userInput.email,
                password: await bcrypt.hash(args.userInput.password, 12)
            });
            const newUser = await user.save();
            console.log("New user created.");
            return { ...newUser._doc, password: null, _id: newUser.id };
        } catch(err) {
            throw err;
        }
    },
    bookEvent: async args => {
        try {
            const fetchedEvent = await Event.findOne({_id: args.eventId});
            console.log(fetchedEvent);
            const booking = new Booking({
                event: fetchedEvent,
                user: '5de890235b88af162450f96a'
            });

            const result = await booking.save();
            return transformBooking(result);
        } catch (err) {
            throw err;
        }
    },
    cancelBooking: async args => {
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
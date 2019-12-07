const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdEvents: [
        {
            type: Schema.Types.ObjectId,
            // Comes from `module.exports = mongoose.model('Event', eventSchema);`
            ref: 'Event'
        }
    ]
});


module.exports = mongoose.model('User', userSchema);
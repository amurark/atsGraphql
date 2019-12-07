const bcrypt = require('bcryptjs');
const User = require('../../models/user');

module.exports = { //Resolvers
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
    }
}
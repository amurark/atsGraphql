const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

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
    },
    login: async ({email, password}) => {
        try {
            const user = await User.findOne({ email: email});
            if(!user) {
                throw new Error('User does not exist!');
            }
            const isEqual = await bcrypt.compare(password, user.password);
            if(!isEqual) throw new Error('Password is incorrect!');
            // Create a token using the given information - userID and Email.
            // The 2nd argument is the key which is used to create the token and encode the information. 
            // 3rd argument: <OPT> is used to set the expiry time. 
            const token = jwt.sign({userId: user.id, email: user.email}, 'supersecretkey', {
                expiresIn: '1h'
            });
            return {
                userId: user.id,
                token: token,
                tokenExpiration: 1
            };
        } catch(err) {
            throw err;
        }
    }
}
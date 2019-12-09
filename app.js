const express = require('express');
const bodyParser = require('body-parser');

const graphQlHttp = require('express-graphql');

const mongoose = require("mongoose");

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolver/index.js')
const isAuth = require('./middleware/is-auth');

const app = express();

// For storing data in memory. 
// const events = [];

app.use(bodyParser.json());

app.use((req, res, next) => {
    // `*` means every client (other than localhost:8000, which is by default) can send requests to this server.
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Browser sends an OPTIONS request before a POST request to ensure that the post it has to send is allowed by the server. 
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // This is to ensure that next methods in line are not called for OPTIONS request. 
    if(req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(isAuth);

// With graphQL there is only one point where all requests are sent.  
// The exclamation at the end of [String!]! is to ensure that a null value or a list of null values ([null, null]) are not allowed
app.use('/graphql', graphQlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers, 
    graphiql: true
}));

// app.get('/', (req, res, next) => {
//     res.send('Hello Jee!!');
// });

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
        .then(() => {
            console.log("Connected to the database. Serving at port 8000...");
            app.listen(8000);
        })
        .catch(err => {
            console.log(err);
        });

// app.listen(3000);
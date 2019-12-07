const express = require('express');
const bodyParser = require('body-parser');

const graphQlHttp = require('express-graphql');


const mongoose = require("mongoose");

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolver/index.js')

const app = express();

// For storing data in memory. 
// const events = [];

app.use(bodyParser.json());

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
            console.log("Connected to the database. Serving at port 3000...");
            app.listen(3000);
        })
        .catch(err => {
            console.log(err);
        });

// app.listen(3000);
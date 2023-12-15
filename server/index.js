const express = require('express');
const app = express();
app.use(express.json());
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://sshahari574:h9m47uuoN1GmyeC0@cluster0.zhapbej.mongodb.net";

const { addDriverAvailability, addRiderRequest, getRideDetail, getAllDrivers } = require('../utils/utilFunctions');
let db, carPoolRidesCollection, ridesCollection;
const dbName = "carPool", collection1 = "carPoolRides", collection2 = "rides";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});    

app.listen(3000, async (res, err) => {
    if(err) {
        console.log("Error " + err);
    } else {
        await client.connect();
        db = client.db(dbName);
        carPoolRidesCollection = db.collection(collection1);
        ridesCollection = db.collection(collection2);
        console.log("server started at port 3000");
    }
})

// To add driver's availability details
app.post('/v1/driverAvailability', async (req, res) => {
    addDriverAvailability(carPoolRidesCollection, req.body, function(err, result) {
        if(err) {
            res.status(404).send(err);
        } else {
            res.status(200).send(result);
        }
    });
})

//To book a ride for specific date and time
app.post('/v1/requestRide', async (req, res) => {
    console.log(req.body);
    addRiderRequest(carPoolRidesCollection, ridesCollection, req.body, function(err, result) {
        if(err) {
            res.status(404).send(err);
        } else {
            res.status(200).send(result);
        }
    });
})

//Get the details of the ride
app.get('/v1/ride/', async(req, res) => {
    const { rideId } = req.query;
    getRideDetail(ridesCollection, rideId, function(err, result) {
        if(err) {
            res.status(404).send(err);
        } else {
            res.status(200).send(result);
        }
    });
})

//Get the details of all drivers present in the database
app.get('/v1/getAllDrivers/', async(req, res) => {
    getAllDrivers(carPoolRidesCollection, function(err, result) {
        if(err) {
            res.status(404).send(err);
        } else {
            res.status(200).send(result);
        }
    });
})

module.exports = app;
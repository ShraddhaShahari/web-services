const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const uuid = uuidv4();

async function addDriverAvailability(carPoolRidesCollection, driverDetails, callback) {
    if (driverDetails.name == undefined || driverDetails.dateFrom == undefined || driverDetails.dateTo == undefined) {
        callback("Incorrect input data", null);
    } else {
        try {
            const insertResult = await carPoolRidesCollection.insertOne({name: driverDetails.name , dateFrom: moment(driverDetails.dateFrom).toDate(), dateTo: moment(driverDetails.dateTo).toDate()});
            callback(null, insertResult);
        } catch(err) {
            callback(err, null);
        }
    }
}

async function addRiderRequest(carPoolRidesCollection, ridesCollection, riderDetails, callback) {
    try {
        if (riderDetails.name === undefined || riderDetails.dateFrom === undefined || riderDetails.dateTo === undefined) {
            throw new Error("Incorrect input data");
        }

        const dateFrom = moment(riderDetails.dateFrom).toDate();
        const dateTo = moment(riderDetails.dateTo).toDate();

        const docs = await carPoolRidesCollection.find({
            $and: [
                { dateFrom: { $lte: dateFrom } }, // Driver's availability starts before or at rider's start time
                { dateTo: { $gte: dateTo } }  // Driver's availability ends after or at rider's end time
            ]
        }).toArray();

        if (docs.length === 0) {
            throw new Error("No driver found");
        }

        const doc = docs[0];
        const uid = uuidv4();
        await ridesCollection.insertOne({ rideId: uid, riderName: riderDetails.name, driverName: doc.name });
        await carPoolRidesCollection.deleteOne({ "_id": doc._id });

        callback(null, uid);
    } catch (err) {
        callback(err.message || err, null);
    }
}

async function getRideDetail(ridesCollection, rideId, callback) {
    if (rideId === undefined) {
        callback("Incorrect input data", null);
    } else {
        try {
            const findResult = await ridesCollection.findOne({rideId: rideId});
            console.log(findResult);
            callback(null, findResult);
        } catch(err) {
            callback(err, null);
        }
    }
}

async function getAllDrivers(carPoolRidesCollection, callback) {
        try {
            const findResult = await carPoolRidesCollection.find({}).toArray();
            console.log(findResult);
            callback(null, findResult);
        } catch(err) {
            callback(err, null);
        }
}

module.exports = { addDriverAvailability, addRiderRequest, getRideDetail, getAllDrivers }
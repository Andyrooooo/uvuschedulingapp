import clientPromise from '$lib/mongodb/mongodb.client'
import { ObjectId } from 'mongodb'

export async function load() {
    let client, events, name, theYearAndSeason, courses, roomsList

    try {
        client = await clientPromise

        // grabs schedule database
        const db = client?.db("scheduleDB")

        // grabs the events collection and the fileName collection
        const collection = db?.collection("events")

        const collectionTwo = db?.collection("fileName")

        const collectionThree = db?.collection("yearSeason")

        const collectionFour = db?.collection("courseList")

        const collectionFive = db?.collection("roomsList")

        // grabs all the events from the events collection and converts it to an array
        const eventsArray = await collection?.find({}).toArray()

        // grabs the name from the fileName collection
        const nameGrab = await collectionTwo?.findOne({})

        const yearSeasonGrab = await collectionThree?.findOne({})

        const courseListGrab = await collectionFour?.find({}).toArray()

        const roomsListGrab = await collectionFive?.find({}).toArray()

        // converts the object id to a string, and adds the image URL, and converts the bathrooms, price, security_deposit, extra_people, guests_included, and cleaning_fee to a float
        events = await Promise.all((eventsArray || []).map(async (event) => {
            return { 
                ...event, 
                _id: (event._id as ObjectId).toString()
            }
        }))

        name = nameGrab ? { ...nameGrab, _id: nameGrab._id.toString() } : null

        theYearAndSeason = yearSeasonGrab ? { ...yearSeasonGrab, _id: yearSeasonGrab._id.toString() } : null

        courses = await Promise.all((courseListGrab || []).map(async (course) => {
            return { 
                ...course, 
                _id: (course._id as ObjectId).toString()
            }
        }))

        roomsList = await Promise.all((roomsListGrab || []).map(async (room) => {
            return { 
                ...room, 
                _id: (room._id as ObjectId).toString()
            }
        }))

    } catch(error) {
        console.log('failed to connect to MongoDB', error)
        
        // closes the client connection if there is an error and the client exists
        if (client) {
            await client.close()
        }
        return {
            status: 500,
            body: 'Failed to connect to MongoDB'
        }
    }

    return {
        // returns a 200 status code and the movie object
        status: 200,
        body: {
            events: events,
            name: name,
            theYearAndSeason: theYearAndSeason,
            courses: courses,
            roomsList: roomsList
        }
    }

}
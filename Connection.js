
const mongoose = require("mongoose")

const ConnecionDb = async() =>{
    try {
        await mongoose.connect("mongodb://localhost:27017/Amazona-2")
        console.log("Data Base Connection Succesfull");
    } catch (error) {
        console.log(error);
        console.log("Data Base Connection Loss");
    }
}
module.exports = ConnecionDb
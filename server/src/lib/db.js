import mongoose from "mongoose"


export const connectDB = async ()=>{
    try{
       const conn = await mongoose.connect(process.env.Mongo_URI);
       console.log(`Mongo DB connected : ${conn.connection.host}`);
    }
    catch(error){
        console.log("Error connecting to mongo : ", error);
        process.exit(1); // 1 = failure
    }
}

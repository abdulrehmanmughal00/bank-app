import mongoose from "mongoose";

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI!).then(() => {
      console.log("Mongodb Connected Sucessfully !!!");
    });
  } catch (error) {
    console.error("mongodb connection error !!!", error);
    process.exit(1);
  }
}


export default connectToDB
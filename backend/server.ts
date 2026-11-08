import app from "./src/app.js";
import connectToDB from "./src/db/db.js";

async function startServer() {
  try {
  await  connectToDB();
    app.listen(process.env.PORT, () => {
      console.log(`server is running on port : ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("server starting failed", error);
  }
}

startServer();

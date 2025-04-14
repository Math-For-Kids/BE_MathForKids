const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const morgan = require("morgan");
const route = require("./routes");
const {
  initializeFirebaseApp,
  getFirebaseApp,
  uploadProcessData,
} = require("./config/firebase");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("combined"));

route(app);
initializeFirebaseApp();

app.get("/test", async (req, res) => {
  try {
    const data = await uploadProcessData();
    res.json({ message: "Success!", data: data });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload", error: error.message });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Math for kids: http://localhost:${process.env.PORT}`)
);

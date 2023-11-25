import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import contactsRouter from "./routes/api/contacts.js";

const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
dotenv.config();
app.use(morgan(formatsLogger));
app.use(cors());
app.use(express.json());
app.use("/api/contacts", contactsRouter);

app.use((err, _, res, __) => {
  console.log(err.stack);
  res.status(500).json({
    status: "fail",
    code: 500,
    message: err.message,
    data: "Internal Server Error",
  });
});
export { app };

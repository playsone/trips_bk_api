import express from "express";
import { router as index } from "./controller/index";
import { router as trip} from "./controller/trip";
export const app = express();
import cors from "cors";

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use("/", index);
app.use("/trip",trip)
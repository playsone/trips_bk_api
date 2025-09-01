import express from "express";
import cors from "cors";
import { router as index } from "./controller/index";
import { router as trip } from "./controller/trip";
import { router as ping } from "./controller/ping";

export const app = express();

app.use(express.json()); 
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use("/", index);
app.use("/trip", trip);
app.use("/ping", ping)
import express from "express";
import { app } from "./app"; // import app ที่รวม router แล้ว

const port = 3000;

app.use(express.json());

app.listen(port, () => {
    console.log(`Trip booking API listening at http://localhost:${port}`);
});
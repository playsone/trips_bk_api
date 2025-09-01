import { Router, Request, Response } from "express";
import db from "../db/dbconnect";

export const router = Router();

// TRIP CRUD
router.get("/", (req: Request, res: Response) => {
    db.all("SELECT * FROM trip", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

router.get("/:id", (req: Request, res: Response) => {
    const id = req.params.id;
    db.get("SELECT * FROM trip WHERE idx = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Trip not found" });
            return;
        }
        res.json(row);
    });
});

router.post("/", (req: Request, res: Response) => {
    const { name, country, destinationid, coverimage, detail, price, duration } = req.body;
    db.run(
        "INSERT INTO trip (name, country, destinationid, coverimage, detail, price, duration) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, country, destinationid, coverimage, detail, price, duration],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Trip created successfully", id: this.lastID });
        }
    );
});

router.put("/:id", (req: Request, res: Response) => {
    const id = req.params.id;
    const { name, country, destinationid, coverimage, detail, price, duration } = req.body;
    db.run(
        "UPDATE trip SET name = ?, country = ?, destinationid = ?, coverimage = ?, detail = ?, price = ?, duration = ? WHERE idx = ?",
        [name, country, destinationid, coverimage, detail, price, duration, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "Trip not found" });
                return;
            }
            res.json({ message: "Trip updated successfully" });
        }
    );
});

router.delete("/:id", (req: Request, res: Response) => {
    const id = req.params.id;
    db.run("DELETE FROM trip WHERE idx = ?", [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: "Trip not found" });
            return;
        }
        res.json({ message: "Trip deleted successfully" });
    });
});
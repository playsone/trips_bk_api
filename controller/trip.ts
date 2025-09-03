import express, { Request, Response } from "express";
import db from "../db/dbconnect";

export interface Trip {
    idx: number;
    name: string;
    country: string;
    destinationid: number;
    coverimage: string;
    detail: string;
    price: number;
    duration: number;
}

export const router = express.Router();

// GET /trip - get all trips
router.get("/", (req: Request, res: Response) => {
    db.all("SELECT * FROM trip", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /trip/search?name=xxx - search trips by name
router.get("/search/fields", (req: Request, res: Response) => {
    const name = req.query.name ? String(req.query.name) : "";
    if (!name.trim()) {
        return res.json([]);
    }
    const sql = "SELECT * FROM trip WHERE name LIKE ?";
    db.all(sql, [`%${name}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /trip/:id - get single trip by id
router.get("/:id", (req: Request, res: Response) => {
    const id = +req.params.id;

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }

    db.get("SELECT * FROM trip WHERE idx = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Trip not found" });
        res.json(row);
    });
});

// POST /trip - create new trip
router.post("/", (req: Request, res: Response) => {
    const { name, country, destinationid, coverimage, detail, price, duration } = req.body;

    if (!name || !country) {
        return res.status(400).json({ error: "Name and country are required" });
    }

    const sql = `INSERT INTO trip (name, country, destinationid, coverimage, detail, price, duration) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [name, country, destinationid || null, coverimage || null, detail || null, price || 0, duration || 0],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                message: "Trip created successfully",
                id: this.lastID,
                affected_rows: this.changes
            });
        }
    );
});

// PUT /trip/:id - update trip
router.put("/:id", (req: Request, res: Response) => {
    const id = +req.params.id;

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }

    // Check if trip exists first
    db.get("SELECT * FROM trip WHERE idx = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Trip not found" });

        // Merge existing data with new data
        const updatedTrip = { ...row, ...req.body };

        const sql = `UPDATE trip SET name = ?, country = ?, destinationid = ?, 
                        coverimage = ?, detail = ?, price = ?, duration = ? WHERE idx = ?`;

        db.run(sql, [
            updatedTrip.name,
            updatedTrip.country,
            updatedTrip.destinationid,
            updatedTrip.coverimage,
            updatedTrip.detail,
            updatedTrip.price,
            updatedTrip.duration,
            id
        ], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                message: "Trip updated successfully",
                affected_rows: this.changes
            });
        });
    });
});

// DELETE /trip/:id - delete trip
router.delete("/:id", (req: Request, res: Response) => {
    const id = +req.params.id;

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }

    db.run("DELETE FROM trip WHERE idx = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        if (this.changes === 0) {
            return res.status(404).json({ error: "Trip not found" });
        }

        res.json({
            message: "Trip deleted successfully",
            affected_rows: this.changes
        });
    });
});
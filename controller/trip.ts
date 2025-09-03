import express, { Request, Response } from "express";
import db from "../db/dbconnect";

export interface Trip {
    idx:           number;
    name:          string;
    country:       string;
    destinationid: number;
    coverimage:    string;
    detail:        string;
    price:         number;
    duration:      number;
}

export const router = express.Router();

// GET /trip (all or by id)
router.get("/", (req: Request, res: Response) => {
    if (req.query.id) {
        db.get("SELECT * FROM trip WHERE idx = ?", [req.query.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ message: "Trip not found" });
            res.json(row);
        });
    } else {
        db.all("SELECT * FROM trip", [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    }
});

// GET /trip/:id
router.get("/:id", (req: Request, res: Response) => {
    const id = +req.params.id;
    db.get("SELECT * FROM trip WHERE idx = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: "Trip not found" });
        res.json(row);
    });
});

// GET /trip/search/fields?id=...&name=...
router.get("/search/fields", (req: Request, res: Response) => {
    const id = req.query.id ? Number(req.query.id) : null;
    const name = req.query.name ? String(req.query.name) : "";
    let sql = "SELECT * FROM trip WHERE ( ? IS NULL OR idx = ? ) OR ( ? = '' OR name LIKE ? )";
    db.all(sql, [id, id, name, `%${name}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /trip/newdata
router.post("/newdata", (req: Request, res: Response) => {
    const trip: Trip = req.body;
    if (!trip.name || !trip.country) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const sql =
        "INSERT INTO trip (name, country, destinationid, coverimage, detail, price, duration) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.run(
        sql,
        [
            trip.name,
            trip.country,
            trip.destinationid,
            trip.coverimage,
            trip.detail,
            trip.price,
            trip.duration,
        ],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ affected_row: this.changes, last_idx: this.lastID });
        }
    );
});

// DELETE /trip/:id
router.delete("/:id", (req: Request, res: Response) => {
    const id = +req.params.id;
    db.run("DELETE FROM trip WHERE idx = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) {
            return res.status(404).json({ message: "Trip not found" });
        }
        res.status(200).json({ affected_row: this.changes });
    });
});

// PUT /trip/:id
router.put("/:id", (req: Request, res: Response) => {
    const id = +req.params.id;
    const trip: Trip = req.body;

    db.get("SELECT * FROM trip WHERE idx = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: "Trip not found" });

        // Merge original and new data
        const updateTrip = { ...row, ...trip };

        const sql =
            "UPDATE trip SET name = ?, country = ?, destinationid = ?, coverimage = ?, detail = ?, price = ?, duration = ? WHERE idx = ?";
        db.run(
            sql,
            [
                updateTrip.name,
                updateTrip.country,
                updateTrip.destinationid,
                updateTrip.coverimage,
                updateTrip.detail,
                updateTrip.price,
                updateTrip.duration,
                id,
            ],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(200).json({ affected_row: this.changes });
            }
        );
    });
});
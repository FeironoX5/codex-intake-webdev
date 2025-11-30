import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {pipeline} from "node:stream/promises";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({origin: 'http://localhost:4200'}));

app.post('/api', async (req, res) => {
    try {
        // todo remove magic consts to .env
        // todo разобраться с приоритетами env/.env
        const response = await fetch('http://llm.codex.so/stream', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.TOKEN,
                'accept': 'application/x-ndjson',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });
        await pipeline(response.body, res);
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            // todo status
            res.status(500).json({error: error.message});
        }
    }
});

const port = 3000;
app.listen(port, () => console.log(`runs on http://localhost:${port}`));

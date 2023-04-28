import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (_: Request, res: Response) => {
    res.send({
        status: "ok"
    });
})

app.post('/auth', (req: Request, res: Response) => {
    
})

app.listen(port, () => {
    console.log(`Server has been started on port ${port}`);
})
import { Request, Response } from "express";

export interface ProfileController {

    update(req: Request, res: Response): Promise<void>

    profile(req: Request, res: Response): Promise<void>

}
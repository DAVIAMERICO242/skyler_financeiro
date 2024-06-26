import { Router, Response, NextFunction } from "express";
import { RequestModel,JwtModel} from "../schemas/this-api/schemas";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import {Mutex} from 'async-mutex';
const mutex = new Mutex();

export const AuthMiddleware = async (req: RequestModel,
    res: Response,
    next:NextFunction)=>{

    const release = await mutex.acquire();
    const token = req?.headers['token'] as string;

    if(!token){
        res.status(400).end('ACESSO ILEGAL A API');
        release();
    }else{
        try{
            const decoded:(JwtModel) = jwt.verify(token,process.env.JWT_SECRET as string) as JwtModel;
            req.username = decoded.username;
            release();
            next();
        }catch(err){
            release();
            res.status(400).end('ACESSO ILEGAL A API');
        }
    }
}
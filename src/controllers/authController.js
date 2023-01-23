
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid';
import db from '../database.js';


export async function cadastrar(req, res){
    
    const obj = {
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    }
    const obj2 = {
        email: req.body.email,
        entries: []
    }
    try {
        await db.collection('users').insertOne(obj)
        await db.collection('entries').insertOne(obj2)
        res.sendStatus(201);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

export async function logar(req, res) {
    const namae = res.locals.name
    const tok = uuid()
    const obj = {
        email: namae.email,
        token: tok,
        lastStatus: Date.now()
    }
    const objR = {
        name: namae.name,
        token: tok
    }
    try {
        await db.collection('online').insertOne(obj)
        return res.status(201).send(objR)
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

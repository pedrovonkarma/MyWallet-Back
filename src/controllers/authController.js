import joi from 'joi'
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid';
import db from '../database.js';


export async function cadastrar(req, res){
    const mail = req.body.email;
    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().required(),
        password: joi.string().required()
    })
    const validation = userSchema.validate(req.body)
    if (validation.error) {
        return res.status(422).send(validation.error.details)
    }
    try {
        const namae = await db.collection('users').findOne({ email: mail })
        if (namae) {
            return res.status(409).send('Email já cadastrado.');
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
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
    const userSchema = joi.object({
        email: joi.string().required(),
        password: joi.string().required()
    })
    const validation = userSchema.validate(req.body)
    if (validation.error) {
        return res.status(422).send(validation.error.details)
    }
    let namae
    try {
        namae = await db.collection('users').findOne({ email: req.body.email })
        if (!namae || !bcrypt.compareSync(req.body.password, namae.password)) {
            return res.status(404).send('Dados incorretos');
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
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

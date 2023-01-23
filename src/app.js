import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi'
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import cors from 'cors'
dotenv.config();
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;
mongoClient.connect(() => {
    db = mongoClient.db();
});
const app = express();
app.use(cors())
app.use(express.json());


app.post('/signin', async (req, res) => {
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
});

app.post('/login', async (req, res) => {
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
})

app.get('/entries', async (req, res) => {
    const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');

  if(!token) return res.sendStatus(401);

  const session = await db.collection("online").find({token: token}).toArray();
           
  if (session.length===0) {
      return res.status(401).send('deslogado');
  }

  try{
    const entradas = await db.collection("entries").find({ email: session[0].email }).toArray()
    return res.status(200).send(entradas[0].entries)
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
}

})

app.post('/entries', async (req, res) => {
    const { authorization } = req.headers;
    
  const token = authorization?.replace('Bearer ', '');
    
  if(!token){return res.sendStatus(401)}
    
  const session = await db.collection("online").find({token: token}).toArray();
           
  if (session.length===0) {
      return res.status(401).send('deslogado');
  }

  const userSchema = joi.object({
    valor: joi.number().required(),
    description: joi.string().required()
})
const validation = userSchema.validate(req.body)
if (validation.error) {
    return res.status(422).send(validation.error.details)
}
const obj = {
    date: dayjs().format('DD/MM'),
    price: req.body.valor,
    desc: req.body.description
}

try{
    let entradas = await db.collection("entries").find({ email: session[0].email }).toArray()
    entradas = entradas[0].entries
    await db.collection("entries").updateOne({ email: session[0].email }, { $set: {entries: [...entradas, obj]} })
    return res.sendStatus(200)
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
}
})

async function remover(){
    let partners
    let removidos
    try {
        partners = await db.collection('online').find().toArray();
        partners = partners.filter((i) => ((Date.now())/1000) - ((i.lastStatus)/1000) >300)
        removidos = partners.map((i) => i.email)
    } catch (error) {
        console.error(error);
    }
    if(partners.length===0){
        return
    }

    try {

        for (let index = 0; index < removidos.length; index++) {
            await db.collection('online').deleteOne({email: removidos[index]})
            
        }
        return
    } catch (error) {
        console.error(error);
    }
}

app.listen(5000)
setInterval(remover, 30000)
import joi from 'joi'
import dayjs from 'dayjs';
import db from '../database.js';


export async function getEntries(req, res){
    const session = res.locals.session
  try{
    const entradas = await db.collection("entries").find({ email: session[0].email }).toArray()
    return res.status(200).send(entradas[0].entries)
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
}
}

export async function postEntry(req, res){
  
  const session = res.locals.session

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
    await db.collection('online').updateOne({ email: session[0].email }, { $set: {lastStatus: Date.now()} })
    return res.sendStatus(200)
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
}
}
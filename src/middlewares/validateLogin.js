import db from "../database.js";
import joi from 'joi'
import bcrypt from 'bcrypt'
export async function validateLogin(req, res, next){
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
    res.locals.name = namae
    next()
}
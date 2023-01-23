import db from "../database.js";
import joi from 'joi'
export async function validateSign(req, res, next){
    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().required(),
        password: joi.string().required()
    })
    const validation = userSchema.validate(req.body)
    if (validation.error) {
        return res.status(422).send(validation.error.details)
    }

    const mail = req.body.email;
    try {
        const namae = await db.collection('users').findOne({ email: mail })
        if (namae) {
            return res.status(409).send('Email já cadastrado.');
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }

    next()

}
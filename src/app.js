import express from 'express';
import router from './routes.js';
import db from './database.js';

const app = express();


app.use(router)
async function remover(){
    let partners
    let removidos
    try {
        partners = await db.collection('online').find().toArray();
        partners = partners.filter((i) => ((Date.now()) - ((i.lastStatus)) >300000))
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
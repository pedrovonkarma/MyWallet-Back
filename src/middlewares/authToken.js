import db from "../database.js";
export async function authToken(req, res, next){
    const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');

  if(!token) return res.sendStatus(401);

  const session = await db.collection("online").find({token: token}).toArray();
           
  if (session.length===0) {
      return res.status(401).send('deslogado');
  }
  res.locals.session = session
  next()
}
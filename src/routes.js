import express from "express";
import { getEntries, postEntry } from './controllers/userController.js';
import { cadastrar, logar } from './controllers/authController.js';
import cors from 'cors'
import { authToken } from "./middlewares/authToken.js";
import { validateSign } from "./middlewares/validateSign.js";
import { validateLogin } from "./middlewares/validateLogin.js";

const router = express.Router();

router.use(cors())
router.use(express.json());

router.post('/signin', validateSign, cadastrar);

router.post('/login', validateLogin, logar)

router.get('/entries', authToken, getEntries)

router.post('/entries', authToken, postEntry)

export default router
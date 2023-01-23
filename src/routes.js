import express from "express";
import { getEntries, postEntry } from './controllers/userController.js';
import { cadastrar, logar } from './controllers/authController.js';
import cors from 'cors'

const router = express.Router();

router.use(cors())
router.use(express.json());

router.post('/signin', cadastrar);

router.post('/login', logar)

router.get('/entries', getEntries)

router.post('/entries', postEntry)

export default router
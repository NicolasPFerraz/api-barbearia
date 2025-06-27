import { Router } from 'express';
import * as controller from '../controllers/adminController';

const router = Router();

router.post('/login', controller.loginAdmin);

export default router;
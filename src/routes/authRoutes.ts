import { Router } from 'express';
import * as controller from '../controllers/adminController';

const router = Router();

router.post('/login', controller.loginAdmin);
router.post('/logout', controller.logoutAdmin);
router.post('/check', controller.checkAdmin);

export default router;
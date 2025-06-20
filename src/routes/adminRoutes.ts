import { Router } from 'express';
import * as controller from '../controllers/adminController';

const router = Router();

router.get('/dashboard', controller.getAdminDashboard);

export default router;
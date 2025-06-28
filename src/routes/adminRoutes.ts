import { Router } from 'express';
import * as controller from '../controllers/adminController';
import authenticate from '../middlewares/authenticate';

const router = Router();

router.post('/dashboard', authenticate, controller.getAdminDashboard);
router.delete('/deleteAppointment/:id', authenticate, controller.deleteAppointment);
router.patch('/updateAppointmentStatus/:id', authenticate, controller.updateAppointmentStatus);

export default router;
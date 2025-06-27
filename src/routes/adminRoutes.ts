import { Router } from 'express';
import * as controller from '../controllers/adminController';

const router = Router();

router.get('/dashboard', controller.getAdminDashboard);
router.delete('/deleteAppointment/:id', controller.deleteAppointment);
router.patch('/updateAppointmentStatus/:id', controller.updateAppointmentStatus);

export default router;
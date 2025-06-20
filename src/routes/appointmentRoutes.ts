import { Router } from 'express';
import * as controller from '../controllers/appointmentController';

const router = Router();

router.post('/appointments', controller.createAppointment);
router.post('/appointments/available', controller.getAvailableSlots);

export default router;
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = createAppointment;
exports.getAvailableSlots = getAvailableSlots;
const db_1 = require("../db");
function createAppointment(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fullName, phone, service, barber, date, time } = data;
        const result = yield db_1.pool.query(`INSERT INTO appointments (full_name, phone, service, barber, date, time)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [fullName, phone, service, barber, date, time]);
        return result.rows[0];
    });
}
function getAvailableSlots(date, service, barber) {
    return __awaiter(this, void 0, void 0, function* () {
        // Exemplo: retorna horários das 09:00 às 19:00 que não estão ocupados
        const allSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
            '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
            '18:00', '18:30', '19:00', '19:30'
        ];
        const result = yield db_1.pool.query(`SELECT time FROM appointments WHERE date = $1 AND barber = $2`, [date, barber]);
        const booked = result.rows.map((row) => row.time);
        return allSlots.filter(slot => !booked.includes(slot));
    });
}

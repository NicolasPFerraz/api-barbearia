import express from 'express';
import cors from 'cors';
import appointmentRoutes from './routes/appointmentRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permite todas as origens por padrão
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', appointmentRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
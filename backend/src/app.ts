import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { notFound, errorHandler } from './middleware/errorMiddleware';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// Mount Routes here
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import rentalRoutes from './routes/rentalRoutes';
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/rentals', rentalRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;

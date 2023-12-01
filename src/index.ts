import { Elysia } from 'elysia';
import { connect } from 'mongoose';
import { PORT, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_NAME } from './config';

await connect(`mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}`);

import orderRoutes from './routes/orderRoutes';

const server = new Elysia();

server.use(orderRoutes);

server.listen(PORT, () => {console.log(`Listening on http://localhost:${PORT}/`)});

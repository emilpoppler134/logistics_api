import { Elysia } from 'elysia';
import { connect } from 'mongoose';
import { PORT, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_NAME } from './config';

await connect(`mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}`);

import orderRoutes from './routes/orderRoutes';
import employeeRoutes from './routes/employeeRoutes';

const server = new Elysia();

server.group("/orders", app => app.use(orderRoutes));
server.group("/employees", app => app.use(employeeRoutes));

server.listen(PORT, () => {console.log(`Listening on http://localhost:${PORT}/`)});

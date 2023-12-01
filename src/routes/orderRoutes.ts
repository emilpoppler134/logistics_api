import { Elysia } from 'elysia';
import controller from '../controllers/orders';

const router = new Elysia();

router.post("/orders/create", controller.create);
router.post("/orders/", controller.all);

export default router;
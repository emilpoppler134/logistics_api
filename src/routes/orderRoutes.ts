import { Elysia } from 'elysia';
import controller from '../controllers/orders';

const router = new Elysia();

router.get("/", controller.list);
router.get("/search", controller.search);
router.get("/month/:month/sales", controller.sales);
router.get("/month/:month/most-expensive", controller.mostExpensive);
router.get("/status/:status", controller.status);
router.get("/status/:status/oldest", controller.oldest);
router.get("/:id", controller.get);

router.post("/", controller.create);
router.put("/", controller.update);
router.delete("/", controller.remove);

export default router;
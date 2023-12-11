import { Elysia } from 'elysia';
import controller from '../controllers/orders';

const router = new Elysia();

router.get("/", controller.list);
router.get("/search", controller.search);
router.get("/:id", controller.get);

router.post("/", controller.create);
router.put("/", controller.update);
router.delete("/", controller.remove);

export default router;
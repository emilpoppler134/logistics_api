import { Elysia } from 'elysia';
import controller from '../controllers/employees';

const router = new Elysia();

router.get("/", controller.list);
router.get("/:id", controller.get);
router.get("/search", controller.search);
router.post("/", controller.create);
router.put("/", controller.update);
router.delete("/", controller.remove);

export default router;
import { Elysia } from 'elysia';
import controller from '../controllers/employees';

const router = new Elysia();

router.get("/", controller.list);
router.get("/search", controller.search);
router.get("/date/:date", controller.date);
router.get("/pickers/available", controller.availablePickers);
router.get("/:id", controller.get);

router.post("/", controller.create);
router.put("/", controller.update);
router.delete("/", controller.remove);

export default router;
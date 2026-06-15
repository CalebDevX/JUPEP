import { Router, type IRouter } from "express";
import healthRouter from "./health";
import subjectsRouter from "./subjects";
import questionsRouter from "./questions";
import notesRouter from "./notes";
import quizRouter from "./quiz";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(subjectsRouter);
router.use(questionsRouter);
router.use(notesRouter);
router.use(quizRouter);
router.use(dashboardRouter);

export default router;

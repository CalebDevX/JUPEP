import { Router, type IRouter } from "express";
import healthRouter from "./health";
import subjectsRouter from "./subjects";
import questionsRouter from "./questions";
import notesRouter from "./notes";
import quizRouter from "./quiz";
import dashboardRouter from "./dashboard";
import aiRouter from "./ai";
import communityRouter from "./community";

const router: IRouter = Router();

router.use(healthRouter);
router.use(subjectsRouter);
router.use(questionsRouter);
router.use(notesRouter);
router.use(quizRouter);
router.use(dashboardRouter);
router.use(aiRouter);
router.use(communityRouter);

export default router;

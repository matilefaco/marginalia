import { Router, type IRouter } from "express";
import healthRouter from "./health";
import booksRouter from "./books";
import annotationsRouter from "./annotations";
import feedRouter from "./feed";
import usersRouter from "./users";
import communityRouter from "./community";

const router: IRouter = Router();

router.use(healthRouter);
router.use(booksRouter);
router.use(annotationsRouter);
router.use(feedRouter);
router.use(usersRouter);
router.use(communityRouter);

export default router;

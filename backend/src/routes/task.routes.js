import {Router} from 'express';
import {
    createTask,
    getTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getMyTasks,
    getOthersTasks,
    deleteUserTasks

} from '../controllers/task.controller.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'

const router = Router();
router.use(verifyJWT);

router.route('/create-task').post(createTask);
router.route('/get-task/:taskId').get(getTask); 
router.route('/update-task/:taskId').patch(updateTask);
router.route('/update-task-status/:taskId').patch(updateTaskStatus);
router.route('/delete-task/:taskId').delete(deleteTask);
router.route('/get-my-tasks/:projectId').get(getMyTasks);
router.route('/get-others-tasks/:projectId').get(getOthersTasks);
router.route('/delete-user-tasks/:userId/:projectId').delete(deleteUserTasks); //if user leaves group

export default router;
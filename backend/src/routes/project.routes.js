import Router from 'express'
import {
    addProject,
    getGroupProjects,
    getMyGroupProjects,
    getProject,
    updateProject,
    deleteProject,
    updateProjectStatus,
    getMyIndividualProjects
} from '../controllers/project.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()
router.use(verifyJWT)

router.route('/add-project').post(addProject)
router.route('/get-group-projects/:groupId').get(getGroupProjects)
router.route('/get-my-group-projects').get(getMyGroupProjects)
router.route('/get-my-individual-projects').get(getMyIndividualProjects)
router.route('/get-project/:projectId').get(getProject)
router.route('/update-project/:projectId').patch(updateProject)
router.route('/update-project-status/:projectId').patch(updateProjectStatus)
router.route('/delete-project/:projectId').delete(deleteProject)

export default router
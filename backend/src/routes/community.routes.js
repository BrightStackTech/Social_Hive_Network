import { Router } from 'express';
import { createCommunity, checkCommunityNameUnique, getCommunityByName, updateCommunity, joinCommunity, leaveCommunity, 
    removeMember, deleteCommunity, getUnjoinedCommunities, sendJoinRequest, handleJoinRequest, cancelJoinRequest,
    getPendingRequests, getJoinedCommunities, searchCommunities,
} from '../controllers/community.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { Community } from '../models/community.model.js'; 

const router = Router();


router.route('/create-community').post(verifyJWT, createCommunity);
router.route('/check-community-name').get(checkCommunityNameUnique);
router.route('/joined-communities').get(verifyJWT, getJoinedCommunities);
router.route('/search').get(searchCommunities);
router.route('/unjoined-communities').get(verifyJWT, getUnjoinedCommunities);
router.route('/:communityName').get(getCommunityByName).put(verifyJWT, updateCommunity).delete(verifyJWT, deleteCommunity);
router.route('/:communityName/join').post(verifyJWT, joinCommunity);
router.route('/:communityName/leave').post(verifyJWT, leaveCommunity);
router.route('/:communityName/remove/:userId').delete(verifyJWT, removeMember);
router.route('/:communityName/send-join-request').post(verifyJWT, sendJoinRequest);
router.route('/:communityName/handle-join-request/:userId/:action').post(verifyJWT, handleJoinRequest);
router.route('/:communityName/cancel-join-request').post(verifyJWT, cancelJoinRequest);
router.route('/:communityName/pending-requests').get(verifyJWT, getPendingRequests);


export default router;
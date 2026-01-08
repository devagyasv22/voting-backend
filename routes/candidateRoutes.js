const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware } = require('../jwt');
const candidateController = require('../controllers/candidateController');

// Route Definitions
router.post('/', jwtAuthMiddleware, candidateController.addCandidate);
router.put('/:candidateID', jwtAuthMiddleware, candidateController.updateCandidate);
router.delete('/:candidateID', jwtAuthMiddleware, candidateController.deleteCandidate);
router.post('/vote/:candidateID', jwtAuthMiddleware, candidateController.voteForCandidate);
router.get('/vote/count', candidateController.getVoteCount);
router.get('/lists', candidateController.listCandidates);

module.exports = router;
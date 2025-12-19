const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const User = require('../models/user');
const {jwtAuthMiddleware} = require('../jwt');
const { route } = require('./userRoutes');

const checkAdminrole = async(userId) => {
    // Fetch user from database using userId
    try{
        const user = await User.findById(userId);
        return user.role === 'admin';

    }catch(err){
        console.error(err);
        return false;
    }
}
// POST route to add a candidate
router.post('/',jwtAuthMiddleware ,async (req, res) =>{
    try{
        if(!await checkAdminrole(req.user.id)){
            return res.status(403).json({error: 'Access denied. Admins only.'});
        }

        const data = req.body // Assuming the request body contains the Candidate data
        console.log(req.body);

        // Create a new Candidate document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new Candidate to the database
        const response = await newCandidate.save();
        console.log('data saved');

        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/:candidateID',jwtAuthMiddleware,async (req, res)=>{
    try{

        if(!await checkAdminrole(req.user.id)){
            return res.status(403).json({error: 'Access denied. Admins only.'});
        }
    
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the Candidate

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


router.delete('/:candidateID',jwtAuthMiddleware, async (req, res)=>{
    try{

        if(!await checkAdminrole(req.user.id)){
            return res.status(403).json({error: 'Access denied. Admins only.'});
        }
    
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter

        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.get('/lists', async (req, res) => {
    try {
        const candidates = await Candidate.find();
        res.status(200).json(candidates);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
);
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
    const userId = req.user.id;
    try {


        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }

        if(user.role !== 'voter'){
            return res.status(403).json({ error: 'Only voters can vote' });
        }
        if (user.isVoted) {
            return res.status(400).json({ error: 'User has already voted' });
        }

        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        
        candidate.votes.push({ user: userId });
        candidate.voteCount += 1;

        await candidate.save();

        user.isVoted = true;
        await user.save();

        console.log('Vote recorded successfully');
        res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
);

router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: -1 });
        
        const voteCounts = candidates.map(c => ({
        party: c.party,
        count: c.voteCount
        }));


        res.status(200).json(voteCounts);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
);

module.exports = router;
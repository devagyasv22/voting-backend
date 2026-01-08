const Candidate = require('../models/candidate');
const User = require('../models/user');

// Helper function to check if user is admin
const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.role === 'admin';
    } catch (err) {
        return false;
    }
};

// POST /candidate - Add a new candidate
exports.addCandidate = async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'user does not have admin role' });
        }

        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({ response: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// PUT /candidate/:candidateID - Update a candidate
exports.updateCandidate = async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'user does not have admin role' });
        }

        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true,
            runValidators: true,
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// DELETE /candidate/:candidateID - Delete a candidate
exports.deleteCandidate = async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'user does not have admin role' });
        }

        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data deleted');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// POST /candidate/vote/:candidateID - Vote for a candidate
exports.voteForCandidate = async (req, res) => {
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try {
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'admin is not allowed' });
        }

        // Update Candidate document
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // Update User document
        user.isVoted = true;
        await user.save();

        // Get the "io" variable we saved in server.js
        const io = req.app.get('io');
        
        // Fetch the fresh list of candidates (sorted by votes)
        const updatedCandidates = await Candidate.find().sort({ voteCount: -1 });
        
        // Broadcast the 'voteUpdate' event to ALL connected users
        io.emit('voteUpdate', updatedCandidates);

        res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// GET /candidate/vote/count - Get vote counts
exports.getVoteCount = async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: -1 });
        const voteCounts = candidates.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            };
        });
        return res.status(200).json(voteCounts);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// GET /candidate/lists - Get list of candidates
exports.listCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find();
        res.status(200).json(candidates);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
import express from 'express';
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json());

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const port = process.env.PORT || 3000;

app.post('/post/:id/view', async(req,res)=>{
    const {id} = req.params;
    try {
        const views = await redis.incr(`post:${id}:views`);
        res.json({
            postId: id,
            views
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update view count' });
    }
})

app.post('/leaderboard/score', async(req, res)=>{
    const {userId, score} = req.body;
    try {
        const updatedScore = await redis.zincrby("leaderboard", score, userId);
        res.json({
            userId,
            score
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update leaderboard score' });
    }
})

app.get("/leaderboard", async(req, res)=>{
    try {
        const leader = await redis.zrevrange("leaderboard", 1, 5, 80);
        res.json({
            leader: leader
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get leader' });
    }
})

app.get("/leaderboard/:userId/rank", async(req, res)=>{
    const {userId} = req.params();
    try {
        const userRank = await redis.zrevrank("leaderboard", userId);
        res.json({
            userRank
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user rank' });
    }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

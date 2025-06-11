import express from 'express'
import { db } from '../database.js'
import { verifyUserIdentity } from '../middleware/supabaseAuth'

const router = express.Router()

router.put('/edit/:postid', verifyUserIdentity, (req, res) => {
  const postId = req.params.postid
})

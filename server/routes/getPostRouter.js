import express from 'express'
import { db } from '../database.js'

const router = express.Router()
router.get('/get-all', (req, res) => {
  const getAll = db.prepare(`SELECT * FROM posts`)
  const allPosts = getAll.run()
  return res.json(allPosts)
})
export default router

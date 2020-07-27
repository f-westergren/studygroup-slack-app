const express = require("express");
const ExpressError = require('../expressError');
const db = require("../db");
const router = new express.Router();
const moment = require('moment');

// Users_ids
const users = require('../users')

const checkSlackVerification = require('../middleware/slackVerification')

router.post("/goal", checkSlackVerification, async (req, res) => {
  const date = new Date();
  const { user_id, text, channel_id } = req.body;

  try {
    await db.query(
      `INSERT INTO goals (name, channel_id, goal, date)
      VALUES ($1, $2, $3, $4)`,
      [users[user_id], channel_id, text, date]
    )

    // Get this week's goals only. 
    const startOfWeek = moment().startOf('week').toDate();
    const result = await db.query(
      `SELECT name, goal FROM goals
      WHERE date >=$1 AND channel_id=$2`, [startOfWeek, channel_id]
    )

    let goals = createGoalMarkdown(result.rows)
    return res.send(goals)

  } catch (error) {
    throw new ExpressError(error, 400)
  }
})

router.post("/goals", checkSlackVerification, async (req, res) => {
  try {
    const startOfWeek = moment().startOf('week').toDate();
    const result = await db.query(
      `SELECT name, goal FROM goals
      WHERE date >=$1`, [startOfWeek]
    )
    let goals = createGoalMarkdown(result.rows)
    goals["response_type"] = "in_channel"

    res.send(goals)
  } catch (error) {
    throw new ExpressError(error, 400)
  }
})

router.post("/exercise", checkSlackVerification, async (req, res) => {
  const date = new Date();
  try {
    const { channel_id, text } = req.body
    
    // Get params from req.body.text and separate url from description.
    const params = text.split(' ')
    const url = params[0]
    params.shift() // Remove url from params.
    let description = params.join(' ')

    console.log('HERE', url, channel_id, description, date)
    
    await db.query(
      `INSERT INTO exercises (url, channel_id, description, date)
      VALUES ($1, $2, $3, $4)
      RETURNING url`,
      [url, channel_id, description, date])
    
    return res.send(`Added ${url} to this week's exercises.`)
  } catch (error) {
    throw new ExpressError(error, 400)
  }
})

module.exports = router

const createGoalMarkdown = (goals) => {
  let res = {
    "response_type": "ephemeral",
    "blocks": [
      {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*This week's goals*"
        }
      }        
    ]
  }
  goals.forEach(goal => {
    res.blocks.push(
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*${goal.name}*: _${goal.goal}_`
        }
      },
      {
        "type": "divider"
      }
    )
  })

  return res
}
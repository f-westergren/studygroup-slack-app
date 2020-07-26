const express = require("express");
const ExpressError = require('../expressError');
const db = require("../db");
const router = new express.Router();
const moment = require('moment');
const crypto = require('crypto');

// Users_ids
const users = require('../users')
const signingSecret = require('../secrets')

// router.post("/create", async (req, res) => {
   
// })

router.post("/goal", async (req, res) => {

  const timestamp = req.headers['x-slack-request-timestamp']
  const time = new Date().getTime

  // The request timestamp is more than five minutes from local time.
  // It could be a replay attack, so let's ignore it.
  if (Math.abs(time - timestamp) > 60 * 5) {
    return undefined;
  }

  // Verification
  const sigBaseString = 'v0:' + timestamp + ':' + req.rawBody
  const hmac = 'v0=' + crypto.createHmac('sha256', signingSecret).update(sigBaseString).digest('hex')

  if (hmac === req.headers['x-slack-signature']) {
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
  }

})

router.post("/goals", async (req, res) => {
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
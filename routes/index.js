const express = require("express");
const ExpressError = require('../expressError');
const db = require("../db");
const router = new express.Router();
const moment = require('moment');

// Users_ids
const users = require('../users')

router.post("/", async (req, res) => {
  const { user_id, text } = req.body;
  console.log(req.body)
  const date = new Date();

  try {
    await db.query(
      `INSERT INTO goals (
        name,
        goal,
        date)
      VALUES ($1, $2, $3)`,
      [users[user_id], text, date]
    )

    // Get this week's goals only. 
    const startOfWeek = moment().startOf('week').toDate();
    const result = await db.query(
      `SELECT name, goal FROM goals
      WHERE date >=$1`, [startOfWeek]
    )

    let goals = createGoalMarkdown(result.rows)
    return res.send(goals)

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
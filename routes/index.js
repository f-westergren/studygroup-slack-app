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
  const { user_id, text } = req.body;
  try {
    await db.query(
      `INSERT INTO goals (name, goal, date)
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

router.post("/goals", checkSlackVerification, async (req, res) => {
  try {
    const startOfWeek = moment().startOf('week').toDate();
    const result = await db.query(
      `SELECT name, goal FROM goals
      WHERE date >=$1`, [startOfWeek]
    )
    let goals = createGoalMarkdown(result.rows)
    // goals["response_type"] = "in_channel"

    res.send(goals)
  } catch (error) {
    throw new ExpressError(error, 400)
  }
})

router.post("/problem", checkSlackVerification, async (req, res) => {
  const date = new Date();
  try {
    const { channel_id, text, user_id } = req.body
    
    // Get params from req.body.text and separate url from description.
    const params = text.split(' ')
    const url = params[0]
    params.shift() // Remove url from params.
    let description = params.join(' ')
    
    await db.query(
      `INSERT INTO problems (url, description, added_by, date)
      VALUES ($1, $2, $3, $4)
      RETURNING url`,
      [url, description, users[user_id], date])
    
    return res.send(`Added ${url} to this week's problems.`)
  } catch (error) {
    throw new ExpressError(error, 400)
  }
})

router.post("/problems", checkSlackVerification, async (req, res) => {
  try {
    const startOfWeek = moment().startOf('week').toDate();
    const result = await db.query(
      `SELECT url, description, added_by FROM problems
      WHERE date >=$1`, [startOfWeek]
    )
    let problems = createProblemMarkdown(result.rows)
    // problems["response_type"] = "in_channel"

    res.send(problems)
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

const createProblemMarkdown = (problems) => {
  let res = {
    "response_type": "ephemeral",
    "blocks": [
      {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*This week's problem(s)*"
        }
      }        
    ]
  }
  problems.forEach(problem => {
    res.blocks.push(
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `${problem.url} \n ${problem.description} \n _Added by: ${problem.added_by}_`
			},
			"accessory": {
				"type": "image",
				"image_url": "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1366&q=80",
				"alt_text": "Code image"
			}
		},
    )
  })

  return res
}
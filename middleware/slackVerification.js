const signingSecret = require('../secrets')
const crypto = require('crypto');
const ExpressError = require('../expressError')

// Users_ids
const users = require('../users')

const checkSlackVerification = (req, res, next) => {
  const timestamp = req.headers['x-slack-request-timestamp']
  const time = new Date().getTime

  try {
    // The request timestamp is more than five minutes from local time.
    // It could be a replay attack, so let's ignore it.
    if (Math.abs(time - timestamp) > 60 * 5) {
      throw new ExpressError("Unauthorized", 401)
    }

    // Verification
    const sigBaseString = 'v0:' + timestamp + ':' + req.rawBody
    const hmac = 'v0=' + crypto.createHmac('sha256', signingSecret).update(sigBaseString).digest('hex')

    // If signatures match, and user is allowed access, return next.
    if (hmac === req.headers['x-slack-signature'] && req.body.user_id in users) {
      return next()
    } else {
      throw new ExpressError("Unauthorized", 401)
    }
  } catch (error) {
    return next(error)
  }
}

module.exports = checkSlackVerification;
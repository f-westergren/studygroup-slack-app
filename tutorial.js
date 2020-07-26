const { WebClient } = require('@slack/web-api');

const web = new WebClient(process.env.SLACK_TOKEN)

const currentTime = new Date().toDateString();

(async () => {
  try {
    await web.chat.postMessage({
      channel: '#general',
      text: `Time to meet guys, let's go! https://zoom.us/j/9070196443?pwd=b0orYnNGd0U3RjdySFAxd0Nrb1AzQT09`
    })
  } catch (error) {
    console.log(error)
  }
})();

console.log('Message posted!')


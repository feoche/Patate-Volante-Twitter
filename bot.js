import Twitter from 'twitter'
import minimist from 'minimist'
import LanguageDetect from 'languagedetect'
import http from 'http'
import express from 'express'
import io from 'socket.io'
import {data} from './data.js'

// Retrieve args
const args = minimist(process.argv.slice(2))

let userTweets = []
let recordedTweets = []

let lngDetector = new LanguageDetect();

// create an object using the keys we just determined
let twitterAPI = new Twitter({
  consumer_key: process.env.CONSUMER_TOKEN || args.consumer_key,
  consumer_secret: process.env.CONSUMER_SECRET || args.consumer_secret,
  access_token_key: process.env.ACCESS_TOKEN_KEY || args.access_token_key,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET || args.access_token_secret
})
let port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080
let ipadr = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

console.log(
  `\x1b[96m`, (`[` + new Date().toLocaleTimeString() + `]`).padStart(10),
  `Logged in`)
initStreaming()

function containsRegExp (text, array) {
  let res = [];
  for (let regexp of array) {
    let match = text.match(regexp)
    if (match) {
      res.push(match);
    }
  }
  return res.length && res || false;
}

function pickRand (data) {
  return Math.floor(Math.random() * data)
}

function streamCallback (stream) {
  console.log(
    `\x1b[96m`, (`[` + new Date().toLocaleTimeString() + `]`).padStart(10),
    `streaming`)

  let server = http.createServer(express())
  let socket = io.listen(server)

  socket.on('connection', () => console.log(
    `\x1b[96m`, (`[` + new Date().toLocaleTimeString() + `]`).padStart(10),
    'Launchpad connected'))

  server.listen(port, ipadr)
  console.log(
    `\x1b[96m`, (`[` + new Date().toLocaleTimeString() + `]`).padStart(10),
    port + ':' + ipadr)

  stream.on(`data`, tweet => {
    let sent = false

    if (isAllowedTweet(tweet)) {
      let result = ``
      let userName = tweet.user && tweet.user.screen_name
      let text = tweet.text
      let followers = (tweet.user && tweet.user.followers_count) || 0

      userTweets[userName] = {postedTweets: (userTweets[userName] && userTweets[userName].postedTweets || 0) + 1}
      let probability =
        Math.max(
          data.MINPROBABILITY +
          (followers - data.MINFOLLOWERS) /
          (data.MAXFOLLOWERS - data.MINFOLLOWERS) *
          (data.MAXPROBABILITY - data.MINPROBABILITY),
          data.MAXPROBABILITY)

      probability = Math.min(probability, probability / (userTweets[userName].postedTweets / 2))
      let textLog = tweet.text.replace('\n', '').trim().replace(/(\r\n\t|\n|\r\t)/gm, '').replace(/\shttp.*/g, '').replace(/digital/g, '\x1b[96mdigital\x1b[0m')
      console.info(
        '\x1b[96m', ('[' + new Date().toLocaleTimeString() + ']').padStart(10),
        '\x1b[94m', ('[@' + userName + ']').padStart(20),                                                // User
        '\x1b[91m', ('[' + followers + 'f-' + ((1 / probability) * 100).toFixed(0) + '%]').padStart(15), // Followers + Probability
        '\x1b[0m', textLog.padEnd(125)                                                                   // Title
      );

      if (!pickRand(probability)) {
        for (let item of data.PROHIBITEDWORDS) {
          if (containsRegExp(text, item.queries)) {
            result = item.responses[pickRand(item.responses.length)]
          }
        }

        // Log
        let tweetDone = `@${userName} ${result} \n${data.LINKS[pickRand(data.LINKS.length)]}`
        console.log(`—> `, tweetDone.trim().replace(/(\r\n\t|\n|\r\t)/gm, ''))

        if (!args.test) { // TWEET
          twitterAPI.post('statuses/update', {
              status: tweetDone.substring(0, data.MAXTWEETLIMIT),
              in_reply_to_status_id: tweet.id_str
            },
            (error) => {
              if (error) {
                console.error(
                  `\x1b[96m`, (`[` + new Date().toLocaleTimeString() + `]`).padStart(10),
                  'Error: ', error)
              } else {
                socket.emit('new', {
                  severity: 2,
                  text: tweet.text.replace('\n', '').trim().replace(/(\r\n\t|\n|\r\t)/gm, '').replace(/\shttp.*/g, ''),
                  url: (tweet.entities && tweet.entities.urls && tweet.entities.urls[0] && tweet.entities.urls[0].url) || ''
                })
                sent = true
                // Reset number of tweets
                if (userTweets[userName]) {
                  userTweets[userName].postedTweets = 0
                  userTweets[userName].lastTweet = Date.now()
                }
              }
            }
          )
        }
      }
      if (!sent) {
        socket.emit('new', {
          severity: 1,
          text: tweet.text.replace('\n', '').trim().replace(/(\r\n\t|\n|\r\t)/gm, '').replace(/\shttp.*/g, ''),
          url: (tweet.entities && tweet.entities.urls && tweet.entities.urls[0] && tweet.entities.urls[0].url) || ''
        })
        sent = true
      }
    }
    if (!sent) {
      socket.emit('new', {
        severity: 0,
        text: tweet.text.replace('\n', '').trim().replace(/(\r\n\t|\n|\r\t)/gm, '').replace(/\shttp.*/g, ''),
        url: (tweet.entities && tweet.entities.urls && tweet.entities.urls[0] && tweet.entities.urls[0].url) || ''
      })
    }
  })
  // if something happens, call the onStreamError function
  stream.on(`end`, onStreamError)
  stream.on(`error`, onStreamError)
}

function onStreamError (err) {
  console.error(
    `\x1b[96m`, (`[` + new Date().toLocaleTimeString() + `]`).padStart(10),
    `Error (${err}) - Reloading...`)
  setTimeout(initStreaming, 10000)
}

function initStreaming () {
  // initialize the stream and everything else
  twitterAPI.stream(
    `statuses/filter`,
    {
      track: data.SEARCHWORDS.join(`,`),
      language: `fr`
    },
    streamCallback
  )
}

function isAllowedTweet (tweet) {
  return tweet.text &&                                                                                                                             // Tweet contains text
    tweet.lang === `fr` &&                                                                                                                         // Tweet is in french
    lngDetector.detect(tweet.text) && lngDetector.detect(tweet.text)[0] && lngDetector.detect(tweet.text)[0][0] === 'french' &&                    // Tweet is in french for sure
    containsRegExp(tweet.text, data.PROHIBITEDWORDS[0].queries) &&                                                                                 // Tweet contains `prohibited` words
    !containsRegExp(tweet.text, data.EXCEPTIONS) &&                                                                                                // Tweet doesn`t contain any of the excluded terms
    !containsRegExp(tweet.text, [/RT\s\@/]) &&                                                                                                     // Tweet is not a Retweet
    !recordedTweets.includes(tweet.text) &&                                                                                                        // Tweet has not been already answered
    tweet.retweeted_status === undefined                                                                                                           // If bot has not already tweeted this
}

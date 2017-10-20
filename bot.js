/* outa[bot] // app.js
	Copyright (c) 2012-2013 outa[dev].

   Modified by feoche (with YoruNoHikage agreement)
*/

(function () {

  var config = require('config.json');

  //the twitter api module
  var ntwitter = require('ntwitter'),

    //the username of the bot. not set to begin with, we'll get it when authenticating
    botUsername = null,
    hasNotifiedTL = false,

    //create an object using the keys we just determined
    twitterAPI = new ntwitter({
      "consumer_key": config.CONSUMER_TOKEN,
      "consumer_secret": config.CONSUMER_SECRET,
      "access_token_key": config.ACCESS_TOKEN_KEY,
      "access_token_secret": config.ACCESS_TOKEN_SECRET
    });

  //check if we have the rights to do anything
  twitterAPI.verifyCredentials(function (error, userdata) {
    if (error) {
      //if we don't, we'd better stop here anyway
      console.log(error);
      process.exit(1);
    } else {
      //the credentials check returns the username, so we can store it here
      botUsername = userdata.screen_name;
      console.log("logged in as [" + userdata.screen_name + "]");
      initStreaming();
    }
  });

  function contains(text, array) {
    return array.indexOf(text) > -1;
  }

  function containsRegExp(text, array) {
    return array.some(function (rx) {
      rx = new RegExp(rx.replace(/\\(?![sw])/g, ""));
      return rx.test(text)
    });
  }

  function streamCallback(stream) {
    console.log("streaming");

    stream.on('data', function (data) {
      // If text exists & only french tweets
      if (data.text && data.lang === 'fr') {
        var result = '',
          text = data.text;

        // If tweet contains any 'digital' subject
        if (containsRegExp(text, config.PROHIBITEDWORDS[0].queries)) {

          //a few checks to see if we should reply
          if (data.user.screen_name.toLowerCase() !== botUsername.toLowerCase() &&
            // if it wasn't sent by the bot itself
            data.retweeted_status === undefined) {

            var followers = (data.user && data.user.followers_count) || 0,
              minfollowers = 100,
              maxfollowers = 200000,
              minprobability = 30, // 1/30 chance
              maxprobability = 1, // 1/1 chance
              probability = minprobability + ((followers - minfollowers) / (maxfollowers - minfollowers) * (maxprobability - minprobability));

            probability = followers < minfollowers ? minprobability * 2 : followers > maxfollowers ? maxprobability : probability;

            var random = Math.floor(Math.random() * probability);

            console.log((data.user && '@' + data.user.name) + ' (' + followers + ' follows)');

            if (!random ||
              data.user && contains(data.user.name, config.PRIORITY_ACCOUNTS)) {

              // If tweet doesn't contain any of the excluded terms
              if (!containsRegExp(text, config.EXCEPTIONS)) {

                for (var i = 0; i < config.PROHIBITEDWORDS.length; i++) {
                  var item = config.PROHIBITEDWORDS[i];
                  if (containsRegExp(text, item.queries)) {
                    result = item.responses[Math.floor(Math.random() * item.responses.length)];
                  }
                }

                // TWEET
                console.log('text:', data.text);
                var tweetDone = '@' + data.user.screen_name + " " + result + ' \n' + config.EMOJIS[Math.floor(Math.random() * config.EMOJIS.length)] + ' http://www.academie-francaise.fr/digital ' + config.EMOJIS[Math.floor(Math.random() * config.EMOJIS.length)];
                setTimeout(function () {
                  //reply to the tweet that mentionned us
                  twitterAPI.updateStatus(tweetDone.substring(0, 139), {in_reply_to_status_id: data.id_str},
                    function (error, statusData) {
                      //when we got a response from twitter, check for an error (which can occur pretty frequently)
                      if (error) {
                        console.log(error);
                        if (error.statusCode === 403 && !hasNotifiedTL) {
                          //if we're in tweet limit, we will want to indicate that in the name of the bot
                          //so, if we aren't sure we notified the users yet, get the current twitter profile of the bot
                          twitterAPI.showUser(botUsername, function (error, data) {
                            if (!error) {
                              if (data[0].name.match(/(\[TL\]) (.*)/)) {
                                //if we already changed the name but couldn't remember it (maybe it was during the previous session)
                                hasNotifiedTL = true;
                              } else {
                                //if the name of the bot hasn't already been changed, do it: we add "[TL]" just before its normal name
                                twitterAPI.updateProfile({name: '[TL] ' + data[0].name}, function (error) {
                                  if (error) {
                                    console.log("error while trying to change username (going IN TL)");
                                  } else {
                                    console.log("gone IN tweet limit");
                                  }
                                });
                              }
                            }
                          });
                        }
                      } else {
                        //check if there's "[TL]" in the name of the but
                        //if we just got out of tweet limit, we need to update the bot's name
                        if (statusData.user.name.match(/(\[TL\]) (.*)/) !== null) {
                          //DO EET
                          twitterAPI.updateProfile({name: tweetLimitCheck[2]}, function (error) {
                            if (error) {
                              console.log("error while trying to change username (going OUT of TL)");
                            } else {
                              hasNotifiedTL = true;
                              console.log("gone OUT of tweet limit");
                            }
                          });
                        }
                      }
                    }
                  );
                }, 30000);
              }
            }
          }
        }
      }
    });
    //if something happens, call the onStreamError function
    stream.on('end', onStreamError);
    stream.on('error', onStreamError);
    //automatically disconnect every 30 minutes (more or less) to reset the stream
    setTimeout(stream.destroy, 1000 * 60 * 30);
  }

  function onStreamError(e) {
    //when the stream is disconnected, connect again
    console.log("Streaming ended (" + e.code || "unknown" + ")");
    setTimeout(initStreaming, 5000);
  }

  function initStreaming() {
    //initialize the stream and everything else
    twitterAPI.stream('statuses/filter', {track: config.SEARCHWORDS.join(',')}, streamCallback);
  }

})();
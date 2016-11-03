module.exports = function(app) {
    //set global variables
    var maxAPICalls = 50;
    var sucessfullCalls = 40;
    var cap = 2;

    //imports
    var AlchemyLanguageV1 = require('watson-developer-cloud/alchemy-language/v1');
    var fs = require("fs");

    //watson api api key
    var alchemy_language = new AlchemyLanguageV1({api_key: ''});

    //read file
    var contents = fs.readFileSync("app/modules/url.json");
    var jsonContent = JSON.parse(contents);
    var arrayLabel = [];
    var count = 0;
    //parse for urls
    var interval = 300;
    for (var i = 0; i < maxAPICalls; i++) {
        setTimeout(function(i) {
            var query = jsonContent.event[i].query.query_text;
            var testurl = 'https://www.google.com/search?btnI=I&q=' + query;

            var params = {
                url: testurl
            };

            alchemy_language.taxonomy(params, function(err, response) {

                if (err) {
                    console.log(err);
                } else {

                    var category = response.taxonomy[0].label.toString();
                    //console.log(category);
                    arrayLabel.push(category);
                    count++;
                    if (count == sucessfullCalls) {
                        printArray();
                    }

                }
            });
        }, interval * i, i);
    };

    //grab all topics that occur more than "cap" number of times
    var findHighest = function(topics, cap) {

        if (topics.length === 0)
            return null;
        var modeMap = {};
        var maxEl = topics[0],
            maxCount = 1;
        for (var i = 0; i < topics.length; i++) {
            {
                var el = topics[i];
                if (modeMap[el] === null)
                    modeMap[el] = 1;
                else
                    modeMap[el]++;
                }
            }

        var highFreq = new Set();

        //add valid elements to set and then return
        for (var i = 0; i < topics.length; i++) {
            var el = topics[i];
            if (modeMap[el] >= cap) {
                highFreq.add(el);
            }
        }
        return highFreq;

    }

    var printArray = function() {
        var topics = new Array();
        //console.log(arrayLabel);
        for (var i = 0; i < arrayLabel.length; i++) {

            var tempArray = arrayLabel[i].split(/[ ,/]+/);
            for (var j = 0; j < tempArray.length; j++) {
                if (tempArray[j].trim() != 'and' && tempArray[j] != ' ' && tempArray[j] !== '') {
                    topics.push(tempArray[j].trim());
                }
            }
        }

        var max = findHighest(topics, cap);
        //console.log(max);
        var finalString = Array.from(max);

        //console.log(finalString.join(", "));
        publishData(finalString.join(", "));
    };

    //send data back to app
    function publishData(finalString) {
        console.log('search data published');
        app.get('/searchData', function(req, res) {
            var data = {
                topicList: finalString
            };
            res.send(JSON.stringify(data));
        });
    }

};

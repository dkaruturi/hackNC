var watson = require('watson-developer-cloud/personality-insights/v3');
var personality_insights = new watson({username: '', password: '', version_date: '2016-10-20'});

module.exports = function(app) {
    var fs = require('fs');
    var contents = fs.readFileSync("app/modules/messages.json");
    var jsonContent = JSON.parse(contents);
    var numThreads = jsonContent.threads.length;
    var rawDataArray = [];
    var needs = [];
    var personality_traits = [];
    var values = [];
    var consumption_preferences = [];
    var personality_traits_str = '';
    var needs_str = '';
    var values_str = '';
    var buffer = '';

    var results;

    for (var i = 0; i < numThreads; i++) {
        var numMessages = jsonContent.threads[i].messages.length;
        for (var j = 0; j < numMessages; j++) {
            if (jsonContent.threads[i].messages[j].sender.localeCompare("Name") === 0) {

                rawDataArray.push(jsonContent.threads[i].messages[j].text);
            }
            if (jsonContent.threads[i].messages[j].sender.localeCompare("Name 2") === 0) {
                rawDataArray.push(jsonContent.threads[i].messages[j].text);
            }
            if (jsonContent.threads[i].messages[j].sender.localeCompare("user_id@facebook.com") === 0) {
                rawDataArray.push(jsonContent.threads[i].messages[j].text);
            }
        }
    }

    for (var i = 0; i < rawDataArray.length; i++) {
        buffer = buffer.concat(' ');
        buffer = buffer.concat(rawDataArray[i]);
    }

    results = personality_insights.profile({
        text: buffer,
        consumption_preferences: true
    }, function(error, response) {
        if (error)
            console.log('error:', error);
        else
            parseData(response);
        }
    );

    function parseData(response) {
        for (var i = 0; i < 5; i++) {
            var temp = [];
            for (var j = 0; j < 6; j++) {
                temp.push(response.personality[i].children[j].percentile);
            }
            var max = Math.max.apply(null, temp);
            var maxIndex;
            for (var j = 0; j < 6; j++) {
                if ((response.personality[i].children[j].percentile) == max) {
                    maxIndex = j;
                    break;
                }
            }
            personality_traits.push(response.personality[i].children[maxIndex].name);
        }
        for (var i = 0; i < 12; i++) {
            if (response.needs[i].percentile >= 0.3) {
                needs.push(response.needs[i].name);
            }
        }
        for (var i = 0; i < 5; i++) {
            if (response.values[i].percentile >= 0.3) {
                values.push(response.values[i].name);
            }
        }
        for (var i = 0; i < 8; i++) {
            var numPref = response.consumption_preferences[i].consumption_preferences.length;
            for (var j = 0; j < numPref; j++) {
                if (response.consumption_preferences[i].consumption_preferences[j].score > 0.5) {
                    consumption_preferences.push(response.consumption_preferences[i].consumption_preferences[j].name);
                }
            }
        }

        for (var k = 0; k < personality_traits.length; k++) {
            if (k == personality_traits.length - 1) {
                personality_traits_str += personality_traits[k];
            } else {
                personality_traits_str += personality_traits[k] + ', ';
            }
        }

        for (var l = 0; l < needs.length; l++) {
            if (l == needs.length - 1) {
                needs_str += needs[l];
            } else {
                needs_str += needs[l] + ', ';
            }
        }

        for (var m = 0; m < values.length; m++) {
            if (m == values.length - 1) {
                values_str += values[m];
            } else {
                values_str += values[m] + ', ';
            }
        }

        publishData();
    }

    function publishData() {
        console.log('Personality data published');
        app.get('/personalityData', function(req, res) {
            var data = {
                personality_traits: personality_traits_str,
                needs: needs_str,
                values: values_str,
                consumption_preferences: consumption_preferences
            };
            res.send(JSON.stringify(data));
        });
    }
};

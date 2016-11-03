var request = require('request');
var fs = require('fs');
var async = require('async');

module.exports = function(app) {
    var api_url_one = 'https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify?api_key=KEY&version=2016-05-20';
    var api_url_two = 'https://gateway-a.watsonplatform.net/visual-recognition/api/v3/detect_faces?api_key=KEY&version=2016-05-20';
    var classes_arr = [];
    var faces_arr = [];
    var top_words = [];
    var min_count = 0;
    var min_age = 0;
    var max_count = 0;
    var max_age = 0;
    var female_count = 0;
    var male_count = 0;
    var gender = '';
    var age = 0;
    var keyword_string = '';

    var file_count = 1;
    var num_files = 100;
    fs.readdir('app/modules/other_photos', function(err, files) {
        if (err) {
            console.log(err);
        }

        files.forEach(function(file, index) {
            fs.createReadStream('app/modules/other_photos/' + file).pipe(request.post(api_url_one, function(err, response, body) {
                if (err) {
                    console.log(err);
                }
                body = JSON.parse(body);
                if (body.images && body.images[0].classifiers && body.images[0].classifiers[0].classes) {
                    for (var i = 0; i < body.images[0].classifiers[0].classes.length; i++) {
                        classes_arr.push(body.images[0].classifiers[0].classes[i].class);
                    }
                }
                file_count++;
                if (file_count == num_files) {
                    stepTwo();
                }
            }));
        });
    });

    function stepTwo() {
        for (var i = 0; i < 25; i++) {
            var curr_word = mode(classes_arr);
            if (curr_word !== null) {
                if (curr_word != 'people' && curr_word != 'person') {
                    top_words.push(curr_word);
                }
                var repeat = true;
                while (repeat === true) {
                    repeat = false;
                    for (var j = 0; j < classes_arr.length; j++) {
                        if (classes_arr[j] == curr_word) {
                            classes_arr.splice(j, 1);
                            repeat = true;
                        }
                    }
                }
            } else {
                break;
            }
        }
        stepThree();
    }

    function stepThree() {
        for (var i = 0; i < top_words.length; i++) {
            if (i == top_words.length - 1) {
                keyword_string += ' ' + top_words[i];
            } else {
                keyword_string += ' ' + top_words[i] + ', ';
            }
            //console.log(top_words[i]);
        }
        stepFour();
    }

    function stepFour() {
        var file_count = 1;
        var num_files = 5;
        fs.readdir('app/modules/profile_photos', function(err, files) {
            if (err) {
                console.log(err);
            }

            files.forEach(function(file, index) {
                fs.createReadStream('app/modules/profile_photos/' + file).pipe(request.post(api_url_two, function(err, response, body) {
                    if (err) {
                        console.log('error:' + err);
                    }
                    body = JSON.parse(body);
                    if (body.images && body.images[0].faces) {

                        if (body.images[0].faces[0].gender.gender == 'MALE') {
                            male_count++;
                        } else if (body.images[0].faces[0].gender.gender == 'FEMALE') {
                            female_count++;
                        }

                        if (body.images[0].faces[0].age.max) {
                            max_age += body.images[0].faces[0].age.max;
                            max_count++;
                        }

                        if (body.images[0].faces[0].age.min) {
                            min_age += body.images[0].faces[0].age.min;
                            min_count++;
                        }
                    }

                    file_count++;
                    if (file_count == num_files) {
                        stepFive();
                    }

                }));
            });
        });
    }

    function stepFive() {
        if (male_count > female_count) {
            gender = 'Male';
        } else if (female_count > male_count) {
            gender = 'Female';
        }
        console.log('Gender: ' + gender);

        var max_age_avg = Math.floor(max_age / max_count);
        var min_age_avg = Math.floor(min_age / min_count);
        var avg_age = Math.floor((max_age_avg + min_age_avg) / 2);
        console.log('Age Range: ' + min_age_avg + '-' + max_age_avg);
        console.log('Best Guess: ' + avg_age);
        publishData(max_age_avg, min_age_avg, avg_age);
    }

    function publishData(max_age_avg, min_age_avg, avg_age) {
        console.log('Visual data published');
        app.get('/visualData', function(req, res) {
            var data = {
                gender: gender,
                age: avg_age,
                age_range: min_age_avg + '-' + max_age_avg,
                keywords: keyword_string
            };
            res.send(JSON.stringify(data));
        });
    }

    function mode(array) {
        if (array.length === 0) {
            return null;
        }
        var modeMap = {};
        var maxEl = array[0],
            maxCount = 1;
        for (var i = 0; i < array.length; i++) {
            var el = array[i];
            if (modeMap[el] === null) {
                modeMap[el] = 1;
            } else {
                modeMap[el]++;
            }
            if (modeMap[el] > maxCount) {
                maxEl = el;
                maxCount = modeMap[el];
            }
        }
        return maxEl;
    }

};

#HackNC 2016

###Inspiration
We recently found out that you could download an archive of all your data on both Facebook and Google. While there was a lot of structured data in these archives, we wanted to figure out what we could learn about ourselves using only the unstructured data sets. Additionally, we wanted to look at how this analysis of unstructured data could be used in terms of marketing & advertising.

###What it does
Our app scrapes data from an individual's Facebook and Google data archives, using only unstructured data (search history, photos, messages, etc.) in order to create a structured profile that can be used for targeted marketing/advertising.

###How we built it
We built the app as a Node.js app using Watson APIs for our machine-learning analysis. We then got a domain name (aboutmewithme.com) to present our project, although the DNS is still propagating at the moment.

###Challenges we ran into
We had many issues with rate-limiting in the IBM Watson APIs that made it very difficult to test our app before production. This meant we had to make sure our app would work prior to actually using it, as we only had a few chances to successfully deploy it.

###Accomplishments that we're proud of
We are incredibly happy with the amount of data we were able to collect and format within just a few hours of work.

###What we learned
We learned a great deal about fast development as it was two of our team member's first hackathon, ever. Additionally, this provided insight into what the future of AI and marketing could look like. It was a fantastic opportunity for us to both develop our Node/JavaScript skills as well as learn more about machine-learning.

###What's next for About Me Without Me
We want to take this app a step further and look at additional unstructured data sets to see what other information we can find. Additionally, we'd like to run this program without the standard Watson API rate-limiting so that we can increase the accuracy of the analysis by running through larger sets of data.

https://devpost.com/software/about-me-without-me

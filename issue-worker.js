var fs = require('fs');
require.extensions['.graphql'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
var queryIssueData = require("./fetchRepoIssues.graphql");

const { createApolloFetch } = require('apollo-fetch');
const random = require('random')

const apiURI = 'https://api.github.com/graphql';

async function fetchIssue(name, owner, issuesCount, issueNumber) {
    return new Promise((resolve, reject) => {
        const fetch = createApolloFetch({
            uri: apiURI,
        });
        fetch.use(({ options }, next) => {
            if (!options.headers) {
                options.headers = {};  // Create the headers object if needed.
            }
            options.headers['Authorization'] = 'bearer ' + process.env.GH_OAUTH;
            next();
        });

        fetch({
            query: queryIssueData,
            variables: {
                name: name,
                owner: owner,
                issue: issueNumber
            },
        }).then(res => {
            if (!res.errors) {
                resolve(res.data)
            } else {
                console.log(owner + '/' + name + ' ' + res.errors[0].type + ': ' + issueNumber)
                resolve(fetchIssue(name, owner, issuesCount, random.int(min = 1, issuesCount)))
                //resolve(res.data)
            }
        }).catch(err => {
            console.log(err)
            reject(err)
        });
    });
}

process.on('message', msg => {
    const dis = msg.split('/');
    const owner = dis[0];
    const name = dis[1];
    const issuesCount = parseInt(dis[2]);

    var randIssues = []
    var issues = []

    for (i = 0; i < 50; i++) {
        randIssues.push(random.int(min = 1, max = issuesCount))
    }

    async function fetchIssues() {
        const promises = randIssues.map(async (issueNumber) =>
            await fetchIssue(name, owner, issuesCount, issueNumber).then(repoData => {
                issues.push(repoData)
            })
        );

        await Promise.all(promises);

        fs.writeFileSync(`data/${owner}_${name}.json`,
            JSON.stringify(issues),
            'utf8', function (err) {
                if (err) {
                    process.send(false)
                }
                process.send(true)
            });
        process.send(true)
        process.exit(0);
    }

    fetchIssues()
});



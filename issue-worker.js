var fs = require('fs');
require.extensions['.graphql'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
var queryIssueData = require("./fetchRepoIssues.graphql");

const { createApolloFetch } = require('apollo-fetch');

const apiURI = 'https://api.github.com/graphql';

async function fetchIssues(name, owner) {
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
                owner: owner
            },
        }).then(res => {
            if (!res.errors) {
                resolve(res.data)
            } else {
                reject(res.errors)
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

    fetchIssues(name, owner).then(repoData => {
        fs.writeFileSync(`data/${owner}_${name}.json`,
            JSON.stringify(repoData.repository.issues.nodes),
            'utf8', function (err) {
                if (err) {
                    process.send(false)
                }
                process.send(true)
            });
        process.send(true)
    }).catch(error => {
        process.send(error[0].message);
    }).finally(() => {
        process.exit(0);
    });
});



const { createApolloFetch } = require('apollo-fetch');

async function getIssues(owner, name) {
    return new Promise((resolve, reject) => {
        console.log(`https://github.com/${owner}/${name}.git`)
        const fetch = createApolloFetch({
            uri: 'https://api.github.com/graphql',
        });

        fetch.use(({ options }, next) => {
            if (!options.headers) {
                options.headers = {};  // Create the headers object if needed.
            }
            options.headers['Authorization'] = 'bearer ' + process.env.GH_OAUTH;

            next();
        });
        fetch({
            query: `query getRepoIssueNumber($name: String!, $owner: String!) {
                repository(name: $name, owner: $owner) {
                    issues {
                        totalCount
                    }
                }
            }`,
            variables: {
                name: name,
                owner: owner
            },
        }).then(res => {
            console.log(res.data.repository);
            resolve(true)
        }).catch(err => {
            reject(err)
        });
    });
}

process.on('message', msg => {
    const dis = msg.split('/');
    const owner = dis[0];
    const name = dis[1];

    getIssues(owner, name).then(bool => {
        process.send(bool);
    }).catch(error => {
        process.send(error.message);
    }).finally(() => {
        process.exit(0);
    });
});

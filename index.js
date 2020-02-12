(async function () {
    const { log } = console;
    const path = require('path');
    const chalk = require('chalk');
    const { fork } = require('child_process');
    const repositories = require(path.join(__dirname, 'repositories.json'));
    require('dotenv').config()
    log(repositories)

    function errorAndDie(err) {
        log(chalk.red.bold(`[!] Fatal error: ${err.message || err}`));
        process.exit(1);
    }

    process.on('uncaughtException', errorAndDie);
    process.on('unhandledRejection', errorAndDie);

    Object.keys(repositories).forEach(key => {
        const worker = fork(path.join(__dirname, 'issue-worker.js'));
        worker.on('message', response => {
            if (typeof response === 'boolean') {
                if (response) {
                    log(chalk.bold(`Repo scraping for ${repositories[key].owner}/${repositories[key].name}: `) 
                        + chalk.bold.green('Success'));
                } else {
                    log(chalk.bold(`Repo scraping for ${repositories[key].owner}/${repositories[key].name}: `) 
                        + chalk.bold.orange('Unsaved'));
                }
            } else {
                log(chalk.bold(`Repo scraping for ${repositories[key].owner}/${repositories[key].name}: `) 
                    + chalk.bold.red('Failed')) + chalk.bold(`: ${response}`);
            }
        });
        worker.send(repositories[key].owner + '/' + repositories[key].name);
    });
})();
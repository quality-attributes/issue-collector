(async function () {    
    const path = require('path');
    const chalk = require('chalk');
	const {fork} = require('child_process');
    const repositories = require(path.join(__dirname, 'repositories.json'));
    require('dotenv').config()
    console.log(repositories)

    function errorAndDie(err) {
		console.log(chalk.red.bold(`[!] Fatal error: ${err.message || err}`));
		process.exit(1);
	}

	process.on('uncaughtException', errorAndDie);
	process.on('unhandledRejection', errorAndDie);

    Object.keys(repositories).forEach(key => {
        const worker = fork(path.join(__dirname, 'issue-worker.js'));
        worker.on('message', r => {
            if (typeof r === 'boolean') {
                if (r) {
                    console.log('Todo good')
                } else {
                    console.log('Ni tan good')
                }
            } else {
                console.log('Nada good')
            }
        });
        worker.send(repositories[key].owner + '/' + repositories[key].name);
    });
})();
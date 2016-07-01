var {spawn, exec} = require('child_process');
var gulp = require('gulp-help')(require('gulp'));
var all = require('gulp-all');
var sftp = require('gulp-sftp');
var _ = require('lodash/collection');
var defaults = require('./certbot.defaults.json');
var runSequence = require('run-sequence');


var ssl_args_config = {
	c: {
		alias: 'conf',
		string: true,
		default: defaults.conf,
		description: 'FilePath to use as config file for certbot-auto command.'
	},
	t: {
		alias: 'test',
		boolean: true,
		default: false,
		description: 'Uses the Let\'s encrypt test server, basically is to test if env is configured.'
	},
	m: {
		alias: 'mail',
		string: true,
		requiresArg: true,
		default: defaults.contact_email,
		description: 'Email used for registration and recovery contact'
	},
	d: {
		alias: 'domain',
		array: true,
		requiresArg: true,
		default: defaults.domains,
		description: 'One or multiple domains to include in the ssl certificate request'
	}
};


var argv = require('yargs')
	.usage('Usage: $0 [command] [options]')
	.example(
		'$0 get-ssl-cert -t -m jhon.doe@example.com -d www.example.com',
		'Get a test certificate for domain www.example.com and registration and recovery uses jhon.doe@example.com'
	)
	.command('get-ssl-cert', 'Obtain a certificate from Let\'s encrypt', (yargs) => {
		return yargs
			.usage('Usage: $0 get-ssl-cert [options]')
			.example('gulp get-ssl-cert -t -m jhon.doe@example.com -d www.example.com',
				'Get a test certificate for domain www.example.com and registration and recovery uses jhon.doe@example.com'
			)
			.options(ssl_args_config)
	})
	.command('update-ssl-cert', 'Run get-ssl-cert and paste-ssl-remote', (yargs) => {
		return yargs
			.usage('Usage: $0 update-ssl-cert [options]')
			.example('gulp get-ssl-cert -t -m jhon.doe@example.com -d www.example.com',
				'Get a test certificate for domain www.example.com and registration and recovery uses jhon.doe@example.com'
			)
			.options(ssl_args_config)
	})
	.help('h')
	.alias('h', 'help')
	.wrap()
	.epilog('copyright 2016')


function simpleProcess(command, args, exit_message) {
	return new Promise((resolve, reject) => {
		var spawned = spawn(command, args, {
			stdio: 'inherit'
		})
		spawned.on('close', (code) => {
			console.log(`${command} exited with code ${code}`)
			code === 0 ? resolve(code) : reject(code)
		})
	})
}


var ssl_task_help = {
		c: 'Alias for --conf',
		conf: 'FilePath to use as config file for certbot-auto command.',
		t: 'Alias for --test',
		test: 'Uses the Let\'s encrypt test server, basically is to test if env is configured.',
		'm email@example.com': 'Alias for --mail',
		'mail email@example.com': 'Email used for registration and recovery contact.',
		'd www.domain-example.com': 'Alias for --domain',
		'domain www.domain-example.com': 'One or multiple domains to include in the ssl certificate request.'
	}


gulp.task('install', 'Installs the cerbot-auto deps.', () => {
	return simpleProcess('wget', ['-N', 'https://dl.eff.org/certbot-auto'], 'Certbot download')
	.then((success) => {
		return simpleProcess('chmod', ['a+x', 'certbot-auto'], 'Permission certbot')
	})
	.catch((err) => {
		console.log('Error: ', err)
	})
}, {
	aliases: ['i']
})


gulp.task('get-ssl-cert', 'Obtain a certificate from Let\'s encrypt.', () => {
	var args = argv.parse(process.argv)

	var domains = _.flatMap(args.d, (domain) => {
		return ['-d', domain]
	})

	var opts = [
		'certonly',
		'-n',
		'-c', args.c,
		'-m', args.m,
		...domains
	]

	if (args.t) opts.push('--staging')
	return simpleProcess('./certbot-auto', opts, 'SSL certificate')
}, { options: ssl_task_help })


gulp.task('paste-ssl-remote', 'Copy your certificates from current directory to all servers you need with sftp.', () => {
	return all(
		_.flatMap(defaults.servers, (server) => {
			return _.map(defaults.paths[server.remotePaths], (path) => {
				return gulp.src('*.pem')
					.pipe(sftp({
						host: server.host,
						auth: server.auth,
						remotePath: path
					}))
			})
		})
	);
});


gulp.task(
	'update-ssl-cert',
	'Update the current available certs and copy them to all certified servers.',
	(cb) => {
		runSequence('get-ssl-cert', 'paste-ssl-remote', cb)
	},
	{ options: ssl_task_help }
)


gulp.task('default',['help'])

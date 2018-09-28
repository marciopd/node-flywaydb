var env = process.env;

module.exports = {
	url: `jdbc:postgresql://${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`,
	schemas: 'public',
	locations: 'filesystem:sql/migrations',
	user: env.PGUSER,
	password: env.PGPASSWORD,
    sqlMigrationSuffix: '.pgsql',
    version: '4.0.3', // optional, empty or missing will download the latest
    JAVA_OPTS: [ // optional, use this if you are needing to configure a mavinPlugin
        '-Djava.util.logging.config.file=./conf/logging.properties',
    ],
    mavinPlugins: [{ // optional, use to add any plugins (ie. logging)
        groupId: 'org.slf4j',
        artifactId: 'slf4j-api',
        version: '1.7.25'
    }, {
        groupId: 'org.slf4j',
        artifactId: 'slf4j-jdk14',
        version: '1.7.25'
    }]
};

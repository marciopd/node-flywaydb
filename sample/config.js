module.exports = {
    flywayArgs: {
        url: 'jdbc:postgresql://localhost/postgres',
        schemas: 'public',
        locations: 'filesystem:sample/sql',
        user: 'postgres',
        password: 'example',
        sqlMigrationSuffix: '.pgsql',
    },
    // Use to configure environment variables used by flyway
    env: {
        JAVA_ARGS: '-Djava.util.logging.config.file=./conf/logging.properties',
    },
    version: '4.0.3', // optional, empty or missing will download the latest
    mavinPlugins: [{ // optional, use to add any plugins (ie. logging)
        groupId: 'org.slf4j',
        artifactId: 'slf4j-api',
        version: '1.7.25',
        // This can be a specifc url to download that may be different then the auto generated url.
        downloadUrl: 'https://repo1.maven.org/maven2/org/slf4j/slf4j-api/1.7.25/slf4j-api-1.7.25.jar',
    }, {
        groupId: 'org.slf4j',
        artifactId: 'slf4j-jdk14',
        version: '1.7.25'
    }],
    downloads: {
        expirationTimeInMs: -1,
    }
};

const path = require('path');
const fs = require('fs');
const os = require('os');
const request = require('request');

const ONE_DAY_MS = 8.64e+7;

function getCacheDir() {
    var tmpDirs = [
            process.env.npm_config_tmp,
            os.tmpdir(),
            path.join(process.cwd(), 'tmp')
        ],
        writeAbleTmpDir = tmpDirs.find(function(dir) {
            if(dir) {
                try {
                    dir = path.resolve(dir, 'node-flywaydb');

                    if(!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, '0777');
                        fs.chmodSync(dir, '0777');
                    }

                    var tmpFile = path.join(dir, Date.now() + '.tmp');
                    fs.writeFileSync(tmpFile, 'test');
                    fs.unlinkSync(tmpFile);

                    return true;
                } catch(e) {
                    console.log(dir, 'is not writable:', e);
                }
            }

            return false;
        });

    if(writeAbleTmpDir) {
        return path.resolve(writeAbleTmpDir, 'node-flywaydb');
    } else {
        console.error('Can not find a writable tmp directory.');
        process.exit(1);
    }
}

function downloadOptions(url) {
    const env = process.env;

    return {
        uri: url,
        encoding: null, // Get response as a buffer
        followRedirect: true,
        headers: {
            'User-Agent': env.npm_config_user_agent
        },
        strictSSL: true,
        proxy: (
            env.npm_config_https_proxy ||
            env.npm_config_proxy ||
            env.npm_config_http_proxy ||
            env.HTTPS_PROXY ||
            env.https_proxy ||
            env.HTTP_PROXY ||
            env.http_proxy
        )
    };
}

function saveUrlToPath(url, destinationPath) {
    return new Promise(function(resolve, reject) {
        downloadOptions(downloadOptions(url))
            .on('response', function(response) {
                if(response.statusCode !== 200) {
                    reject(new Error('request failed: ' + response.statusCode));
                }
            })
            .on('error', reject)
            .pipe(fs.createWriteStream(destinationPath))
            .on('end', function() {
                resolve(destinationPath);
            });
    });
}

function resolveMavenVersion(tmpDir, groupId, artifactId, version) {
    if(version) {
        return Promise.resolve(version);
    } else {
        const latestCacheFile = path.resolve(__dirname, '../jlib', `${groupId}_${artifactId}.latest`);
        const stats = fs.statSync(latestCacheFile);

        if(stats && Date.now() - stats.mtimeMs < ONE_DAY_MS) {
            return Promise.resolve(fs.readSync(latestCacheFile));
        } else {
            return saveUrlToPath(`https://repo1.maven.org/maven2/${groupId.replace(/\./g, '/')}/${artifactId}/maven-metadata.xml`, latestCacheFile);
            return new Promise(function(resolve, reject) {
                request(downloadOptions, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        fs.writeFileSync(currentSource.filename, body);

                        console.log('\nReceived ' + filesize(body.length) + ' total.');

                        resolve(currentSource.filename);
                    } else if (response) {
                        console.error(`
            Error requesting archive.
            Status: ${response.statusCode}
            Request options: ${JSON.stringify(downloadOptions, null, 2)}
            Response headers: ${JSON.stringify(response.headers, null, 2)}
            Make sure your network and proxy settings are correct.

            If you continue to have issues, please report this full log at https://github.com/markgardner/node-flywaydb`);
                        process.exit(1);
                    } else {
                        console.error('Error downloading archive: ', error);
                        process.exit(1);
                    }
                });
            })
        }
    }
    // if the cached latest version is less than 1 day.
    //   return cached
    // else
    //   download and cache
}

function downloadMaven(tmpDir, groupId, artifactId, version) {
    return resolveMavenVersion(tmpDir, groupId, artifactId, version)
        .then(function(version) {

        });
}

module.exports = {
    ensureArtifacts: function(config, callback) {
        var tmpDir = getCacheDir();
        var pendingDownloads = [downloadMaven(tmpDir, 'org.flywaydb', 'flyway-commandline', config.version)]

        if(config.mavinPlugins) {
            pendingDownloads = pendingDownloads.concat(config.mavinPlugins.map(function(plugin) {
                return downloadMaven(tmpDir, plugin.groupId, plugin.artifactId, plugin.version);
            }));
        }

        Promise.all(pendingDownloads)
            .then(function(resolvers) {
                callback(null, resolvers[0]);
            })
            .catch(callback);
    }
}

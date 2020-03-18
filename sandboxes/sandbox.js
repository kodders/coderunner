const languages = require("../languages.json")
const execa = require("execa")
const fs = require("fs");
const path = require("path");

module.exports = {
    send(input) {
        var time = +new Date();
        if (this.prepare(input.language)) {
            console.log("Prepared in " + ((+new Date() - time) / 1000) + " seconds")
            time = +new Date();
            var result = this.execute(input.language, input.code)
            console.log("Executed in " + ((+new Date() - time) / 1000) + " seconds")
            return result
        }
        return null;
    },
    prepare(key) {
        var result = false;
        const languagePath = `${__dirname}/${key}`;
        if (this.exists(languagePath) && this.exists(`${languagePath}/Dockerfile`)) {
            console.log("Starting Up..");
            console.log("Working Dir: " + __dirname);
            result = this.command(__dirname, `prepare.sh ${key} ${languages[key].image}`)
        } else {
            console.log(`Dockerfile not found in '${languagePath}'`)
            result = false;
        }
        return result;
    },
    execute(key, code) {
        results = false;
        console.log("preparing sandbox");
        var sandboxId = this.prepareSandboxFolder(key, code);
        var sandboxPath = path.resolve(__dirname + `/../volumes/${sandboxId}`)
        var sandboxPathAbsolute = sandboxPath;
        if(process.platform == "win32") sandboxPathAbsolute = this.convertPath(sandboxPathAbsolute)
        console.log(`executing code in container, sandbox ID: ${sandboxId}`);
        // this.command(__dirname, `docker run --rm -it -v ${sandboxPathAbsolute}:/usercode -w /usercode ${languages[key].image} timeout -t ${languages[key].timeout} sh execute.sh ${languages[key].source} ${languages[key].output}`);
        this.command(__dirname, `docker run --rm -it -v ${sandboxPathAbsolute}:/usercode -w /usercode ${languages[key].image} sh execute.sh ${languages[key].source} ${languages[key].output}`);
        if(this.exists(sandboxPath + path.sep + languages[key].output)){
            results = fs.readFileSync(sandboxPath + path.sep + languages[key].output).toString();
        } else {
            results = null;
        }
        // get result file
        console.log(`Deleting Sandbox ${sandboxPath}..`)
        this.command(__dirname, `rm -rf ${sandboxPath}`);
        return results;
    },
    prepareSandboxFolder(key, code) {
        const crypto = require("crypto");
        const id = crypto.randomBytes(16).toString("hex");
        const languageVolumePath = `${__dirname}/${key}/volume/`;
        const sandboxVolumePath = path.normalize(`${__dirname}/../volumes/${id}`);
        if (fs.existsSync(sandboxVolumePath)) fs.rmdirSync(sandboxVolumePath, {
            recursive: true
        });
        fs.mkdirSync(sandboxVolumePath);
        execa.commandSync(`cp -R ${languageVolumePath} ${sandboxVolumePath}`);
        fs.writeFileSync(`${sandboxVolumePath}/${languages[key].source}`, code);
        return id;
    },
    exists(path) {
        var result = true;
        fs.accessSync(path, fs.constants.F_OK, (err) => {
            if (err) result = false;
        });
        return result;
    },
    command(path, cmd) {
        try {
            if(/^[^ ]+\.sh/.exec(cmd)) cmd = `./${cmd}`;
            var cpr = execa.commandSync(cmd, {
                stdio: "inherit",
                cwd: path,
                timeout: 60000
            });
            if (cpr.failed) {
                if (cpr.exitCode != 0) {
                    console.log(`Process exited with code ${cpr.exitCode}`);
                } else if (cpr.killed) {
                    console.log("Child process is killed");
                } else if (cpr.timedOut) {
                    console.log("Child process timed out.");
                }
            } else {
                return true;
            }
        } catch (e) {
            console.log(e)
        }
        return false;
    },
    convertPath(oldPath) {
        return oldPath
            .replace(/\\/g, "/")
            .replace(/^([A-Za-z]):/, function (a, b) {
                return "//" + b.toLowerCase();
            });
    }
}
const execa = require("execa")
const fs = require("fs");

module.exports = {
    send(input) {
        const languages = require("../languages.json")
        const language = input.language,
            container = languages[language].image
        var output = null;
        if (this.prepare(language, container)) {
            output = this.execute(input.code, container)
        }
        return output;
    },
    prepare(key, image) {
        var result = true;
        const dockerfilePath = __dirname + "/" + key;
        if (this.exists(dockerfilePath) && this.exists(dockerfilePath + "/Dockerfile")) {
            try {
                console.log(execa('pwd'));
                console.log("docker build -t \'" + image + "\' - < Dockerfile");
                execa.commandSync("docker build -t " + image + " - < Dockerfile", { stdio: "inherit", cwd: dockerfilePath });
            } catch (e) {
                result = false;
            }
        } else {
            result = false;
        }
        return result;
    },
    exists(path) {
        var result = true;
        fs.accessSync(path, fs.constants.F_OK, (err) => {
            if (err) result = false;
        });
        return result;
    },
    execute(code, container) {
        console.log("executing code in container");
    },
}
var Generator = require("yeoman-generator");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option("projectName", { type: String, required: true });
    this.option("paperboyUserPassword", { type: String, required: true });
    this.option("paperboyVersion", { type: String, required: true });

    this.projectName = this.options.projectName;
    this.paperboyUserPassword = this.options.paperboyUserPassword;
    this.paperboyVersion = this.options.paperboyVersion;
  }

  async promting() {
    this.answers = await this.prompt([
      {
        type: "confirm",
        name: "useYarn",
        message: "Do you want to use Yarn instead of NPM?",
        default: true
      }
    ]);
  }

  writing() {
    this.fs.copy(
      this.templatePath("**/@(.*|*.{json,css,png,js,conf,txt}|Dockerfile)"),
      this.destinationRoot(),
      {
        globOptions: { dot: true }
      }
    );
    this.fs.copyTpl(
      this.templatePath("frontend/package.json.ejs"),
      this.destinationPath("frontend/package.json"),
      { projectName: this.projectName, paperboyVersion: this.paperboyVersion }
    );
    this.fs.copyTpl(
      this.templatePath("frontend/src/createPagesJson.js.ejs"),
      this.destinationPath("frontend/src/createPagesJson.js"),
      {
        projectName: this.projectName,
        paperboyUserPassword: this.paperboyUserPassword
      }
    );
  }

  install() {
    if (this.answers.useYarn) {
      this.spawnCommandSync("yarn", [], {
        cwd: this.destinationPath("frontend")
      });
    } else {
      this.spawnCommandSync("npm", ["install"], {
        cwd: this.destinationPath("frontend")
      });
    }
    this.spawnCommandSync("docker-compose", ["build", "frontend"]);
  }
};

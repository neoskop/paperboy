var Generator = require("yeoman-generator");
const crypto = require("crypto");
var v = require("voca");
const chalk = require("chalk");
const version = require("../../package.json").version;

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
  }

  async initializing() {
    this.answers = await this.prompt([
      {
        name: "projectName",
        message: "Enter your project name",
        default: v.kebabCase(this.appname)
      },
      {
        name: "projectTitle",
        message: "Enter the project title",
        default: answers => v.titleCase(answers.projectName)
      },
      {
        name: "paperboyVersion",
        message: "Enter the paperboy version",
        default: version
      },
      {
        type: "list",
        name: "restVersion",
        message: "Enter the Magnolia REST delivery endpoint version",
        choices: ["1", "2"],
        default: "2"
      },
      {
        type: "confirm",
        name: "createMagnolia",
        message: "Create a magnolia backend?",
        default: true
      },
      {
        type: "confirm",
        name: "createFrontend",
        message: "Create a frontend?",
        default: true
      }
    ]);

    this.apiToken = crypto.randomBytes(24).toString("hex");
    this.paperboyUserPassword = crypto.randomBytes(24).toString("hex");

    if (this.answers.createMagnolia) {
      this.composeWith(require.resolve("../magnolia"), {
        projectName: this.answers.projectName,
        projectTitle: this.answers.projectTitle,
        paperboyVersion: this.answers.paperboyVersion,
        restVersion: this.answers.restVersion
      });
    }

    if (this.answers.createFrontend) {
      this.composeWith(require.resolve("../frontend"), {
        projectName: this.answers.projectName,
        paperboyUserPassword: this.paperboyUserPassword,
        paperboyVersion: this.answers.paperboyVersion,
        restVersion: this.answers.restVersion
      });
    }
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath("docker-compose.yml.ejs"),
      this.destinationPath("docker-compose.yml"),
      {
        ...this.answers,
        apiToken: this.apiToken,
        paperboyUserPassword: this.paperboyUserPassword,
        paperboyVersion: this.answers.paperboyVersion
      }
    );

    this.fs.copyTpl(
      this.templatePath("push-service.env.ejs"),
      this.destinationPath("push-service.env"),
      {
        apiToken: this.apiToken
      }
    );
  }

  end() {
    this.log(
      "\nProject setup is complete. Use the following command to start the development environment:"
    );
    this.log(`\n\t$ ${chalk.white.bold("docker-compose up")}\n`);
  }
};

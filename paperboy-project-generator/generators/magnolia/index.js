const Generator = require("yeoman-generator");
const crypto = require("crypto");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option("projectName", { type: String, required: true });
    this.option("projectTitle", { type: String, required: true });
    this.projectName = this.options.projectName;
    this.projectTitle = this.options.projectTitle;
  }

  async promting() {
    this.answers = await this.prompt([
      {
        type: "confirm",
        name: "enterpriseEdition",
        message: "Do you need Magnolia EE features?",
        default: false
      },
      {
        type: "confirm",
        name: "maintenanceReleases",
        message: "Do you want to receive Magnolia maintenance releases?",
        default: true,
        when: response => {
          return !response.enterpriseEdition;
        }
      },
      {
        type: "input",
        name: "enterpriseEditionUsername",
        message: "What is the Magnolia Nexus username?",
        validate: input => input && input.length > 0,
        when: response => {
          return response.enterpriseEdition || response.maintenanceReleases;
        }
      },
      {
        type: "password",
        name: "enterpriseEditionPassword",
        message: "What is the Magnolia Nexus password?",
        validate: input => input && input.length > 0,
        when: response => {
          return response.enterpriseEdition || response.maintenanceReleases;
        }
      },
      {
        type: "list",
        name: "javaVersion",
        message: "Which Java version should Magnolia use?",
        choices: ["8", "11"],
        default: "11"
      }
    ]);
  }

  writing() {
    this.fs.copy(
      this.templatePath("**/@(.*|*.{properties,txt,yaml.json,xml})"),
      this.destinationRoot(),
      {
        globOptions: { dot: true }
      }
    );
    this.fs.copyTpl(
      this.templatePath("backend/magnolia/pom.xml.ejs"),
      this.destinationPath("backend/magnolia/pom.xml"),
      {
        projectName: this.projectName,
        projectTitle: this.projectTitle,
        ...this.answers
      }
    );
    this.fs.copyTpl(
      this.templatePath("backend/magnolia/Dockerfile.ejs"),
      this.destinationPath("backend/magnolia/Dockerfile"),
      this.answers
    );
    this.fs.copyTpl(
      this.templatePath("backend/magnolia/webapp/pom.xml.ejs"),
      this.destinationPath("backend/magnolia/webapp/pom.xml"),
      {
        projectName: this.projectName,
        projectTitle: this.projectTitle,
        ...this.answers
      }
    );

    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 1024,
      publicKeyEncoding: {
        type: "spki",
        format: "der"
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "der"
      }
    });

    this.fs.copyTpl(
      this.templatePath(
        "backend/magnolia/webapp/src/main/webapp/WEB-INF/config/default/magnolia-activation-keypair.properties.ejs"
      ),
      this.destinationPath(
        "backend/magnolia/webapp/src/main/webapp/WEB-INF/config/default/magnolia-activation-keypair.properties"
      ),
      {
        ...this.answers,
        publicKey: Buffer.from(publicKey)
          .toString("hex")
          .toUpperCase(),
        privateKey: Buffer.from(privateKey)
          .toString("hex")
          .toUpperCase()
      }
    );

    this.fs.copyTpl(
      this.templatePath(
        "backend/magnolia/webapp/src/main/webapp/WEB-INF/config/default/magnolia.properties.ejs"
      ),
      this.destinationPath(
        "backend/magnolia/webapp/src/main/webapp/WEB-INF/config/default/magnolia.properties"
      ),
      this.answers
    );
  }

  install() {
    this.spawnCommandSync("mgnl", [
      "create-light-module",
      "-f",
      "-p",
      "backend/magnolia/light-modules",
      this.projectName
    ]);
    this.spawnCommandSync("docker-compose", ["build", "magnolia"]);
  }
};

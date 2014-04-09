var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var S = require('string');
import { Package } from '../Package/Package';
import { FileExistsError } from '../Error/FileExistsError';

export class PackageGenerator {

  /**
   * @param {Package} _package
   * @param {string} filesPath
   */
  constructor (_package, filesPath) {
    this.package = _package;
    this.filesPath = filesPath;
  }

  /**
   * Create a new package
   *
   * @throws FileExistsError
   */
  create() {
    if (!this.force && this.package.existsSync()) {
      throw new FileExistsError(`Package: "${this.package.name}"`);
    }
    this.createController();
    this.createModel();
    this.createRoutes();
  }

  /**
   * Create a new controller
   *
   * @param {string} [name]
   * @throws FileExistsError
   */
  createController(name = this.package.name) {
    var template = this._getTemplate('package/controller');
    var testTemplate = this._getTemplate('package/tests/controller');
    var templateVars = this._defaultTemplateVars;

    // avoid *ControllerController in the name of the controller
    if (name.toLowerCase().endsWith('controller')) {
      name = name.slice(0, -10);
    }

    if (!this.force && this.package.existsSync(`Controller/${name}Controller.js`)) {
      throw new FileExistsError(`Controller "${name}"`);
    }
    templateVars.controller = new PackageGenerator._templateVar(name);
    this._write(`Controller/${name}Controller.js`, PackageGenerator._renderTemplate(template, templateVars));
    this._write(`Tests/Controller/${name}ControllerTest.js`, PackageGenerator._renderTemplate(testTemplate, templateVars));

    // if REST api is set create the RestController
    if (this.addRest) {
      this.createRestController();
    }
  }

  /**
   * Create a new REST controller
   *
   * @throws FileExistsError
   */
  createRestController() {
    var template = this._getTemplate('package/restcontroller');
    var testTemplate = this._getTemplate('package/tests/restcontroller');
    var templateVars = this._defaultTemplateVars;
    if (!this.force && this.package.existsSync('Controller/RestController.js')) {
      throw new FileExistsError('Controller "RestController"');
    }
    this._write(`Controller/RestController.js`, PackageGenerator._renderTemplate(template, templateVars));
    this._write(`Tests/Controller/RestControllerTest.js`, PackageGenerator._renderTemplate(testTemplate, templateVars));
  }

  /**
   * Create a new model
   *
   * @param {string} [name]
   * @throws FileExistsError
   */
  createModel(name = this.package.name) {
    var template = this._getTemplate('package/model');
    var testTemplate = this._getTemplate('package/tests/model');
    var templateVars = this._defaultTemplateVars;
    if (!this.force && this.package.existsSync(`Model/${name}.js`)) {
      throw new FileExistsError(`Model "${name}"`);
    }
    templateVars.model = new PackageGenerator._templateVar(name);
    this._write(`Model/${name}.js`, PackageGenerator._renderTemplate(template, templateVars));
    this._write(`Tests/Model/${name}Test.js`, PackageGenerator._renderTemplate(testTemplate, templateVars));
  }

  /**
   * Create a new routes file
   *
   * @throws FileExistsError
   */
  createRoutes() {
    var template = this._getTemplate('package/routes');
    var templateVars = this._defaultTemplateVars;
    if (!this.force && this.package.existsSync('routes.js')) {
      throw new FileExistsError('"routes.js"');
    }
    this._write('routes.js', PackageGenerator._renderTemplate(template, templateVars));
  }

  /**
   * Create a file inside the package
   *
   * @param {string} filePath
   * @param {string} str
   */
  _write(filePath, str) {
    if (!filePath.startsWith('/')) {
      filePath = path.join(this.package.path, filePath);
    }
    this._mkdir(path.dirname(filePath));
    fs.writeFile(filePath, str);
    console.log(`  \x1b[36mcreated\x1b[0m : ${filePath}`);
  }

  /**
   * Create a directory inside the package
   *
   * @param dirPath
   * @private
   */
  _mkdir(dirPath) {
    if (!dirPath.startsWith('/')) {
      dirPath = path.join(this.package.path, dirPath);
    }
    mkdirp.sync(dirPath, '0755');
  }

  /**
   * Returns the default variables for the templates
   *
   * @private
   */
  get _defaultTemplateVars() {
    return {
      package: new PackageGenerator._templateVar(this.package.name)
    }
  }

  /**
   * Returns the content of a template file
   *
   * @param {string} relativePath
   * @return {string}
   * @private
   */
  _getTemplate(relativePath) {
    return fs.readFileSync(path.join(this.filesPath, `${relativePath}.template`))
      .toString();
  }

  /**
   * Render the variables between double curly braces
   *
   * i.e: {{ name }} -> vars['name']
   *      {{ name | toLowerCase }} -> vars['name'].toLowerCase()
   *
   * @param {string} template
   * @param vars
   * @returns {string}
   * @private
   */
  static _renderTemplate(template, vars) {
    var regex = /\{{2}([^}]+)\}{2}/g;
    template = template.replace(regex, (match, value) => {
      var parts = value.split('|');
      var result;
      value = parts[0].trim();
      result = vars[value] || '';
      if (parts[1] && parts[1].trim()) {
        result = result[parts[1].trim()]();
      }
      return result;
    });
    return template;
  }

  /**
   * Helper for strings in templates, extends from string.js
   *
   * @param {string} value
   * @private
   */
  static _templateVar(value) {
    this.setValue(value);

    /**
     * Returns the string with the first letter in upper case
     *
     * @return {PackageGenerator._templateVar}
     */
    this.capitalize = function () {
      return new PackageGenerator._templateVar(value[0].toUpperCase() + value.slice(1));
    };

    /**
     * Returns the string with the first letter in lower case
     *
     * @return {PackageGenerator._templateVar}
     */
    this.camelize = function () {
      return new PackageGenerator._templateVar(value[0].toLowerCase() + value.slice(1));
    };
  }
}

// _templateVar extends from string.js
PackageGenerator._templateVar.prototype = S();
PackageGenerator._templateVar.prototype.constructor = PackageGenerator._templateVar;
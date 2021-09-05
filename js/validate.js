const validator = require('validator');

const validate = {
  validateString(string) {
    return string !== '' || 'Please enter a valid response!';
  },
  validateSalary(number) {
    if (validator.isDecimal(number)) return true;
    return 'Please enter a valid salary!';
  },
  isSame(string1, string2) {
    if (string1 === string2) return true;
  }
};

module.exports = validate;
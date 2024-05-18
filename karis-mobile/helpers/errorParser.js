export default (errorObject) => {
  let errorMessage = '';
  if (Array.isArray(errorObject)) {
    errorObject.map((error, index) => {
      errorMessage += `${error}`;
      if (index + 1 !== errorObject.length) {
        errorMessage += `\n\n`;
      }
    });
  } else {
    Object.entries(errorObject).map(([key, value], index) => {
      let keyDisplay = key.split('_').map((item) => `${item[0].toUpperCase()}${item.substr(1)}`).join(' ');
      errorMessage += `${keyDisplay}: ${value[0]}`;
      if (index + 1 !== Object.keys(errorObject).length) {
        errorMessage += `\n\n`;
      }
    });
  }
  return errorMessage;
};

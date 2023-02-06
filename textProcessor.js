const getIdsFromDescription = (text, shortName) => {
  const splitText = text.split(`/${shortName}-`);

  const ids = [];

  if (splitText.length > 0) {
    for (let i = 1; i < splitText.length; i++) {
      const splitLinea = splitText[i].split(".");
      if (splitLinea.length > 0) {
        ids.push(`${shortName}-${splitLinea[0]}`);
      }
    }
  }

  return ids.sort();
};

module.exports = { getIdsFromDescription };

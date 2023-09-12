'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {
  
  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {
      const text = req.body.text;
      const locale = req.body.locale;

      if (typeof text !== "string" || typeof locale !== "string") {
        return res.json({ error: 'Required field(s) missing' });
      };
      
      const result = translator.translate(text, locale);
      console.log(result)
      return res.json(result);
    });
};

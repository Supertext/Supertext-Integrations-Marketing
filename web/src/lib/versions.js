// "Supported versions" is shared by all languages in the CMS (version numbers don't change).
// Its few English words are translated here: whole sentences first, then the connecting words.

const SENTENCES = {
  de: {
    'Any Mailchimp account': 'Jedes Mailchimp-Konto',
    'Any Shopify plan, or a free development store': 'Jeder Shopify-Plan oder ein kostenloser Development Store',
    'Any Wix or Wix Studio site with Wix Multilingual': 'Jede Wix- oder Wix-Studio-Website mit Wix Multilingual',
    'HubSpot Content Hub or Marketing Hub (Professional or Enterprise for multi-language content)':
      'HubSpot Content Hub oder Marketing Hub (Professional oder Enterprise für mehrsprachige Inhalte)',
  },
  fr: {
    'Any Mailchimp account': 'Tout compte Mailchimp',
    'Any Shopify plan, or a free development store': 'Tout forfait Shopify, ou une boutique de développement gratuite',
    'Any Wix or Wix Studio site with Wix Multilingual': 'Tout site Wix ou Wix Studio avec Wix Multilingual',
    'HubSpot Content Hub or Marketing Hub (Professional or Enterprise for multi-language content)':
      'HubSpot Content Hub ou Marketing Hub (Professional ou Enterprise pour le contenu multilingue)',
  },
  it: {
    'Any Mailchimp account': 'Qualsiasi account Mailchimp',
    'Any Shopify plan, or a free development store': 'Qualsiasi piano Shopify o un development store gratuito',
    'Any Wix or Wix Studio site with Wix Multilingual': 'Qualsiasi sito Wix o Wix Studio con Wix Multilingual',
    'HubSpot Content Hub or Marketing Hub (Professional or Enterprise for multi-language content)':
      'HubSpot Content Hub o Marketing Hub (Professional o Enterprise per i contenuti multilingue)',
  },
};

const WORDS = {
  de: [[' or later', ' oder neuer'], [' or newer', ' oder neuer'], ['(tested with ', '(getestet mit '], ['(tested on ', '(getestet mit '], ['(tested)', '(getestet)'], [' should work', ' sollte funktionieren'], [' for the connector', ' für den Connector'], [' on Windows', ' unter Windows'], [' and ', ' und '], [' or ', ' oder '], [' with ', ' mit ']],
  fr: [[' or later', ' ou plus récent'], [' or newer', ' ou plus récent'], ['(tested with ', '(testé avec '], ['(tested on ', '(testé sur '], ['(tested)', '(testé)'], [' should work', ' devrait fonctionner'], [' for the connector', ' pour le connecteur'], [' on Windows', ' sous Windows'], [' and ', ' et '], [' or ', ' ou '], [' with ', ' avec ']],
  it: [[' or later', ' o successive'], [' or newer', ' o successive'], ['(tested with ', '(testato con '], ['(tested on ', '(testato su '], ['(tested)', '(testato)'], [' should work', ' dovrebbe funzionare'], [' for the connector', ' per il connettore'], [' on Windows', ' su Windows'], [' and ', ' e '], [' or ', ' o '], [' with ', ' con ']],
};

export function localizeVersions(text, locale) {
  if (!text || !WORDS[locale]) return text;
  const sentence = SENTENCES[locale][text];
  if (sentence) return sentence;
  return WORDS[locale].reduce((out, [en, local]) => out.split(en).join(local), text);
}

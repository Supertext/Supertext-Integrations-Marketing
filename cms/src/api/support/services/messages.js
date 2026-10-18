'use strict';

// Emails to the person who sent a support request, in the language they used on the site.
// Formal address; "Supertext" and links never translated.

const T = {
  en: {
    receivedSubject: 'We received your request {ref}',
    received: 'Thank you for your message about {platform}. We have received it under the reference {ref} and will answer you by email.',
    publicNote: 'Your description is also tracked publicly, without your name and email address: {url}',
    answerSubject: 'Answer to your request {ref}',
    answer: 'Here is the answer to your request about {platform}:',
    bugSubject: 'Your request {ref}: we are fixing it',
    bug: 'Thank you: what you describe is a bug in the {platform} plugin. We are working on a fix and will let you know when it is released.',
    featureSubject: 'Your request {ref}: thank you for the idea',
    feature: 'Thank you for your suggestion for the {platform} plugin. We have passed it on to the product team, who will decide on it.',
    closedSubject: 'Your request {ref} is closed',
    closed: 'Your request about {platform} is closed.',
    fixed: 'The fix is in the plugin. Update to the next release to get it.',
    follow: 'You can follow the discussion here: {url}',
    reply: 'To add something, reply to this email or comment on the issue.',
    signature: 'Kind regards\nYour Supertext team',
  },
  de: {
    receivedSubject: 'Wir haben Ihre Anfrage {ref} erhalten',
    received: 'Vielen Dank für Ihre Nachricht zu {platform}. Wir haben sie unter der Referenz {ref} erhalten und antworten Ihnen per E-Mail.',
    publicNote: 'Ihre Beschreibung wird zudem öffentlich verfolgt, ohne Ihren Namen und Ihre E-Mail-Adresse: {url}',
    answerSubject: 'Antwort auf Ihre Anfrage {ref}',
    answer: 'Hier ist die Antwort auf Ihre Anfrage zu {platform}:',
    bugSubject: 'Ihre Anfrage {ref}: Wir beheben den Fehler',
    bug: 'Vielen Dank: Was Sie beschreiben, ist ein Fehler im Plugin für {platform}. Wir arbeiten an einer Korrektur und melden uns, sobald sie veröffentlicht ist.',
    featureSubject: 'Ihre Anfrage {ref}: Danke für die Idee',
    feature: 'Vielen Dank für Ihren Vorschlag zum Plugin für {platform}. Wir haben ihn an das Produktteam weitergegeben, das darüber entscheidet.',
    closedSubject: 'Ihre Anfrage {ref} ist abgeschlossen',
    closed: 'Ihre Anfrage zu {platform} ist abgeschlossen.',
    fixed: 'Die Korrektur ist im Plugin. Aktualisieren Sie auf die nächste Version, um sie zu erhalten.',
    follow: 'Hier können Sie die Diskussion verfolgen: {url}',
    reply: 'Möchten Sie etwas ergänzen? Antworten Sie auf diese E-Mail oder kommentieren Sie das Issue.',
    signature: 'Freundliche Grüsse\nIhr Supertext-Team',
  },
  fr: {
    receivedSubject: 'Nous avons bien reçu votre demande {ref}',
    received: 'Merci pour votre message concernant {platform}. Nous l’avons bien reçu sous la référence {ref} et vous répondrons par e-mail.',
    publicNote: 'Votre description est aussi suivie publiquement, sans votre nom ni votre adresse e-mail : {url}',
    answerSubject: 'Réponse à votre demande {ref}',
    answer: 'Voici la réponse à votre demande concernant {platform} :',
    bugSubject: 'Votre demande {ref} : nous corrigeons l’erreur',
    bug: 'Merci : ce que vous décrivez est une erreur du plugin pour {platform}. Nous travaillons à une correction et vous informerons dès sa publication.',
    featureSubject: 'Votre demande {ref} : merci pour l’idée',
    feature: 'Merci pour votre suggestion concernant le plugin pour {platform}. Nous l’avons transmise à l’équipe produit, qui en décidera.',
    closedSubject: 'Votre demande {ref} est close',
    closed: 'Votre demande concernant {platform} est close.',
    fixed: 'La correction est dans le plugin. Mettez-le à jour vers la prochaine version pour en bénéficier.',
    follow: 'Vous pouvez suivre la discussion ici : {url}',
    reply: 'Pour ajouter quelque chose, répondez à cet e-mail ou commentez l’issue.',
    signature: 'Meilleures salutations\nVotre équipe Supertext',
  },
  it: {
    receivedSubject: 'Abbiamo ricevuto la Sua richiesta {ref}',
    received: 'Grazie per il Suo messaggio su {platform}. Lo abbiamo ricevuto con il riferimento {ref} e Le risponderemo via e-mail.',
    publicNote: 'La Sua descrizione è seguita anche pubblicamente, senza il Suo nome e il Suo indirizzo e-mail: {url}',
    answerSubject: 'Risposta alla Sua richiesta {ref}',
    answer: 'Ecco la risposta alla Sua richiesta su {platform}:',
    bugSubject: 'La Sua richiesta {ref}: stiamo correggendo l’errore',
    bug: 'Grazie: quello che descrive è un errore nel plugin per {platform}. Stiamo lavorando a una correzione e La informeremo non appena sarà pubblicata.',
    featureSubject: 'La Sua richiesta {ref}: grazie per l’idea',
    feature: 'Grazie per il Suo suggerimento sul plugin per {platform}. Lo abbiamo inoltrato al team di prodotto, che deciderà in merito.',
    closedSubject: 'La Sua richiesta {ref} è chiusa',
    closed: 'La Sua richiesta su {platform} è chiusa.',
    fixed: 'La correzione è nel plugin. Aggiorni alla prossima versione per riceverla.',
    follow: 'Può seguire la discussione qui: {url}',
    reply: 'Per aggiungere qualcosa, risponda a questa e-mail o commenti l’issue.',
    signature: 'Cordiali saluti\nIl Suo team Supertext',
  },
};

const fill = (text, values) => text.replace(/\{(\w+)\}/g, (m, k) => (values[k] ?? m));

function message(locale, key, values = {}) {
  const table = T[locale] || T.en;
  return fill(table[key] ?? T.en[key], values);
}

module.exports = { message, LOCALES: Object.keys(T) };

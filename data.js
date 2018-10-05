const data = {
  SEARCHWORDS : [
    `digital`,
    `digitale`,
    `digitales`,
    `digitalisation`,
    `digitaux`
  ],

  PROHIBITEDWORDS : [
    // The more at the end of this array the object is, the highest priority it has
    {
      queries: [/digita(l|ux)/],
      responses: [
        `Vive le #digital !`,
        `Le #digital c\`est la vie.`,
        `Le #digital est notre ami.`,
        `Si y\`a du #digital, c\`est légal`,
        `Un #digital, et ça repart !`,
        `#Digital un jour, #digital toujours !`,
        `Tu l\`as dit, gital !`,
        `Que la force du #digital soit avec toi !`,
        `Un certain doigté dans votre tweet !`,
        `#Digitalement vôtre.`,
        `#Digitalisatioooon ! /o/`,
        `On croise les doigts pour que le #digital perdure !`,
        `Oh, on a mis le doigt sur quelque chose?`,
        `Avec le #digital, non seulement on peut, mais on doigt.`,
        `- Vous voulez du #digital? - Juste un doigt.`,
        `Avec le #digital, on se met le doigt dans l\`œil`,
        `Le #digital, c\`est mon p\`tit doigt qui me l\`a dit !`,
        `Le #digital vous obéit au doigt et à l\`œil !`,
        `Grâce à vous, le #digital est montré du doigt.`,
        `Un effort, vous touchez du doigt le numérique !`,
        `On peut aussi ne rien faire de ses dix doigts, avec le #digital.`,
        `Le #digital et le numérique, ils sont comme les doigts de la main.`,
        `Attention, d\`ici je peux voir vos doigts de fée du #digital ;)`,
        `Là, clairement, vous mettez le doigt sur la plaie.`,
        `Popopo ! Carton jaune monsieur l\`arbitre !`,
        `Le #digital, vous connaissez ça sur le bout des doigts.`,
        `"Le #digital? C\`est trop génial !" - Louis XVI`,
        `"Le #digital? SWAG !" - Victor Hugo`,
        `Ne mets pas tes doigts dans le #digital, tu risques de te faire pincer très fort !`,
        `Militons pour la défense des doigts de l\`Homme.`,
        `Le #digital, le travail d\`un orthopédiste main ?`,
        `Alors, on laisse son empreinte dans le #digital ?`,
        `Le #digital, le travail d\`un dermatologue ?`,
        `...Je vais faire une main courante.`,
        `🎵 Je mets le doigt devant, je mets le doigt derrière ! 🎶`,
        `🎵 Qui a le doiiiigt d\`faire ça? 🎶`,
        `Vous travaillez sur le #digital d\`une main de maître.`,
        `#balancetondoigt`,
        `Selon le Dr Georges Becker, 120 grammes de #digitale représentent une dose mortelle.`,
        `On est passé à deux doigts du numérique ;)`,
        `Restez doigts dans vos bottes.`,
        `#Digital, petits monstres, tu es le champion !`,
        `#DIGITAL`,
        `Ben voyons, et pourquoi pas du #marketing #digital tant qu\`à faire ?`,
        `Sauf trait d\`humour, « empreinte #digitale » n\`est pas synonyme de « empreinte numérique`,
        `Ce que vous faites de vos doigts ne nous regarde pas 👀`
      ]
    },
    {
      queries: [/#?[tT]ransformation\s?[dD]igital/,
        /[tT]ransfo\s?[dD]igi/],
      responses: [
        `https://i.imgur.com/38Cs6G0.jpg`,
        `https://i.imgur.com/hIwO2mF.jpg`,
        `https://i.imgur.com/YALJMd8.jpg`
      ]
    },
    {
      queries: [/campagnes?\s?digital/],
      responses: [`https://pbs.twimg.com/profile_banners/920311532382277632/1508254739`]
    },
    {
      queries: [/fractures?\sdigitale/],
      responses: [`http://injury-fr.vsebolezni.com/injury/images/130-0.jpg`]
    }
  ],

  EXCEPTIONS : [/(?:(?:dispositif|empreinte|affichage)s?\s|num[ée]rique.*?|num[ée]riser.*?|[_./#\-"]|@.*?|\spas\s)([dD]igita(?:l(?:es)?|ux|lis(?:er|ations?)?))|([dD]igita(?:l(?:es)?|ux|lis(?:er|ations?)?))\s(?:(?:dash|native|nomad|deluxe|transformation)|.*?numérique|.*?num[ée]riser)|Digital/],
  // EXCEPTIONS contains these exceptions: (more readable)
  //   /Digital/,
  //   /[_./#\-"]digital/,
  //   /dispositifs?\sdigital/,
  //   /empreintes?\sdigital/,
  //   /affichages?\sdigital/,
  //   /numérique.*?digital/,
  //   /digital.*?numérique/,
  //   /\spas\sdigital/,
  //   /digital\sdash/,
  //   /digital\snative/,
  //   /digital\snomad/,
  //   /digital\sdeluxe/,
  //   /digital\stransformation/,
  //   /@\w*digital/

  EMOJIS : `👐🙌👏🙏🤝👍👎👊✊🤛🤜🤞✌🤘👌👈👉👆👇☝✋🤚🖐🖖👋🤙✍💅🤳🤗`.split(``),

  LINKS : [
    `http://www.academie-francaise.fr/digital`,
    `http://www.cnrtl.fr/definition/digital`,
    `http://toucher.rectal.digital`,
    `https://www.youtube.com/watch?v=2N7Qea39Ego`,
    `Même au Québec : http://gdt.oqlf.gouv.qc.ca/ficheOqlf.aspx?Id_Fiche=2654099`,
    `https://www.bbc.com/news/av/embed/p06n111v/45760646`
  ],

  MINFOLLOWERS : 100,
  MAXFOLLOWERS : 100000,
  MINPROBABILITY : 100,
  MAXPROBABILITY : 1
}
data.MAXTWEETLIMIT = 280 - data.LINKS.sort((a, b) => b.length-a.length)[0].length

export { data }

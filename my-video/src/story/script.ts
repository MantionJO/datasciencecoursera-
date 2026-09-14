export type Line = {
  speaker: string;
  text: string;
  // Sound-only beat (ambience/SFX) rather than spoken dialogue — rendered
  // as a subtler stage direction and timed by durationSeconds, not word count.
  ambiance?: boolean;
  durationSeconds?: number;
};

export type Scene = {
  id: string;
  title: string;
  bg: string;
  accent: string;
  lines: Line[];
};

export const TITLE = "Le Mouton de Vieux Dago";
export const SUBTITLE = "Un conte du marché";

export const PROVERB = "Parfois, c'est toi-même qui es le mouton.";

export const scenes: Scene[] = [
  {
    id: "maison",
    title: "La Maison",
    bg: "#F3E1C6",
    accent: "#9C5A2E",
    lines: [
      {
        speaker: "Ambiance",
        text: "(La radio grésille doucement. Une calebasse est posée sur la table dans un bruit sourd.)",
        ambiance: true,
        durationSeconds: 14,
      },
      {
        speaker: "Narrateur",
        text: "Ce matin-là, dans le petit village de Kokodji, le soleil se levait à peine que déjà la radio grésillait dans la maison de Vieux Dago.",
      },
      {
        speaker: "Vieux Dago",
        text: "Femme ! Aujourd'hui je vais au marché vendre notre plus beau mouton. Tu vas voir, je reviendrai avec de quoi acheter deux calebasses de mil !",
      },
      {
        speaker: "Sa femme",
        text: "Deux calebasses ? Toi qui ne sais même pas marchander une mangue, tu veux vendre un mouton entier ?",
      },
      {
        speaker: "Vieux Dago",
        text: "Femme, respecte ton mari ! J'ai déjà vendu trois chèvres dans ma vie !",
      },
      {
        speaker: "Sa femme",
        text: "Trois chèvres... et tu es revenu chaque fois avec moins d'argent que prévu.",
      },
      {
        speaker: "Vieux Dago",
        text: "Ce mouton, c'est le plus gras du troupeau ! Les acheteurs vont se battre pour l'avoir !",
      },
      {
        speaker: "Sa femme",
        text: "Se battre pour l'acheter, ou se battre pour ne pas te l'acheter ?",
      },
      {
        speaker: "Vieux Dago",
        text: "Tu commences à ressembler à ma belle-mère avec tes moqueries, femme !",
      },
      {
        speaker: "Sa femme",
        text: "Et toi, tu commences à ressembler à ce mouton — têtu comme une pierre !",
      },
      {
        speaker: "Sa femme",
        text: "Pendant que tu y es, rapporte aussi du sel et un peu de savon.",
      },
      {
        speaker: "Vieux Dago",
        text: "Du sel, du savon, et pourquoi pas la lune pendant que j'y suis ! Bon, d'accord, d'accord.",
      },
      {
        speaker: "Narrateur",
        text: "Vieux Dago ajusta son boubou, attacha la corde autour du cou du mouton, et sortit fièrement, sourd aux rires de sa femme.",
      },
    ],
  },
  {
    id: "route",
    title: "La Route",
    bg: "#E7C79A",
    accent: "#7A4B21",
    lines: [
      {
        speaker: "Narrateur",
        text: "Sur la route poussiéreuse, Vieux Dago pédalait son vieux vélo d'une main, tenant la corde du mouton de l'autre. Le vélo grinçait à chaque tour de roue.",
      },
      {
        speaker: "Ambiance",
        text: "(Crac-crac, crac-crac fait le vélo. Le vent souffle doucement sur la route de terre.)",
        ambiance: true,
        durationSeconds: 18,
      },
      {
        speaker: "Vieux Dago",
        text: "Avance, sale bête ! On n'a pas toute la journée !",
      },
      {
        speaker: "Narrateur",
        text: "Le mouton, lui, regardait le paysage comme s'il n'était pas pressé du tout.",
      },
      {
        speaker: "Narrateur",
        text: "Au loin, une poussière ocre montait déjà dans le ciel du matin : le marché n'était plus très loin.",
      },
      {
        speaker: "Un passant",
        text: "Eh, Vieux Dago ! On dirait que c'est ton mouton qui te promène, et pas le contraire !",
      },
      {
        speaker: "Vieux Dago",
        text: "Occupe-toi de tes propres cabris, l'ami, et laisse-moi tranquille !",
      },
      {
        speaker: "Narrateur",
        text: "Le passant éclata de rire et continua son chemin, tandis que Vieux Dago pédalait de plus belle, vexé.",
      },
      {
        speaker: "Vieux Dago",
        text: "Encore un peu, mon vélo... on y est presque...",
      },
    ],
  },
  {
    id: "marche",
    title: "Le Marché",
    bg: "#FFC15E",
    accent: "#C1440E",
    lines: [
      {
        speaker: "Ambiance",
        text: "(Bêlements de moutons, cris de vendeurs, enfants qui jouent, un chien qui aboie au loin.)",
        ambiance: true,
        durationSeconds: 24,
      },
      {
        speaker: "Narrateur",
        text: "Arrivé au marché, c'était déjà l'effervescence : bêlements, cris des vendeurs, enfants qui couraient entre les étals.",
      },
      { speaker: "Vendeur", text: "Tomates fraîches ! Tomates du jour ! Venez, venez !" },
      { speaker: "Vendeur", text: "Poisson fumé, poisson fumé, le meilleur du village !" },
      { speaker: "Vendeur", text: "Piments qui arrachent la langue ! Venez goûter, venez !" },
      { speaker: "Enfant vendeur d'eau", text: "De l'eau fraîche ! Un franc le sachet !" },
      {
        speaker: "Narrateur",
        text: "C'est alors qu'apparut Koko la Solution, célèbre pour arranger toutes les affaires du marché — et pour s'attirer une petite commission au passage.",
      },
      {
        speaker: "Koko la Solution",
        text: "Vieux Dago ! Justement l'homme qu'il me fallait ! Ce mouton, laisse-moi m'en occuper, je te le vends au triple prix, foi de Koko !",
      },
      {
        speaker: "Vieux Dago",
        text: "La dernière fois, tu m'as vendu ma propre chèvre à moi-même, Koko !",
      },
      {
        speaker: "Koko la Solution",
        text: "Erreur de jeunesse ! Aujourd'hui, je suis un homme changé !",
      },
      {
        speaker: "Koko la Solution",
        text: "Regardez ce mouton, mes amis ! Ces cornes, cette laine ! Un roi parmi les moutons !",
      },
      {
        speaker: "Un acheteur",
        text: "Il a l'air nerveux, ton roi...",
      },
      {
        speaker: "Koko la Solution",
        text: "Nerveux ? C'est de la fierté, mon frère, rien que de la fierté !",
      },
      {
        speaker: "Ambiance",
        text: "(Le brouhaha continue, mêlé de rires et de marchandages tout autour des étals.)",
        ambiance: true,
        durationSeconds: 18,
      },
      {
        speaker: "Un acheteur",
        text: "Bon. Je t'en donne la moitié de ce que tu demandes, pas un franc de plus.",
      },
      {
        speaker: "Koko la Solution",
        text: "La moitié ? Tu veux ma ruine, mon frère ! Disons... les trois quarts, et on est amis pour la vie !",
      },
      {
        speaker: "Vieux Dago",
        text: "(à part, inquiet) Koko, ne brade pas mon mouton, hein, je te surveille...",
      },
      {
        speaker: "Koko la Solution",
        text: "Va pour les trois quarts, tope là, mon frère !",
      },
      {
        speaker: "Un acheteur",
        text: "Tope là, Koko — mais je garde un œil sur toi.",
      },
    ],
  },
  {
    id: "mouton-rebelle",
    title: "Le Mouton Rebelle",
    bg: "#FF7A45",
    accent: "#6E1414",
    lines: [
      {
        speaker: "Narrateur",
        text: "Mais pendant que Koko négociait bruyamment avec un acheteur, le mouton, fatigué d'attendre, tira un grand coup sur sa corde... et se libéra !",
      },
      { speaker: "Foule", text: "Le mouton ! Attrapez-le !" },
      {
        speaker: "Koko la Solution",
        text: "Ce n'est pas moi qui l'ai détaché !!",
      },
      {
        speaker: "Ambiance",
        text: "(Course effrénée. Paniers qui tombent, tomates qui s'écrasent, cris et rires mêlés de toute la foule.)",
        ambiance: true,
        durationSeconds: 38,
      },
      {
        speaker: "Narrateur",
        text: "L'animal fila entre les étals, renversant un panier de tomates, puis un autre, semant la panique parmi les vendeuses.",
      },
      { speaker: "Vendeuse", text: "Mes tomates ! Mes tomates écrasées !" },
      { speaker: "Vendeur", text: "Attention à mes piments, sale bête à quatre pattes !" },
      {
        speaker: "Narrateur",
        text: "Un chien se mit à aboyer, des enfants riaient aux éclats, et Vieux Dago courait derrière son mouton en criant plus fort que tout le marché réuni.",
      },
      {
        speaker: "Vieux Dago",
        text: "Reviens ici, satan de bête ! Tu me couvres de honte !",
      },
      {
        speaker: "Narrateur",
        text: "Après une course folle entre les étals, c'est finalement l'enfant vendeur d'eau qui, avec un simple sachet d'eau fraîche, attira le mouton et le calma.",
      },
      { speaker: "Enfant vendeur d'eau", text: "Tiens, tiens, viens boire, petit mouton..." },
      {
        speaker: "Narrateur",
        text: "Le marché entier éclata de rire devant ce dénouement inattendu, et Koko la Solution, disparu depuis le début de la course, revint comme si de rien n'était.",
      },
      {
        speaker: "Koko la Solution",
        text: "Alors, Vieux Dago ? On dirait que le mouton, c'est lui qui a fait l'affaire aujourd'hui, hein ?",
      },
      {
        speaker: "Foule",
        text: "(rires) Vive le mouton, champion du marché !",
      },
    ],
  },
  {
    id: "retour",
    title: "Retour à la Maison",
    bg: "#3E3B5B",
    accent: "#F2C14E",
    lines: [
      {
        speaker: "Ambiance",
        text: "(Silence relatif sur le chemin du retour. Seuls les pas de Vieux Dago résonnent dans la poussière.)",
        ambiance: true,
        durationSeconds: 20,
      },
      {
        speaker: "Narrateur",
        text: "Le soir venu, Vieux Dago rentra chez lui, poussiéreux, fatigué, sans avoir vendu son mouton — mais avec une histoire que tout le village raconterait pendant des semaines.",
      },
      {
        speaker: "Sa femme",
        text: "Alors, mon mari, combien de calebasses de mil as-tu ramenées ?",
      },
      {
        speaker: "Sa femme",
        text: "Je savais que tu reviendrais avec une histoire plutôt qu'avec de l'argent. Raconte-moi encore comment le petit a rattrapé ce mouton.",
      },
      {
        speaker: "Vieux Dago",
        text: "(fierté qui revient malgré lui) Ah, il fallait voir ça ! Moi qui criais, la foule qui riait, et ce petit bonhomme, calme comme l'eau, qui tend son sachet...",
      },
      {
        speaker: "Vieux Dago",
        text: "Et le mouton, cette bête ingrate qui m'avait fait courir tout le marché, qui s'approche tout doux, comme un agneau !",
      },
      {
        speaker: "Sa femme",
        text: "(riant) Comme un agneau... c'est bien un mouton, mon mari.",
      },
      {
        speaker: "Vieux Dago",
        text: "Femme... aujourd'hui, ce n'est pas le mouton qui était à vendre. C'est moi qui ai été mené en bateau par ma propre fierté.",
      },
      {
        speaker: "Narrateur",
        text: "Sa femme rit doucement, lui tendit une calebasse d'eau fraîche, et le laissa raconter, encore une fois, l'histoire du mouton rebelle.",
      },
      {
        speaker: "Narrateur",
        text: "Et dans la nuit tombante de Kokodji, on entendait encore, entre deux rires, le récit sans fin du mouton rebelle.",
      },
    ],
  },
];

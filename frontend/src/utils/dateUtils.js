/**
 * Calculer les dates d'une semaine ISO
 * @param {number} year 
 * @param {number} week 
 * @returns {{ monday: Date, sunday: Date }}
 */
export const getWeekDates = (year, week) => {
  // Trouver le premier jeudi de l'année (définition ISO 8601)
  const jan4 = new Date(year, 0, 4);
  const firstThursday = new Date(jan4);
  firstThursday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + 3);

  // Calculer le lundi de la semaine 1
  const weekOneMonday = new Date(firstThursday);
  weekOneMonday.setDate(firstThursday.getDate() - 3);

  // Calculer le lundi de la semaine demandée
  const monday = new Date(weekOneMonday);
  monday.setDate(weekOneMonday.getDate() + (week - 1) * 7);

  // Calculer le dimanche
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { monday, sunday };
};

/**
 * Formater une date en format court
 * @param {Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

/**
 * Formater une date en format complet
 * @param {Date} date 
 * @returns {string}
 */
export const formatDateFull = (date) => {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Obtenir le texte d'une semaine avec dates
 * @param {number} year 
 * @param {number} week 
 * @returns {string}
 */
export const getWeekText = (year, week) => {
  const { monday, sunday } = getWeekDates(year, week);
  return `Semaine ${week} : ${formatDate(monday)} - ${formatDate(sunday)} ${year}`;
};

/**
 * Obtenir la semaine ISO actuelle
 * @returns {number}
 */
export const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
};

/**
 * Obtenir l'année actuelle
 * @returns {number}
 */
export const getCurrentYear = () => {
  return new Date().getFullYear();
};
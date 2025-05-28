
import { Season } from '../types';

/**
 * Determina a estação do ano brasileira para uma data específica.
 * As datas de transição são aproximadas e seguem o padrão do Hemisfério Sul.
 * - Verão: 21 de Dezembro a 20 de Março
 * - Outono: 21 de Março a 20 de Junho
 * - Inverno: 21 de Junho a 22 de Setembro
 * - Primavera: 23 de Setembro a 20 de Dezembro
 * @param date A data para a qual a estação será determinada.
 * @returns A estação do ano ('Verão', 'Outono', 'Inverno', 'Primavera').
 */
export const getBrazilianSeason = (date: Date): Season => {
  const month = date.getMonth() + 1; // getMonth() é 0-indexado, então +1 para 1-12
  const day = date.getDate();

  // Verão (Summer): December 21 to March 20
  if ((month === 12 && day >= 21) || (month === 1) || (month === 2) || (month === 3 && day <= 20)) {
    return 'Verão';
  }
  // Outono (Autumn): March 21 to June 20
  if ((month === 3 && day >= 21) || (month === 4) || (month === 5) || (month === 6 && day <= 20)) {
    return 'Outono';
  }
  // Inverno (Winter): June 21 to September 22
  if ((month === 6 && day >= 21) || (month === 7) || (month === 8) || (month === 9 && day <= 22)) {
    return 'Inverno';
  }
  // Primavera (Spring): September 23 to December 20
  // Esta condição cobre o restante das datas, atuando como um "else".
  return 'Primavera';
};

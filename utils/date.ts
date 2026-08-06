/**
 * Utilitários centralizados de data/hora.
 * Usados por Header, Footer, AlertsContext e telas de sensor.
 */

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

/** Formata uma data como dd/mm/aaaa */
export function formatDate(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Formata uma data como hh:mm:ss */
export function formatTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Retorna a hora atual (hh:mm:ss) como string */
export function timeNow() {
  return formatTime(new Date());
}

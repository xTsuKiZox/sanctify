declare module "sanctify" {
  /**
   * Function to create commands to use Sanctify. This function must be called in your bot's ready.
   * @param {object} client Client Recover from Discord
   * @param {string} lang Language used for your server you choose | fr/en
   */
  export function createCommandesSanctify(client: object, lang: string): void;
  /**
   * Machine function required to use Sanctify.
   * @param {object} client Client Recover from Discord
   * @param {string} lang Language used for your server you choose | fr/en
   */
  export function engineCommandeSanctify(client: object, lang: string): void;
  /**
   * Retrieve all database values
   */
  export function getDataDatabaseSanctify(): void;
}

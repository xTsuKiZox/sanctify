const { QuickDB } = require('quick.db');
const db = new QuickDB();

//#region ADDWARN
/**
 * Added a warning to a user.
 * @param {string} guildId - Server ID.
 * @param {string} userId - ID of the user who was warned.
 * @param {string} reason - Reason for the warning.
 * @param {string} whoIssuer - Person who warned the member
 */
async function addWarn(guildId, userId, reason, whoIssuer) {
    const warns = await db.get(`${guildId}.warns.${userId}`) || [];
    const warnId = warns.length > 0 ? warns[warns.length - 1].id + 1 : 1;
    warns.push({ id: warnId, reason: reason, date: Math.floor(Date.now() / 1000), who: whoIssuer });
    await db.set(`${guildId}.warns.${userId}`, warns);
}
//#endregion ADDWARN

//#region GETWARN
/**
 * Retrieves a user's warnings.
 * @param {string} guildId - Server ID.
 * @param {string} userId - User ID.
 */
async function getWarns(guildId, userId) {
    return await db.get(`${guildId}.warns.${userId}`) || [];
}
//#endregion GETWARN

//#region CLEARALLWARN
/**
 * Removes all warns from a user.
 * @param {string} guildId - Server ID.
 * @param {string} userId - User ID.
 */
async function clearAllWarns(guildId, userId) {
    await db.delete(`${guildId}.warns.${userId}`);
    return { id: 4 };
}
//#endregion CLEARALLWARN

//#region CLEARWARN
/**
 * Removes a specific warn from a user by warn ID.
 * @param {string} guildId - Server ID.
 * @param {string} userId - User ID.
 * @param {number} warnId - Warn ID.
 */
async function clearWarn(guildId, userId, warnId) {
    const warns = await db.get(`${guildId}.warns.${userId}`) || [];
    if (warns.length === 0) {
        return { id: 1 };
    } else {
        let newValueWarnId = parseInt(warnId)
        const newWarns = warns.filter(warn => warn.id === newValueWarnId);
        if (newWarns.length === 0) {
            return { id: 2 };
        } else {
            const updatedWarns = warns.filter(warn => warn.id !== newValueWarnId);
            await db.set(`${guildId}.warns.${userId}`, updatedWarns);
            return { id: 3 };
        }
    }
}
//#endregion CLEARWARN

//#region GETALLDATADATABASE
/**
 * Retrieve all database values
 */
async function getDataDatabaseSanctify() {
    const allData = await db.all();
    console.log("All data in the database:");
    console.log(allData);
}
//#endregion GETALLDATADATABASE

//#region CLEARDATABASE
/**
 *Function to delete all entries from the Quick.DB database
 */
async function clearDatabase() {
    try {
        // Récupérer toutes les clés dans la base de données
        const allKeys = await db.all();

        if (allKeys.length === 0) {
            console.log("La base de données est déjà vide.");
            return;
        }

        // Supprimer chaque clé
        for (const entry of allKeys) {
            await db.delete(entry.id);
        }

        console.log("Toutes les entrées de la base de données ont été supprimées.");
    } catch (error) {
        console.error("Une erreur est survenue lors de la suppression des données :", error);
    }
}
//#endregion CLEARDATABASE

//#region HAVEPERMISSION
/**
 * Checks if the user has administrative permissions.
 * @param {object} client - The client object.
 * @param {string} guildId - Server ID.
 * @param {string} userId - User ID.
 * @returns {boolean} - True if the user has administrative permissions, false otherwise.
 */
async function havePermission(client, guildId, userId) {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    const warnRoles = await db.get(`${guildId}.warnrole`) || [];
    const hasWarnRole = warnRoles.some(roleId => member.roles.cache.has(roleId));
    const hasAdminPermission = member.permissions.has('ADMINISTRATOR');

    return hasWarnRole || hasAdminPermission;
}
//#endregion HAVEPERMISSION

//#region SETROLE
/**
 * Sets the warn role for a guild.
 * @param {string} guildId - Server ID.
 * @param {string} roleId - Role ID.
 */
async function setRole(guildId, roleId) {
    const roles = await db.get(`${guildId}.warnrole`) || [];
    if (!roles.includes(roleId)) {
        roles.push(roleId);
        await db.set(`${guildId}.warnrole`, roles);
    }
}
//#endregion SETROLE

//#region DELETEROLE
/**
 * Deletes a role from the warn roles.
 * @param {string} guildId - Server ID.
 * @param {string} roleId - Role ID.
 */
async function deleteRole(guildId, roleId) {
    const roles = await db.get(`${guildId}.warnrole`) || [];
    const newRoles = roles.filter(id => id !== roleId);
    await db.set(`${guildId}.warnrole`, newRoles);
}
//#endregion DELETEROLE

//#region EXPORT
module.exports = { addWarn, getWarns, clearWarn, clearAllWarns, getDataDatabaseSanctify, clearDatabase, havePermission, setRole, deleteRole };
//#endregion EXPORT
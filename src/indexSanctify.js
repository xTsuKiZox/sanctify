//#region CONSTRUCTOR
const {
    EmbedBuilder
} = require('discord.js');
const langSTF = require('./langs.json');
const { addWarn, getWarns, clearWarn, clearAllWarns, getDataDatabaseSanctify, clearDatabase, havePermission, setRole, deleteRole } = require('./databaseSanctify.js');
const fs = require("fs");
const path = require("path");
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const commandsSanctify = ["warn", "warnings", "clearwarns", "setwarnrole", "deletewarnrole"];
//#endregion CONSTRUCTOR

//#region CLEARWARNS
/**
 * Function surrounding the "clearwarns" command.
 * @param {object} client Client Recover from Discord
 * @param {object} interaction Interaction Recover from Discord
 * @param {string} lang Language used for your server you choose | fr/en
*/
async function clearwarns(client, interaction, lang) {
    if (havePermission(client, interaction.member.guild.id, interaction.user.id)) {
        let userWarn = interaction.options.getUser("user")
        let idWarn = interaction.options.getString("id")
        let allWarn = interaction.options.getString("all")

        if (userWarn && !idWarn && !allWarn) {
            interaction.reply({
                content: langSTF[lang].clearwarns.command[0],
                ephemeral: true
            })
        } else if (idWarn && !allWarn) {
            let returnValue = await clearWarn(interaction.member.guild.id, userWarn.id, idWarn, lang)

            if (returnValue.id === 1) {
                interaction.reply({
                    content: langSTF[lang].clearwarns.command[1],
                    ephemeral: true
                })
            } else if (returnValue.id === 2) {
                interaction.reply({
                    content: langSTF[lang].clearwarns.command[2],
                    ephemeral: true
                })
            } else if (returnValue.id === 3) {
                interaction.reply({
                    content: langSTF[lang].clearwarns.command[3],
                    ephemeral: true
                })
            }
        } else if (!idWarn && allWarn === "yes") {
            let returnValue = await clearAllWarns(interaction.member.guild.id, userWarn.id)

            if (returnValue.id === 4) {
                interaction.reply({
                    content: langSTF[lang].clearwarns.command[4],
                    ephemeral: true
                })
            }
        } else if (idWarn && allWarn === "yes") {
            interaction.reply({
                content: langSTF[lang].clearwarns.command[5],
                ephemeral: true
            })
        }
    } else {
        interaction.reply({ content: langSTF[lang].error[2], ephemeral: true });
    }
}
//#endregion CLEARWARNS

//#region DELETEWARNROLE
/**
 * Function surrounding the "deletewarnrole" command.
 * @param {object} client Client Recover from Discord
 * @param {object} interaction Interaction Recover from Discord
 * @param {string} lang Language used for your server you choose | fr/en
*/
async function deletewarnrole(client, interaction, lang) {
    if (havePermission(client, interaction.member.guild.id, interaction.user.id)) {
        let roleWarn = interaction.options.getRole("role");
        let dbRole = await db.get(`${interaction.member.guild.id}.warnrole`);
        if (!Array.isArray(dbRole)) {
            dbRole = [];
        }
        let roleExists = dbRole.some(role => role === roleWarn.id);

        if (roleExists) {
            await deleteRole(interaction.member.guild.id, roleWarn.id);
            interaction.reply({ content: `${langSTF[lang].deletewarnrole.command[0]} <@&${roleWarn.id}> ${langSTF[lang].deletewarnrole.command[2]}`, ephemeral: true });
        } else {
            interaction.reply({ content: `${langSTF[lang].deletewarnrole.command[0]} <@&${roleWarn.id}> ${langSTF[lang].deletewarnrole.command[1]}`, ephemeral: true });
        }
    } else {
        interaction.reply({ content: langSTF[lang].error[2], ephemeral: true });
    }
}
//#endregion DELETEWARNROLE

//#region SETWARNROLE
/**
 * Function surrounding the "setwarnrole" command.
 * @param {object} client Client Recover from Discord
 * @param {object} interaction Interaction Recover from Discord
 * @param {string} lang Language used for your server you choose | fr/en
*/
async function setwarnrole(client, interaction, lang) {
    if (havePermission(client, interaction.member.guild.id, interaction.user.id)) {
        let roleWarn = interaction.options.getRole("role");
        let dbRole = await db.get(`${interaction.member.guild.id}.warnrole`);
        if (!Array.isArray(dbRole)) {
            dbRole = [];
        }
        let roleExists = dbRole.some(role => role === roleWarn.id);
        if (roleExists) {
            interaction.reply({ content: `${langSTF[lang].setwarnrole.command[0]} <@&${roleWarn.id}> ${langSTF[lang].setwarnrole.command[1]}`, ephemeral: true });
        } else {
            await setRole(interaction.member.guild.id, roleWarn.id);
            interaction.reply({ content: `${langSTF[lang].setwarnrole.command[0]} <@&${roleWarn.id}> ${langSTF[lang].setwarnrole.command[2]}`, ephemeral: true });
        }
    } else {
        interaction.reply({ content: langSTF[lang].error[2], ephemeral: true });
    }
}
//#endregion SETWARNROLE

//#region WARN
/**
 * Function surrounding the "warn" command.
 * @param {object} client Client Recover from Discord
 * @param {object} interaction Interaction Recover from Discord
 * @param {string} lang Language used for your server you choose | fr/en
*/
async function warn(client, interaction, lang) {
    if (havePermission(client, interaction.member.guild.id, interaction.user.id)) {
        let userWarn = interaction.options.getUser("user")
        if (interaction.user.id === userWarn.id) {
            interaction.reply({ content: langSTF[lang].warn.command[7], ephemeral: true });
        } else {
            if (userWarn.bot === false) {
                let server = {
                    id: interaction.member.guild.id,
                    name: interaction.member.guild.name,
                    icon: interaction.guild.iconURL(),
                }
                let reasonWarn = interaction.options.getString("reason") || "No reason provided";
                let privateMessage = interaction.options.getString("privatemessage") || "yes";
                let hideTheIssuer = interaction.options.getString("hidetheissuer") || "no";
                let ActiveMP

                const userWarnEmbed = new EmbedBuilder()
                    .setTitle(langSTF[lang].warn.command[0])
                    .setDescription(`${langSTF[lang].warn.command[1]} **${server.name}**`)
                    .setThumbnail(server.icon)
                    .addFields(
                        {
                            name: langSTF[lang].warn.command[2],
                            value: `\`${reasonWarn}\``
                        })
                    .setColor("#ff0000")
                    .setTimestamp()
                    .setFooter({ text: `${client.user.username}`, iconURL: client.user.avatarURL() });


                if (hideTheIssuer === "no") {
                    userWarnEmbed.addFields(
                        {
                            name: langSTF[lang].tools[3],
                            value: `<@${interaction.user.id}>`
                        });
                }

                addWarn(server.id, userWarn.id, reasonWarn, interaction.user.id);

                if (privateMessage === "yes") {
                    try {
                        const user = await client.users.fetch(userWarn.id, false);
                        await user.send({ embeds: [userWarnEmbed] });
                        ActiveMP = true;
                    } catch (error) {
                        ActiveMP = false;
                    }
                }

                let issuerMessage = `${langSTF[lang].warn.command[3]} <@${userWarn.id}> ${langSTF[lang].warn.command[4]} **${reasonWarn}** !`;

                if (ActiveMP === false) {
                    issuerMessage += langSTF[lang].warn.command[5]
                } else if (ActiveMP === true) {
                    issuerMessage += langSTF[lang].warn.command[6]
                }

                interaction.reply({ content: issuerMessage, ephemeral: true });
            } else {
                interaction.reply({ content: langSTF[lang].error[3], ephemeral: true });
            }
        }
    } else {
        interaction.reply({ content: langSTF[lang].error[3], ephemeral: true });
    }
}
//#endregion WARN

//#region WARNINGS
/**
 * Function surrounding the "warnings" command.
 * @param {object} client Client Recover from Discord
 * @param {object} interaction Interaction Recover from Discord
 * @param {string} lang Language used for your server you choose | fr/en
*/
async function warnings(client, interaction, lang) {
    if (havePermission(client, interaction.member.guild.id, interaction.user.id)) {
        let userWarn = interaction.options.getUser("user")
        if (userWarn.bot === false) {
            let userGetWarn = await getWarns(interaction.member.guild.id, userWarn.id)
            if (userGetWarn.length > 0) {
                const warningsPerPage = 5;
                const totalPages = Math.ceil(userGetWarn.length / warningsPerPage);
                let page = interaction.options.getInteger("page") || 1;

                if (page < 1) page = 1;
                if (page > totalPages) page = totalPages;

                const start = (page - 1) * warningsPerPage;
                const end = start + warningsPerPage;
                const warningsToShow = userGetWarn.slice(start, end);

                const embed = new EmbedBuilder()
                    .setTitle(`${langSTF[lang].warnings.command[0]} ${userWarn.username}`)
                    .setColor("#ff0000")
                    .setTimestamp()
                    .setFooter({ text: `${client.user.username}`, iconURL: client.user.avatarURL() });

                warningsToShow.forEach((warn) => {
                    embed.addFields({
                        name: '\u200B',
                        value: `📅 **<t:${warn.date}:f>**\nℹ️ ${langSTF[lang].warnings.command[1]}\`${warn.id}\` - **${langSTF[lang].warnings.command[2]}** <@${warn.who}>\n\n\`${warn.reason}\`\n\u200B`,
                        inline: false
                    });
                });

                embed.setDescription(`${langSTF[lang].warnings.command[3]} ${page}/${totalPages}`);

                interaction.reply({ embeds: [embed], ephemeral: false });
            } else {
                interaction.reply({ content: langSTF[lang].warnings.command[4], ephemeral: true });
            }
        } else {
            interaction.reply({ content: langSTF[lang].error[3], ephemeral: true });
        }
    } else {
        interaction.reply({ content: langSTF[lang].error[3], ephemeral: true });
    }
}
//#endregion WARNINGS

//#region CREATECOMMANDSSANCTIFY
/**
 * Function to create commands to use Sanctify. To be used only once. This function must be called in your bot's ready.
 * @param {object} client Client Recover from Discord
 * @param {string} lang Language used for your server you choose | fr/en
*/
function createCommandesSanctify(client, lang) {
    if (!client) {
        throw new Error(
            "The `client` parameter are required in the createCommandesSanctify function call"
        );
    }
    if (typeof subcommand !== "boolean") {
        throw new Error(
            "The parameter `subcommand` is required as well as a boolean value in the function call createCommandesSanctify"
        );
    }
    if (!lang) {
        throw new Error(
            "The `lang` parameter are required in the createCommandesSanctify function call"
        );
    }
    if (langSTF[lang]) {
        client.application.commands.fetch().then(commands => {
            const commandWarn = commands.some(command => command.name === commandsSanctify[0]);
            const commandWarnings = commands.some(command => command.name === commandsSanctify[1]);
            const commandClearWarn = commands.some(command => command.name === commandsSanctify[2]);
            const commandSetWarnRole = commands.some(command => command.name === commandsSanctify[3]);
            const commandDeleteWarnRole = commands.some(command => command.name === commandsSanctify[4]);

            if (commandWarn) {
                console.log(`${langSTF[lang].tools[0]} ${commandsSanctify[0]} ${langSTF[lang].tools[1]}`);
            } else {
                console.log(`${langSTF[lang].tools[0]} ${commandsSanctify[0]} ${langSTF[lang].tools[2]}`);
                client.application.commands.create({
                    name: langSTF.en.warn.applications[0],
                    name_localizations: {
                        fr: langSTF.fr.warn.applications[0],
                    },
                    description: langSTF.en.warn.applications[1],
                    description_localizations: {
                        fr: langSTF.fr.warn.applications[1],
                    },
                    options: [
                        {
                            name: langSTF.en.warn.applications[2],
                            description: langSTF.en.warn.applications[3],
                            name_localizations: ({
                                fr: langSTF.fr.warn.applications[2],
                            }),
                            description_localizations: ({
                                fr: langSTF.fr.warn.applications[3],
                            }),
                            type: 6,
                            required: true,
                        },
                        {
                            name: langSTF.en.warn.applications[4],
                            description: langSTF.en.warn.applications[5],
                            name_localizations: ({
                                fr: langSTF.fr.warn.applications[4],
                            }),
                            description_localizations: ({
                                fr: langSTF.fr.warn.applications[5],
                            }),
                            type: 3,
                            required: false,
                        },
                        {
                            name: langSTF.en.warn.applications[6],
                            description: langSTF.en.warn.applications[7],
                            name_localizations: ({
                                fr: langSTF.fr.warn.applications[6],
                            }),
                            description_localizations: ({
                                fr: langSTF.fr.warn.applications[7],
                            }),
                            type: 3,
                            required: false,
                            choices: [
                                {
                                    name: langSTF.en.warn.applications[8],
                                    name_localizations: ({
                                        fr: langSTF.fr.warn.applications[8],
                                    }),
                                    value: "yes"
                                },
                                {
                                    name: langSTF.en.warn.applications[9],
                                    name_localizations: ({
                                        fr: langSTF.fr.warn.applications[9],
                                    }),
                                    value: "no"
                                }
                            ]
                        },
                        {
                            name: langSTF.en.warn.applications[10],
                            description: langSTF.en.warn.applications[11],
                            name_localizations: ({
                                fr: langSTF.fr.warn.applications[10],
                            }),
                            description_localizations: ({
                                fr: langSTF.fr.warn.applications[11],
                            }),
                            type: 3,
                            required: false,
                            choices: [
                                {
                                    name: langSTF.en.warn.applications[8],
                                    name_localizations: ({
                                        fr: langSTF.fr.warn.applications[8],
                                    }),
                                    value: "yes"
                                },
                                {
                                    name: langSTF.en.warn.applications[9],
                                    name_localizations: ({
                                        fr: langSTF.fr.warn.applications[9],
                                    }),
                                    value: "no"
                                }
                            ]
                        }
                    ]
                });
            }

            if (commandWarnings) {
                console.log(`${langSTF[lang].tools[0]} ${commandsSanctify[1]} ${langSTF[lang].tools[1]}`);
            } else {
                console.log(`${langSTF[lang].tools[0]} ${commandsSanctify[1]} ${langSTF[lang].tools[2]}`);
                client.application.commands.create({
                    name: langSTF.en.warnings.applications[0],
                    name_localizations: {
                        fr: langSTF.fr.warnings.applications[0],
                    },
                    description: langSTF.en.warnings.applications[1],
                    description_localizations: {
                        fr: langSTF.fr.warnings.applications[1],
                    },
                    options: [
                        {
                            name: langSTF.en.warnings.applications[2],
                            description: langSTF.en.warnings.applications[3],
                            name_localizations: ({
                                fr: langSTF.fr.warnings.applications[2],
                            }),
                            description_localizations: ({
                                fr: langSTF.fr.warnings.applications[3],
                            }),
                            type: 6,
                            required: true,
                        },
                        {
                            name: langSTF.en.warnings.applications[4],
                            description: langSTF.en.warnings.applications[5],
                            name_localizations: ({
                                fr: langSTF.fr.warnings.applications[4],
                            }),
                            description_localizations: ({
                                fr: langSTF.fr.warnings.applications[5],
                            }),
                            type: 3,
                            required: false,
                        }
                    ]
                });
            }

            if (commandClearWarn) {
                console.log(`${langSTF[lang].tools[0]} ${commandsSanctify[2]} ${langSTF[lang].tools[1]}`);
            } else {
                console.log(`${langSTF[lang].tools[0]} ${commandsSanctify[2]} ${langSTF[lang].tools[2]}`);
                client.application.commands.create({
                    name: langSTF.en.clearwarns.applications[0],
                    name_localizations: {
                        fr: langSTF.fr.clearwarns.applications[0],
                    },
                    description: langSTF.en.clearwarns.applications[1],
                    description_localizations: {
                        fr: langSTF.fr.clearwarns.applications[1],
                    },
                    options: [
                        {
                            name: langSTF.en.clearwarns.applications[2],
                            description: langSTF.en.clearwarns.applications[3],
                            name_localizations: ({
                                fr: langSTF.fr.clearwarns.applications[2],
                            }),
                            description_localizations: ({
                                fr: langSTF.fr.clearwarns.applications[3],
                            }),
                            type: 6,
                            required: true,
                        },
                        {
                            name: langSTF.en.clearwarns.applications[4],
                            description: langSTF.en.clearwarns.applications[5],
                            name_localizations: ({
                                fr: langSTF.fr.clearwarns.applications[4],
                            }),
                            description_localizations: ({
                                fr: langSTF.fr.clearwarns.applications[5],
                            }),
                            type: 3,
                            required: false,
                        }
                        ,
                        {
                            name: langSTF.en.clearwarns.applications[6],
                            description: langSTF.en.clearwarns.applications[7],
                            name_localizations: ({
                                fr: langSTF.fr.clearwarns.applications[6],
                            }),
                            description_localizations: ({
                                fr: langSTF.fr.clearwarns.applications[7],
                            }),
                            type: 3,
                            required: false,
                            choices: [
                                {
                                    name: langSTF.en.clearwarns.applications[8],
                                    name_localizations: ({
                                        fr: langSTF.fr.clearwarns.applications[8],
                                    }),
                                    value: "yes"
                                },
                                {
                                    name: langSTF.en.clearwarns.applications[9],
                                    name_localizations: ({
                                        fr: langSTF.fr.clearwarns.applications[9],
                                    }),
                                    value: "no"
                                }
                            ]
                        }
                    ]
                });
            }

            if (commandSetWarnRole) {
                console.log(`${langSTF[lang].tools[0]} ${commandsSanctify[3]} ${langSTF[lang].tools[1]}`);
            } else {
                console.log(`${langSTF[lang].tools[0]} ${commandsSanctify[3]} ${langSTF[lang].tools[2]}`);
                client.application.commands.create({
                    name: langSTF.en.setwarnrole.applications[0],
                    name_localizations: {
                        fr: langSTF.fr.setwarnrole.applications[0],
                    },
                    description: langSTF.en.setwarnrole.applications[1],
                    description_localizations: {
                        fr: langSTF.fr.setwarnrole.applications[1],
                    },
                    options: [
                        {
                            name: langSTF.en.setwarnrole.applications[2],
                            description: langSTF.en.setwarnrole.applications[3],
                            name_localizations: ({
                                fr: langSTF.fr.setwarnrole.applications[2],
                            }),
                            description_localizations: ({
                                fr: langSTF.fr.setwarnrole.applications[3],
                            }),
                            type: 8,
                            required: true,
                        },
                    ]
                });
            }

            if (commandDeleteWarnRole) {
                console.log(`${langSTF[lang].tools[0]} ${commandsSanctify[4]} ${langSTF[lang].tools[1]}`);
            } else {
                console.log(`${langSTF[lang].tools[0]} ${commandsSanctify[4]} ${langSTF[lang].tools[2]}`);
                client.application.commands.create({
                    name: langSTF.en.deletewarnrole.applications[0],
                    name_localizations: {
                        fr: langSTF.fr.deletewarnrole.applications[0],
                    },
                    description: langSTF.en.deletewarnrole.applications[1],
                    description_localizations: {
                        fr: langSTF.fr.deletewarnrole.applications[1],
                    },
                    options: [
                        {
                            name: langSTF.en.deletewarnrole.applications[2],
                            description: langSTF.en.deletewarnrole.applications[3],
                            name_localizations: ({
                                fr: langSTF.fr.deletewarnrole.applications[2],
                            }),
                            description_localizations: ({
                                fr: langSTF.fr.deletewarnrole.applications[3],
                            }),
                            type: 8,
                            required: true,
                        },
                    ]
                });
            }
        }).catch(langSTF[lang].error[1], console.error);
    }
}
//#endregion CREATECOMMANDSSANCTIFY

//#region ENGINECOMMANDESANCTIFY
/**
 * Machine function required to use Sanctify.
 * @param {object} client Client Recover from Discord
 * @param {string} lang Language used for your server you choose | fr/en
*/
function engineCommandeSanctify(client, lang) {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        if (interaction.commandName === commandsSanctify[0]) {
            warn(client, interaction, lang);
        } else if (interaction.commandName === commandsSanctify[1]) {
            warnings(client, interaction, lang);
        } else if (interaction.commandName === commandsSanctify[2]) {
            clearwarns(client, interaction, lang);
        }
        else if (interaction.commandName === commandsSanctify[3]) {
            setwarnrole(client, interaction, lang);
        }
        else if (interaction.commandName === commandsSanctify[4]) {
            deletewarnrole(client, interaction, lang);
        }
    });
}
//#endregion ENGINECOMMANDESANCTIFY

//#region EXPORT
module.exports = { createCommandesSanctify, getDataDatabaseSanctify, engineCommandeSanctify, clearDatabase };
//#endregion EXPORT
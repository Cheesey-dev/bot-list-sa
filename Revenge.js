const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs')
const http = require('http')
const express = require('express')
const ayarlar = require('./ayarlar.json')
const app = express()
const db = require('quick.db')
const moment = require('moment')
require('moment-duration-format')
moment.locale('tr')
const Peppe = message => {
  console.log(`${message}`)
}

client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
fs.readdir('./komutlar/', (Error, Files) => {
    if (Error) console.error(Error)
    Peppe(`${Files.length} Komut Yüklenecek!`)
    Files.forEach(Pepe => {
        let Props = require(`./komutlar/${Pepe}`)
        Peppe(`Yüklenen Komut: ${Props.help.name}.`)
        client.commands.set(Props.help.name, Props)
        Props.conf.aliases.forEach(Alias => {
        client.aliases.set(Alias, Props.help.name)
})})})

client.reload = command => {
 return new Promise((Resolve, Reject) => {
 try {
 delete require.cache[require.resolve(`./komutlar/${command}`)]
 let CMD = require(`./komutlar/${command}`)
 client.commands.delete(command)
 client.aliases.forEach((CMD, Alias) => {
 if (CMD === command) client.aliases.delete(Alias)
 })
 client.commands.set(command, CMD)
 CMD.conf.aliases.forEach(Alias => {
 client.aliases.set(Alias, CMD.help.name)
 })
 Resolve()
 } catch (Hata) {
 Reject(Hata)
}})}

client.load = command => {
 return new Promise((Resolve, Reject) => {
 try {
 let CMD = require(`./komutlar/${command}`)
client.commands.set(command, CMD)
CMD.conf.aliases.forEach(Alias => {
client.aliases.set(Alias, CMD.help.name)
})
Resolve()
} catch (Hata) {
Reject(Hata)
}})}

client.unload = command => {
 return new Promise((Resolve, Reject) => {
 try {
 delete require.cache[require.resolve(`./komutlar/${command}`)]
 let CMD = require(`./komutlar/${command}`)
 client.commands.delete(command)
 client.aliases.forEach((CMD, Alias) => {
 if (CMD === command) client.aliases.delete(Alias)
 })
 Resolve()
 } catch (Hata) {
 Reject(Hata)
}})}
// RevengeNYKS \\
client.on('message',async message => {
  let client = message.client
  if (message.author.bot) return
  if (!message.content.startsWith(ayarlar.prefix)) return
  let command = message.content.split(' ')[0].slice(ayarlar.prefix.length)
  let params = message.content.split(' ').slice(1)
  let perms = client.elevation(message) 
  let cmd
  if (client.commands.has(command)) {
    cmd = client.commands.get(command)
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command))
  }
  if (cmd) {
    if (perms < cmd.conf.permLevel) return
    cmd.run(client, message, params, perms)
  }
if (message.channel.id == ayarlar.BOTLog && message.author.id !== client.user.id) return message.delete()
})
// [ ----------------------------------------------] \\
// [ ----------------------------------------------] \\
// [ ----------------------------------------------] \\
client.on('guildMemberAdd',async member => {
if (member.user.bot && db.has(`Ekledi_${member.id}`)) {
const BOTEkleyen = await db.fetch(`Ekledi_${member.id}`)
client.channels.cache.get(ayarlar.BOTModKanal).messages.fetch({around: db.fetch(`Mesaj_${member.id}`), limit:1}).then(async REmbed => {
const Embed = REmbed.first().delete()
})
const Log = await member.guild.fetchAuditLogs({type: 'BOT_ADD'}).then(Audit => Audit.entries.first())
client.guilds.cache.get(member.guild.id).members.cache.get(BOTEkleyen).roles.add(ayarlar.GeliştiriciRolü)
const Embed = new Discord.MessageEmbed()
.setColor('BLUE')
.setTitle('🎉 Müjde!')
.setDescription(`🎉 Tebrikler! \`${member.guild.name}\` Adlı Sunucuda Sırada Olan \`${client.users.cache.get(member.id).tag}\` Adlı Botunuz \`${client.users.cache.get(Log.executor.id).tag}\` Tarafından Onaylandı! (Sunucudan Çıkarsan Atılacaktır.)`)
.setThumbnail(member.user.avatarURL())
.setFooter(member.guild.name+'・'+member.guild.memberCount,member.guild.iconURL({dynamic:true}))
client.users.cache.get(BOTEkleyen).send(`<@${BOTEkleyen}>`,Embed)
client.channels.cache.get(ayarlar.BOTLog).send(`**<@${BOTEkleyen}> Adlı Kullanıcının \`${client.users.cache.get(member.id).tag}\` Adlı Sistemde Onay Bekleyen Botu \`${client.users.cache.get(Log.executor.id).tag} [${db.fetch(`Count_${Log.executor.id}`) || 1}]\` Tarafından Kabul Edildi.**`)
db.add(`Count_${Log.executor.id}`,1)
member.roles.add('820331331753607269') // BOT Rol ID
} else {
member.roles.add('820331082406560775') // Üye Rol ID
}
})
// [ ----------------------------------------------] \\
// [ ----------------------------------------------] \\
// [ ----------------------------------------------] \\
client.on('ready',async () => {
client.user.setActivity('Eklenen Botları',{ type: 'WATCHING'})
client.channels.cache.get(ayarlar.SesKanalı).join()
console.log(`${client.user.username} Aktif!`)
})
// [ ----------------------------------------------] \\
// [ ----------------------------------------------] \\
// [ ----------------------------------------------] \\
client.on('guildMemberRemove', async member => {
const BOTDurum = await db.fetch(`BOT_${member.id}`)
if (BOTDurum) {
client.users.fetch(BOTDurum).then(async(User) => {
client.guilds.cache.get(member.guild.id).members.cache.get(await db.fetch(`BOT_${member.id}`)).kick()
client.channels.cache.get(ayarlar.BOTLog).send(`\`${member.user.tag}\` Sunucudan Ayrıldı. \`${User.tag}\` Adındaki Botunu Attım 👌`)
db.delete(`BOT_${member.id}`)
})
}
})
// [ ----------------------------------------------] \\
// [ ----------------------------------------------] \\
// [ ----------------------------------------------] \\
client.on('voiceStateUpdate', async (Code, Pepe) => {
if (Pepe.member.user.bot && Pepe.channelID && Pepe.member.user.id == client.user.id && !Pepe.selfDeaf) {
Pepe.setSelfDeaf(false)
}
if (Pepe.member.user.bot && Pepe.channelID && Pepe.member.user.id == client.user.id && !Pepe.selfMute) {
Pepe.setSelfMute(false)
}
})
// [ ----------------------------------------------] \\
// [ ----------------------------------------------] \\
// [ ----------------------------------------------] \\
client.on('messageDelete',async message => {
    const Bilgi = db.fetch(`Bilgi_${message.id}`)
    if (!Bilgi) return;
    const fetchedLogs = await message.guild.fetchAuditLogs({type: 'MESSAGE_DELETE'}).then(Audit => Audit.entries.first())
    if (fetchedLogs.executor.id == client.user.id || !client.guilds.cache.get(message.guild.id).members.cache.get(fetchedLogs.executor.id).roles.cache.find(Rol => Rol.id === ayarlar.BOTModRol)) return
    const Clientt = Bilgi.Client
    client.users.fetch(Clientt).then((Client) => {
        const Ceon = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setAuthor(client.user.tag,client.user.avatarURL())
        .setFooter(client.user.username,client.user.avatarURL())
        .setTimestamp()
        .setDescription(`❓ **| Reddetme sebebi yazınız.**`)
        client.channels.cache.get(message.channel.id).send(Ceon).then(Message => {
	     	Message.delete({timeout:15000})
            client.guilds.cache.get(message.guild.id).channels.cache.get(message.channel.id).awaitMessages(Message => Message.member.roles.cache.find(Rol => Rol.id === ayarlar.BOTModRol), {max: 1,time: 15000,errors: ['time']
            }).then(async Collected => {
            client.channels.cache.get(message.channel.id).bulkDelete(2)
            client.channels.cache.get(ayarlar.BOTLog).send(`**<@${Bilgi.Gönderen}> Adlı Kullanıcının \`${Client.tag}\` Adlı Sistemde Onay Bekleyen Botu \`${Collected.first().author.tag}\` Tarafından \`${Collected.first().content || 'Belirtilmedi'}\` Sebebiyle Reddedildi.**`)
            })
            })
    })
    })
// RevengeNYKS \\
client.elevation = message => {
    if (!message.guild) {
        return
    }
    let permlvl = 0
    if (message.member.hasPermission('BAN_MEMBERS')) permlvl = 2
    if (message.member.hasPermission('ADMINISTRATOR')) permlvl = 3
    if (message.author.id === ayarlar.sahip) permlvl = 4
    return permlvl
}

client.login(process.env.token).catch(() => console.error('(node:8295) UnhandledPromiseRejectionWarning: Hata [GEÇERSİZ_TOKEN]: Geçersiz token tespit edildi.'))
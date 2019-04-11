const fs = require('fs');
const ini = require('ini');
const axios = require('axios');
const Discord = require('discord.js');
const config = ini.parse(fs.readFileSync('./config/oauth2-stripe.ini', 'utf-8'));

// SCRIPT VARIABLES
var oauth2 = {
  "token": config.OAUTH2.token,
  "client_id": config.OAUTH2.client_id,
  "client_secret": config.OAUTH2.client_secret,
  "redirect": encodeURIComponent(config.OAUTH2.redirect),
  "base_url": `https://discordapp.com/api/`,
  "scope": config.OAUTH2.scope.replace(/,/g, '%20')
};

var eventsToDisable = ['channelCreate','channelDelete','channelPinsUpdate','channelUpdate','clientUserGuildSettingsUpdate',
  'clientUserSettingsUpdate','debug','disconnect','emojiCreate','emojiDelete','emojiUpdate','guildCreate','guildDelete',
  'guildMemberAvailable','guildMembersChunk','guildMemberSpeaking','guildMemberUpdate','guildUnavailable','guildUpdate',
  'messageDelete','messageDeleteBulk','messageReactionRemoveAll','messageUpdate','presenceUpdate','ready','reconnecting','resume',
  'roleCreate','roleDelete','roleUpdate','typingStart','typingStop','userNoteUpdate','userUpdate','voiceStateUpdate','warn'];

// DEFINE BOTS AND DISABLE ALL EVENTS TO SAVE MEMORY AND CPU
oauth2.bot = new Discord.Client({ disabledEvents: eventsToDisable });

// FETCH ACCESS TOKEN FROM DISCORD
oauth2.fetchAccessToken = (code) => {
  return new Promise(function(resolve) {
    axios.post(oauth2.base_url+`oauth2/token?client_id=${oauth2.client_id}&grant_type=authorization_code&code=${code}&redirect_uri=${oauth2.redirect}&client_secret=${oauth2.client_secret}`, {
      headers: { accept: 'application/json' },
    }).then(function(response) { return resolve(response.data);
    }).catch( error => { console.error; return resolve(error); });
  });
}

// FETCH DISCORD USER WITH ACCESS TOKEN
oauth2.fetchUser = (access_token) => {
  return new Promise(function(resolve) {
    axios.get(oauth2.base_url+`v6/users/@me`, {
      headers: { "Authorization": `Bearer ${access_token}`, "Content-Type": "application/x-www-form-urlencoded" }
    }).then(function(response) { return resolve(response.data);
    }).catch( error => { console.error; return resolve(error); });
  });
}

// FETCH DISCORD USER'S GUILDS WITH ACCESS TOKEN
oauth2.fetchUserGuilds = (access_token) => {
  return new Promise(function(resolve) {
    // FETCH USER GUILDS WITH TOKEN
    axios.get(oauth2.base_url+`v6/users/@me/guilds`, {
      headers: { "Authorization": `Bearer ${access_token}`, "Content-Type": "application/x-www-form-urlencoded" }
    }).then(async function(response) {
      let guilds = [];
      await response.data.forEach((server,index) => { guilds.push(server.id); });
      return resolve(guilds);
    }).catch( error => { console.error; return resolve(error); });
  });
}

// JOIN THE USER TO A DISCORD GUILD
oauth2.joinGuild = (bot, access_token, discord_id, user_id) => {
  bot.fetchUser(user_id).then((user) => {
    let options = { 'accessToken': access_token }
    let guild = oauth2.bot.guilds.get(discord_id);
    let member = guild.memebers.get(user_id);
    if(guild && !member){ guild.addMember(user, options); }
    return 'success';
  });
}

// NEW USER CHECK
oauth2.newUser = (guild_id) => {

}

// USER GUILDS CHECK
oauth2.userGuildsCheck = async (record) => {

  // GET CITY GUILD ID
  let guild_id = config[record.city].guild_id;

  // FETCH A LIST OF THE USER'S GUILDS
  let guilds = await oauth2.fetchUserGuilds(record.access_token);

  // JOIN THE USER TO THE DISCORD IF NOT ALREADY A MEMBER
  if(guilds.indexOf(guild_id) < 0){
    await oauth2.joinGuild(token.access_token, target_guild, user.id);
  }

  // CONVERT USER GUILD LIST TO AN ARRAY
  user_guilds = record.user_guilds.split(',');

  // CHECK FOR NEW GUILDS
  let new_guilds = '';
  guilds.forEach((guild,index) => {
    if(user_guilds.indexOf(guild) < 0){ new_guilds += guild+'\n'}
  });

  // IF NEW GUILDS ARE FOUND, UPDATE RECORDS
  if(new_guilds){

    // FETCH THE MEMBER OBJECT
    let member = bot.guilds.get(guild_id).memebers.get(record.id);

    // FETCH MEMBER NICKNAME
    if(member.nickname){ user_name = member.nickname; } else{ user_name = member.user.username; }

    // UPDATE DB RECORD FOR USER
    // DATABASE QUERY FUNCTION HERE

    // SEND NEW GUILDS TO DISCORD
    let guilds_embed = new Discord.RichEmbed()
      .setColor('#FFA533')
      .setAuthor(user_name+' ('+user.id+')', member.user.displayAvatarURL)
      .setTitle('User joined new guilds!')
      .setDescription('```'+new_guilds+'```')
      .setFooter(server.getTime('footer'));
    oauth2.bot.channels.get(config[record.city].user_info_channel).send(guilds_embed).catch(console.error);
  }
}

// USER ACCESS TOKEN REFRESH
oauth2.userRefresh = (record) => {

}

// USER DONOR CHECK
oauth2.userDonorCheck = (record) => {

  // GET CITY GUILD ID
  let guild_id = config[record.city].guild_id;

  // FETCH THE GUILD MEMBER
  let member = oauth2.bot.guilds.get(guild_id).memebers.get(record.id);

  // CHECK FOR THE DONOR ROLE
  if(member.roles.find('name',config[record.city].donor_role_name)){ return true; }
  else{ return false; }
}

// EXPORT OAUTH2
module.exports = oauth2;

// LOAD AND RUN MODULES
const oauth2 = require('./oauth2-stripe/oauth2.js');
const stripe = require('./oauth2-stripe/stripe.js');
const pokebot = require('./modules/base/bot.js');

// PACKAGE REQUIREMENTS
const bodyParser = require('body-parser');
const discord = require('discord.js');
const express = require('express');
const moment = require('moment');
const ini = require('ini');
const fs = require('fs');

// LOAD CONFIGS
const config = ini.parse(fs.readFileSync('./config/server.ini', 'utf-8'));
const target_guild = '266738315380785152';

// DEFINE THE EXPRESS SERVER
const server = express().use(express.json({ limit: "1mb" }));

// TIME FUNCTION
function getTime(type){
  switch(type){
    case 'footer': return moment().format('dddd, MMMM Do, h:mm A');
    case 'stamp': return moment().format('HH:mmA');
  }
}

// LISTEN TO THE SPECIFIED PORT FOR TRAFFIC
server.listen(config.SERVER.listening_port, () => {
  console.info('[Pokébot] [SERVER] Now Listening on port '+config.SERVER.listening_port+'.');
});

server.set('view engine', 'ejs');
server.engine('html', require('ejs').renderFile);

// CATCH ALL POST REQUESTS
server.post('/', async (webhook, resolve) => {
  return pokebot.webhookParse(webhook.body);
});

// CATCH ALL GET REQUESTS
server.get('/subscribe', async (req,res) => {
  let msg = '';
  let user = '';
  res.render(__dirname + '/oauth2-stripe/templates/subscribe.html',
    {
      key: stripe.pk,
      email: "Rusell#0101 - 012432452435343254",
      msg: msg,
      id: "012432452435343254",
      amt: stripe.plan_cost
    });
});

// LOGIN
server.get('/login', async (req,res) => {
  console.log('req.query',req.query);
  if(!req.query.id){
    res.sendFile(__dirname + '/oauth2-stripe/templates/cookie.html');
  }
  else if(req.query.id == 'noid'){
    let state = 'Tallahassee';
    res.redirect(oauth2.base_url+`oauth2/authorize?response_type=code&client_id=${oauth2.client_id}&scope=${oauth2.scope}&state=${state}&redirect_uri=${oauth2.redirect}`);
  }
  else{
    pokebot.pdb.query(`SELECT * FROM oauth2_stripe WHERE user_id = ? AND guild_id = ?`, [req.query.id, req.query.guild], async function (error, user, fields) {

      // JOIN THE USER TO THE DISCORD IF NOT ALREADY A MEMBER
      await oauth2.joinGuild(pokebot, token.access_token, target_guild, user.id);

      if(user[0]){

      }
      else{

        await oauth2.insertUser(pokebot, req.query.id, req.query.guild);
      }
    });
  } return;
});

// OAUTH2 CALLBACK
server.get('/api/discord/callback', async (req,res) => {

  // CHECK IF NEW USER WITH DB QUERY
  console.log('callback',req.query);

  // GET CURRENT TIME
  let time_now = moment().unix();

  // GRAB ACCESS TOKEN
  let token = await oauth2.fetchAccessToken(req.query.code);

  // GET GUILD ID FROM PASSED STATE
  let target_guild = config[req.query.state].guild_id;

  // SET TOKEN EXPIRATION
  token.expiration = time_now + token.expires_in;

  // FETCH THE USER IF NOT IN DATABASE
  let user = await oauth2.fetchUser(token.access_token);

  // SAVE COOKIES
  res.cookie('TallyPokeMap_ID', user.id, { maxAge: 60 });
  res.cookie('TallyPokeMap_Guild', { maxAge: 60 });

  // FETCH A LIST OF THE USER'S GUILDS
  let guilds = await oauth2.fetchUserGuilds(token.access_token);

  // JOIN THE USER TO THE DISCORD IF NOT ALREADY A MEMBER
  await oauth2.joinGuild(pokebot, token.access_token, target_guild, user.id);

  return;
});

// STRIPE
server.post('/stripe', async (req,res) => {
  return console.info('[SERVER] Received a Stripe Webhook.');
});

// STRIPE
server.post('/subscribe', async (req,res) => {
  return console.info('[SERVER] Received a Stripe Webhook.');
});

module.exports = server;

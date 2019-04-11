const fs = require('fs');
const ini = require('ini');
const axios = require('axios');
const Discord = require('discord.js');
const config = ini.parse(fs.readFileSync('./config/oauth2-stripe.ini', 'utf-8'));
conststripe_js = require('stripe')(config.STRIPE.secret_key);

const stripe = {};

stripe.pk = config.STRIPE.live_pk;
stripe.sk = config.STRIPE.live_sk;

stripe.customerList = () => {
  stripe_js.customers.list(function(err, customers) {
      console.log(customers);
    }
  );
}

stripe.webhookParse = (data) => {
  console.log(data);
}

stripe.customerList

// EXPORT OAUTH2
module.exports = stripe;

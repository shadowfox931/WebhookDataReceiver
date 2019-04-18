const Discord = require('discord.js');

module.exports.run = async (MAIN, has_iv, target, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone) => {

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.get(server.id).members.get(target.user_id);

  // GET STATIC MAP TILE
  let img_url = '';
  if(MAIN.config.Map_Tiles == 'ENABLED'){
    img_url = await MAIN.Static_Map_Tile(sighting.latitude, sighting.longitude, 'pokemon');
  }

  // DETERMINE POKEMON NAME AND FORM
  let pokemon_name = MAIN.pokemon[sighting.pokemon_id].name;
  form = sighting.form;
  let form_name = '';
  let form_str = '';
  if (form > 0){
    form_name = '['+MAIN.forms[sighting.pokemon_id][form]+'] ';
    form_str = MAIN.forms[sighting.pokemon_id][form] + ' ';
  }

  // DEFINE VARIABLES
  let hide_time = await MAIN.Bot_Time(sighting.disappear_time, '1', timezone);
  let hide_mins = Math.floor((sighting.disappear_time-(time_now/1000))/60);
  let hide_secs = Math.floor((sighting.disappear_time-(time_now/1000)) - (hide_mins*60));

  // GET POKEMON TYPE(S) AND EMOTE
  let pokemon_type = '';
  MAIN.pokemon[sighting.pokemon_id].types.forEach((type) => {
    pokemon_type += MAIN.emotes[type.toLowerCase()]+' '+type+' / ';
  }); pokemon_type = pokemon_type.slice(0,-3);

  // GET SPRITE IMAGE
  let pokemon_url = await MAIN.Get_Sprite(sighting.form, sighting.pokemon_id);

  // GET GENDER
  let gender = '';
  switch(sighting.gender){
    case 1: gender = ' '+MAIN.emotes.male; break;
    case 2: gender = ' '+MAIN.emotes.female; break;
  }
  let gender_str = '';
  switch(sighting.gender){
    case 1: gender_str = 'Male '; break;
    case 2: gender_str = 'Female '; break;
  }

  // Round IV
  internal_value = Math.round(internal_value);

  // GET ROLEID
  let roleID = '';
  //if (internal_value == 100 || pokemon_name == 'Unown'){ roleID = '@everyone'; } else { roleID = ''; }

  // DESPAWN VERIFICATION
  let verified = sighting.disappear_time_verified ? MAIN.emotes.checkYes : MAIN.emotes.yellowQuestion;
  let verified_timer = sighting.disappear_time_verified ? hide_mins + ' mins ' + hide_secs + ' secs' : '45 min 00 sec';

  // GET WEATHER BOOST
  let weather_boost = '';
  switch(sighting.weather){
    case 1: weather_boost = ' | '+MAIN.emotes.clear+' ***Boosted***'; break;
    case 2: weather_boost = ' | '+MAIN.emotes.rain+' ***Boosted***'; break;
    case 3: weather_boost = ' | '+MAIN.emotes.partlyCloudy+' ***Boosted***'; break;
    case 4: weather_boost = ' | '+MAIN.emotes.cloudy+' ***Boosted***'; break;
    case 5: weather_boost = ' | '+MAIN.emotes.windy+' ***Boosted***'; break;
    case 6: weather_boost = ' | '+MAIN.emotes.snow+' ***Boosted***'; break;
    case 7: weather_boost = ' | '+MAIN.emotes.fog+' ***Boosted***'; break;
  }

  let pokemon_embed = new Discord.RichEmbed()
    .setImage(img_url)
    .setColor('00ccff')
    .setThumbnail(pokemon_url)

  if(has_iv == false || (sighting.cp == null && MAIN.config.sub_without_iv != 'FALSE')){
    pokemon_embed
      .addField('**'+pokemon_name+'** '+form_name+gender,verified+': '+hide_time+' (*'+hide_mins+'m '+hide_secs+'s*)\n'+pokemon_type+weather_boost)
      .addField(embed_area+' | Directions:','[Google Maps](https://www.google.com/maps?q='+sighting.latitude+','+sighting.longitude+') | '
                                           +'[Apple Maps](http://maps.apple.com/maps?daddr='+sighting.latitude+','+sighting.longitude+'&z=10&t=s&dirflg=d) | '
                                           +'[Scan Map]('+MAIN.config.FRONTEND_URL+'@/'+sighting.latitude+'/'+sighting.longitude+'/14)',false);
    var report_dict = {
      "type":"wild",
      "pokemon":gender_str + form_str + pokemon_name,
      "gps": sighting.latitude + "," + sighting.longitude,
      "weather": weather_boost,
      "expire":verified_timer
    };
    var pokemon_message = '!alarm ' + JSON.stringify(report_dict);
  } else{

    if(sighting.cp == null){ return; }
    // DETERMINE MOVE NAMES AND TYPES
    let move_name_1 = MAIN.moves[sighting.move_1].name;
    let move_type_1 = MAIN.emotes[MAIN.moves[sighting.move_1].type.toLowerCase()];
    let move_name_2 = MAIN.moves[sighting.move_2].name;
    let move_type_2 = MAIN.emotes[MAIN.moves[sighting.move_2].type.toLowerCase()];

    // DETERMINE HEIGHT AND WEIGHT
    let height = 'Height: '+Math.floor(sighting.height*100)/100+'m';
    let weight = 'Weight: '+Math.floor(sighting.weight*100)/100+'kg';

    pokemon_embed
      .addField('**'+pokemon_name+'** '+form_name+sighting.individual_attack+'/'+sighting.individual_defense+'/'+sighting.individual_stamina+' ('+internal_value+'%)\n'
               +'Level '+sighting.pokemon_level+' | CP '+sighting.cp+gender, height+' | '+weight+'\n'+move_name_1+' '+move_type_1+' / '+move_name_2+' '+move_type_2, false)
      .addField(verified+': '+hide_time+' (*'+hide_mins+'m '+hide_secs+'s*) ', pokemon_type+weather_boost, false)
      //.addField('**Max CP**'+MAIN.Get_CP(sighting.id, sighting.form, 40))
      .addField(embed_area+' | Directions:','[Google Maps](https://www.google.com/maps?q='+sighting.latitude+','+sighting.longitude+') | '
                                           +'[Apple Maps](http://maps.apple.com/maps?daddr='+sighting.latitude+','+sighting.longitude+'&z=10&t=s&dirflg=d) | '
                                         +'[Scan Map]('+MAIN.config.FRONTEND_URL+'@/'+sighting.latitude+'/'+sighting.longitude+'/14)',false);
    var report_dict = {
      "type":"wild",
      "pokemon":gender_str + form_str + pokemon_name,
      "gps": Number(sighting.latitude).toFixed(6) + "," + Number(sighting.longitude).toFixed(6),
      "weather": weather_boost.slice(3),
      "iv_percent": internal_value,
      "iv_long": sighting.individual_attack + " / " + sighting.individual_defense + " / " + sighting.individual_stamina,
      "level":sighting.pokemon_level,
      "cp":sighting.cp,
      "gender":gender_str,
      "height":Math.floor(sighting.height*100)/100+'m',
      "weight":Math.floor(sighting.weight*100)/100+'kg',
      "moveset":move_name_1 + " / " + move_name_2,
      "expire":verified_timer
    };
    var pokemon_message = '!alarm ' + JSON.stringify(report_dict);
  }

  if(member){
    if(MAIN.logging == 'ENABLED'){ console.info('[Pokébot] ['+MAIN.Bot_Time(null,'stamp')+'] [Embed] [pokemon.js] Sent a '+pokemon_name+' to '+member.user.tag+' ('+member.id+').'); }
    return MAIN.Send_DM(server.id, member.id, pokemon_embed, target.bot);
  } else if(MAIN.config.POKEMON.Discord_Feeds == 'ENABLED'){
    if(MAIN.logging == 'ENABLED'){ console.info('[Pokébot] ['+MAIN.Bot_Time(null,'stamp')+'] [Embed] [pokemon.js] Sent a '+pokemon_name+' to '+target.guild.name+' ('+target.id+').'); }
    return MAIN.Send_Embed('pokemon', 0, server, roleID, pokemon_message, pokemon_embed, target.id);
  } else{ return; }

}

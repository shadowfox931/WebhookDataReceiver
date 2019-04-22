delete require.cache[require.resolve('../embeds/pokemon.js')];
const Send_Pokemon = require('../embeds/pokemon.js');
const Discord = require('discord.js');

module.exports.run = async (MAIN, sighting, main_area, sub_area, embed_area, server, timezone) => {

  // VARIABLES
  let internal_value = (sighting.individual_defense+sighting.individual_stamina+sighting.individual_attack)/45;
  let time_now = new Date().getTime(); internal_value = Math.floor(internal_value*1000)/10;

  // CHECK ALL FILTERS
  MAIN.Pokemon_Channels.forEach((pokemon_channel,index) => {

    // DEFINE FILTER VARIABLES
    let geofences = pokemon_channel[1].geofences.split(',');
    let channel = MAIN.channels.get(pokemon_channel[0]);
    let filter = MAIN.Filters.get(pokemon_channel[1].filter);

    // CHECK FILTER GEOFENCES
    if(geofences.indexOf(server.name) >= 0 || geofences.indexOf(main_area) >= 0 || geofences.indexOf(sub_area) >= 0){

      // DETERMINE GENDER
      filter.gender = filter.gender.toLowerCase();
      if(sighting.gender == 1){ gender = 'male'; }
      else if(sighting.gender == 2){ gender = 'female'; }
      else{ gender = 'all'; }

      // CHECK IF FILTER EXISTS
      if (!filter) {console.error('[Pok�bot] ['+MAIN.Bot_Time(null,'stamp')+'] The filter defined for'+pokemon_channel[0]+' does not appear to exist.'); return;}
      // CHECK IF CHANNEL EXISTS
      if (!channel) {console.error('[Pok�bot] ['+MAIN.Bot_Time(null,'stamp')+'] The channel '+pokemon_channel[0]+' does not appear to exist.'); return;}
      // POST WITHOUT IV IF ENABLED
      if (filter.Post_Without_IV){
        if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 34] Post_without_IV is True '+filter.name+'.'); }
        if (filter[MAIN.pokemon[sighting.pokemon_id].name]["rare"]){
          if (sighting.cp > 0){
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 36] Sighting has CP '+filter.name+'.'); }
          } else {
            Send_Pokemon.run(MAIN, false, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone);
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 41] Sighting sent '+filter.name+'.'); } return;
            return;
          }
        } else {
          if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 38] Rare spawns turned off for '+MAIN.pokemon[sighting.pokemon_id].name+' '+filter.name+'.'); } return;
        }
      }
      // CHECK IF SIGHTING HAS A CP OR SET TO FALSE
      if (!sighting.cp > 0 || filter[MAIN.pokemon[sighting.pokemon_id].name] == 'False' || !filter[MAIN.pokemon[sighting.pokemon_id].name]){
        return;
      }
      // REQUIRE A DICTIONARY
      if (!filter[MAIN.pokemon[sighting.pokemon_id].name].constructor === Object){
        return;
      }
      //CHECK IF FILTER HAS INDIVIDUAL POKEMON IV REQUIREMENT
      if (typeof filter[MAIN.pokemon[sighting.pokemon_id].name]["iv"] === "number"){
        if (internal_value > filter[MAIN.pokemon[sighting.pokemon_id].name].min_iv && internal_value <= filter.max_iv){
          if(filter.gender.toLowerCase() == 'all' || filter.gender.toLowerCase() == gender){
            Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone);
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 58] Sighting sent '+filter.name+'.'); } return;
          }
          if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 60] Sighting sent '+filter.name+'. IV:' + internal_value + ' Min:' + filter.min_iv + ' Max:' + filter.max_iv); } return;
        } else if (sighting.pokemon_level > filter.min_level && sighting.pokemon_level <= filter.max_level && filter[MAIN.pokemon[sighting.pokemon_id].name]["level"]){
          if(filter.gender.toLowerCase() == 'all' || filter.gender.toLowerCase() == gender){
            Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone);
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 64] Sighting sent '+filter.name+'.'); } return;
          }
          if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 66] Sighting sent '+filter.name+'. LEVEL:' + sighting.pokemon_level + ' Min:' + filter.min_level + ' Max:' + filter.max_level); } return;
        } else if (sighting.cp > filter.min_cp && sighting.cp <= filter.max_cp && filter[MAIN.pokemon[sighting.pokemon_id].name]["cp"]){
          if(filter.gender.toLowerCase() == 'all' || filter.gender.toLowerCase() == gender){
            Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone);
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 70] Sighting sent '+filter.name+'.'); } return;
          }
          if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 72] Sighting sent '+filter.name+'. CP:' + sighting.cp + ' Min:' + filter.min_cp + ' Max:' + filter.max_cp); } return;
        } else if (filter[MAIN.pokemon[sighting.pokemon_id].name].min_iv > internal_value || filter.max_iv < internal_value){
          sightingFailed(MAIN, filter, 'IV', "74"); return;
        } else if (filter.min_cp > sighting.cp || filter.max_cp < sighting.cp){
          sightingFailed(MAIN, filter, 'CP', "76"); return;
        } else if (filter.min_level > sighting.pokemon_level || filter.max_level < sighting.pokemon_level){
          sightingFailed(MAIN, filter, 'LEVEL', "78"); return;
        }
        return;
      }
      // CHECK IF FILTER HAS INDIVIDUAL VALUE REQUIREMENTS
      if (filter.min_iv.length > 3){
        // SEND SIGHTING THROUGH ALL FILTERS
        let min_iv = filter.min_iv.split('/');
        let max_iv = filter.max_iv.split('/');
        if (sighting.individual_attack > min_iv[0] && sighting.individual_attack <= max_iv[0] && filter[MAIN.pokemon[sighting.pokemon_id].name]["iv"]){
          if(filter.gender.toLowerCase() == 'all' || filter.gender.toLowerCase() == gender){
            Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone);
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 90] Sighting sent '+filter.name+'.'); } return;
          }
        } else if (sighting.individual_defense > min_iv[1] && sighting.individual_defense <= max_iv[1] && filter[MAIN.pokemon[sighting.pokemon_id].name]["iv"]){
          if(filter.gender.toLowerCase() == 'all' || filter.gender.toLowerCase() == gender){
            Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone);
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 95] Sighting sent '+filter.name+'.'); } return;
          }
        } else if (sighting.individual_stamina > min_iv[2] && sighting.individual_stamina <= max_iv[2] && filter[MAIN.pokemon[sighting.pokemon_id].name]["iv"]){
          if(filter.gender.toLowerCase() == 'all' || filter.gender.toLowerCase() == gender){
            Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone);
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 100] Sighting sent '+filter.name+'.'); } return;
          }
        } else if (sighting.pokemon_level > filter.min_level && sighting.pokemon_level <= filter.max_level && filfilter[MAIN.pokemon[sighting.pokemon_id].name]["level"]){
          if(filter.gender.toLowerCase() == 'all' || filter.gender.toLowerCase() == gender){
            Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone);
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 105] Sighting sent '+filter.name+'. LEVEL:' + sighting.pokemon_level + ' Min:' + filter.min_level + ' Max:' + filter.max_level); } return;
          }
        } else if (sighting.cp > filter.min_cp && sighting.cp <= filter.max_cp && filter[MAIN.pokemon[sighting.pokemon_id].name]["cp"]){
          if(filter.gender.toLowerCase() == 'all' || filter.gender.toLowerCase() == gender){
            Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone);
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 110] Sighting sent '+filter.name+'. CP:' + sighting.cp + ' Min:' + filter.min_cp + ' Max:' + filter.max_cp); } return;
          }
        } else if (min_iv[0] > sighting.individual_attack || min_iv[1] > sighting.individual_defense || min_iv[2] > sighting.individual_stamina || max_iv[0] < sighting.individual_attack || max_iv[1] < sighting.individual_defense || max_iv[2] < sighting.individual_stamina){
          sightingFailed(MAIN, filter, 'IV', "113"); return;
        } else if (filter.min_cp > sighting.cp || filter.max_cp < sighting.cp){
          sightingFailed(MAIN, filter, 'CP', "115"); return;
        } else if (filter.min_level > sighting.pokemon_level || filter.max_level < sighting.pokemon_level){
          sightingFailed(MAIN, filter, 'LEVEL', "117"); return;
        }
        return;
      } else {
        if (internal_value > filter.min_iv && internal_value <= filter.max_iv && filter[MAIN.pokemon[sighting.pokemon_id].name]["iv"]){
          if(filter.gender.toLowerCase() == 'all' || filter.gender.toLowerCase() == gender){
            Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone);
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 124] Sighting sent '+filter.name+'. IV:' + internal_value + ' Min:' + filter.min_iv + ' Max:' + filter.max_iv); } return;
          }
        } else if (sighting.pokemon_level > filter.min_level && sighting.pokemon_level <= filter.max_level && filter[MAIN.pokemon[sighting.pokemon_id].name]["level"]){
          if(filter.gender.toLowerCase() == 'all' || filter.gender.toLowerCase() == gender){
            Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone);
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 129] Sighting sent '+filter.name+'. LEVEL:' + sighting.pokemon_level + ' Min:' + filter.min_level + ' Max:' + filter.max_level); } return;
          }
        } else if (sighting.cp > filter.min_cp && sighting.cp <= filter.max_cp && filter[MAIN.pokemon[sighting.pokemon_id].name]["cp"]){
          if(filter.gender.toLowerCase() == 'all' || filter.gender.toLowerCase() == gender){
            Send_Pokemon.run(MAIN, true, channel, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone);
            if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js - 134] Sighting sent '+filter.name+'. CP:' + sighting.cp + ' Min:' + filter.min_cp + ' Max:' + filter.max_cp); } return;
          }
        } else if(filter.min_iv > internal_value || filter.max_iv < internal_value){
          sightingFailed(MAIN, filter, 'IV', "137"); return;
        } else if (filter.min_cp > sighting.cp || filter.max_cp < sighting.cp){
          sightingFailed(MAIN, filter, 'CP', "139"); return;
        } else if (filter.min_level > sighting.pokemon_level || filter.max_level < sighting.pokemon_level){
          sightingFailed(MAIN, filter, 'LEVEL', "141"); return;
        }
        return;
      }
    }
  }); return;
}

function sightingFailed(MAIN, filter, reason, line){
  if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js] Sighting failed '+filter.name+' because of '+reason+' check on line '+line+'.'); } return;
}

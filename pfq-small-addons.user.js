// ==UserScript==
// @name         PokéFarm Small Addons
// @namespace    https://github.com/Vanyar92
// @author       Vanyar
// @homepageURL  https://github.com/Vanyar92/pfq-small-addons
// @downloadURL  https://github.com/Vanyar92/pfq-small-addons/raw/main/pfq-small-addons.js
// @updateURL    https://github.com/Vanyar92/pfq-small-addons/raw/main/pfq-small-addons.js
// @description  Some small addons to Pokéfarm
// @version      1.0.0
// @match        https://pokefarm.com/summary/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js
// ==/UserScript==

(function() {
    "use strict";
    // ---------------------------------------------------------------------------------------------------- //

    // Getting the OT
    const timelineEntries = $("#timeline li");
    let hasOT = true;
    let linkToRead = null;
    let userName = null;

    $.each(timelineEntries, function(index) {
        const text = $(this).text().toUpperCase();

        if (text.includes("RELEASED")) {
            // If it was released to shelter as the last entry, it has no OT
            hasOT = false;
            return false;
        } else if (text.includes("SHELTER")) {
            // This handles eggs that were released into the Shelter and hatched there
            hasOT = false;
            return false;
        } else if (text.includes("ADOPTED")) {
            // If it was adopted, the adopter is the new OT
            linkToRead = $(this).find("a").attr("href");
            userName = linkToRead.substring(linkToRead.lastIndexOf('/') + 1);
            return false;
        } else if (linkToRead === null && text.includes("HATCHED")) {
            // If it was never released, the one who hatched the egg is the OT
            linkToRead = $(this).find("a").attr("href");
            userName = linkToRead.substring(linkToRead.lastIndexOf('/') + 1);
        }
    });


    // ---------------------------------------------------------------------------------------------------- //

    // Insert OT into the box
    const insertloc = $("#pkmnspecdata > p:contains('Parents')");
    const otText = hasOT ?
      `<p><b>Original Trainer:</b> <a href="${linkToRead}">${userName}</a></p>` :
      '<p><b>Original Trainer:</b> None</p>';

    insertloc.before(otText);

})();

// ==UserScript==
// @name         PokéFarm Small Addnos
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
        const text = $(this).text();

        if (text.includes("Adopted")) {
            // If it was adopted, the adopter is the new OT
            linkToRead = $(this).find("a").attr("href");
            userName = linkToRead.substring(linkToRead.lastIndexOf('/') + 1);
            return false;
        } else if (text.includes("Released") && index === 0) {
            // If it was released to shelter as the last entry, it has no OT
            hasOT = false;
            return false;
        }
    });

    // If it hasnt been adopted or released at all, set the first entry as OT
    if (linkToRead === null) {
        linkToRead = timelineEntries.last().find("a").attr("href");
        userName = $(this).find("a").attr("href");
    }


    // ---------------------------------------------------------------------------------------------------- //

    // Insert OT into the box
    const insertloc = $("#pkmnspecdata > p:contains('Parents')");
    const otText = hasOT ?
      `<p><b>Original Trainer:</b> <a href="${linkToRead}">${userName}</a></p>` :
      '<p><b>Original Trainer:</b> None</p>';

    insertloc.before(otText);

})();

// ==UserScript==
// @name         PokéFarm Small Addons
// @namespace    https://github.com/Vanyar92
// @author       Vanyar
// @homepageURL  https://github.com/Vanyar92/pfq-small-addons
// @downloadURL  https://github.com/Vanyar92/pfq-small-addons/blob/main/pfq-small-addons.user.js
// @updateURL    https://github.com/Vanyar92/pfq-small-addons/blob/main/pfq-small-addons.user.js
// @description  Some small addons to Pokéfarm
// @version      1.0.3
// @match        https://pokefarm.com/summary/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js
// ==/UserScript==

(function() {
    "use strict";
    // ---------------------------------------------------------------------------------------------------- //

    // Variables
    const timelineEntries = $("#timeline li");
    let hasOT = true;
    let linkToRead = null;
    let userName = null;

     // Test whether the pokemon has been traded in its lifetime
    const tradeEntry = timelineEntries.filter(function() {
        return $(this).text().toUpperCase().includes("TRADE");
    }).last();

    // If if has been traded, the first trader is the OT
    if (tradeEntry.length > 0) {
        linkToRead = tradeEntry.find("a").attr("href");
        userName = linkToRead.substring(linkToRead.lastIndexOf('/') + 1);
    } // If no trade has ever been done
    else {
        $.each(timelineEntries, function(index) {
            const text = $(this).text().toUpperCase();
            if (text.includes("ADOPTED")) {
                // If it was adopted, the adopter is the new OT
                linkToRead = $(this).find("a").attr("href");
                userName = linkToRead.substring(linkToRead.lastIndexOf('/') + 1);
                return false;
            } else if (text.includes("SHELTER")) {
                // If last entry was regarding shelter, it has no OT
                hasOT = false;
                return false;
            } else if (["REVIVED", "CAUGHT", "EGG HATCHED"].some(firstot => text.includes(firstot))) {
                // If it was never released, the one who got the pokemon first is the OT
                linkToRead = $(this).find("a").attr("href");
                userName = linkToRead.substring(linkToRead.lastIndexOf('/') + 1);
                return false;
            }
        });
    }


    // ---------------------------------------------------------------------------------------------------- //

    // Insert OT into the box
    const insertloc = $("#pkmnspecdata > p:contains('Parents')");
    const otText = hasOT ?
      `<p><b>Original Trainer:</b> <a href="${linkToRead}">${userName}</a></p>` :
      '<p><b>Original Trainer:</b> None</p>';

    insertloc.before(otText);

})();

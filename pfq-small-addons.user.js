// ==UserScript==
// @name         PokéFarm Small Addons
// @namespace    https://github.com/Vanyar92
// @author       Vanyar
// @homepageURL  https://github.com/Vanyar92/pfq-small-addons
// @downloadURL  https://github.com/Vanyar92/pfq-small-addons/blob/main/pfq-small-addons.user.js
// @updateURL    https://github.com/Vanyar92/pfq-small-addons/blob/main/pfq-small-addons.user.js
// @description  Some small addons to Pokéfarm
// @version      1.1.2
// @match        https://pokefarm.com/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js
// ==/UserScript==

window.addEventListener('load', setupObserver)

// Variables
let timelineEntries = $("#timeline li");
let userName = null;
let hasOT = true;
let linkToRead = null;
let getBonus = false;
const currentPageUrl = window.location.href;

// Function for figuring out the OT to use on different pages
function determineOT(data) {
    if (typeof data === 'string') {
        // For the fields and daycare pages
        timelineEntries = $(data);
    } else {
        // For the pokemon summary page
        timelineEntries = data;
    }

    // Test for trade in its lifetime and figuring out the very first trade
    const tradeEntry = timelineEntries.filter(function() {
        return $(this).text().toUpperCase().includes("TRADE");
    }).last();

    // If it was traded to you, there is a breeding bonus
    const lastEntry = timelineEntries.first();
    getBonus = false;
    if (lastEntry.text().toUpperCase().includes("TRADE") && currentPageUrl.endsWith("daycare")) {
        getBonus = true;
    }

    // If it has been traded, the first trader is the OT
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
            } else if (text.includes("FISHING")) {
                // If the pokemon was caught in the Fishing Hut there is no link to extract
                linkToRead = "";
                userName = "You";
                return false;
            } else if (["REVIVED", "CAUGHT", "EGG HATCHED", "EGG OBTAINED"].some(firstot => text.includes(firstot))) {
                // If it was never released, the one who got the pokemon first is the OT
                linkToRead = $(this).find("a").attr("href");
                userName = linkToRead.substring(linkToRead.lastIndexOf('/') + 1);
                return false;
            }
        });
    }


    return { linkToRead, userName, hasOT, getBonus };
}


// ---------------------------------------------------------------------------------------------------- //


// Function to insert to OT in different pages
function insertOT() {
    // Inserting the OT into the pokemon summary page
    determineOT(timelineEntries);
    const insertloc = $("#pkmnspecdata > p:contains('Parents')");
    const otText = hasOT ?
      `<p><b>OT:</b> <a href="${linkToRead}">${userName}</a></p>` :
      '<p><b>OT:</b> None</p>';

    insertloc.before(otText);


    // Inserting the OT into the fields and daycare pages
    $('.fieldmon').each(function () {
        const $fieldmon = $(this);

        // Get the url for the current pokemon using data-id
        let dataId = $fieldmon.attr("data-id");
        let summaryUrl = `https://pokefarm.com/summary/${dataId}`;

        // Run a function to get the OT from the summary page
        $.ajax({
            url: summaryUrl,
            success: function(data) {
                // Extract the timeline panel and filter out the needed info
                const $summaryCol3 = $(data).find('#timeline').html();
                const { linkToRead, userName, hasOT, getBonus } = determineOT($summaryCol3);

                // Insert the OT
                const fieldOT = hasOT ?
                `<div><b>OT:</b> <a href="${linkToRead}">${userName}</a>${getBonus ? ' (Breeding bonus)' : ''}</div>` :
                '<div><b>OT:</b> None</div>';

                const fieldOTLoc = $fieldmon.nextAll('.tooltip_content').first().find('.fieldmontip').find('.item');

                fieldOTLoc.after(fieldOT);
            } // success function
        }); // ajax
    }) // each function


    // Inserting the OT into the party inside the fields
    $('.slot').each(function () {
        const $partymon = $(this);

        // If a party slot is empty, there should be no ajax request
        if ($partymon.children().length === 0) {
            return;
        }

        // Get the url for the current pokemon using data-id
        let dataId = $partymon.attr("data-id");
        let summaryUrl = `https://pokefarm.com/summary/${dataId}`;

        // Run a function to get the OT from the summary page
        $.ajax({
            url: summaryUrl,
            success: function(data) {
                // Extract the timeline panel and filter out the needed info
                const $summaryCol3 = $(data).find('#timeline').html();
                const { linkToRead, userName, hasOT, getBonus } = determineOT($summaryCol3);

                // Insert the OT
                const partyOT = hasOT ?
                      `<div><b>OT:</b> <a href="${linkToRead}">${userName}</a></div>` :
                '<div><b>OT:</b> None</div>';

                const partyOTLoc = $partymon.nextAll('.tooltip_content').first().find('.fieldmontip').find('.item');

                partyOTLoc.after(partyOT);
            } // success function
        }); // ajax
    }) // each function

}; // insertOT function


// ---------------------------------------------------------------------------------------------------- //


// Using an observer to get changes
const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        const fieldDiv = $('.field');

        // Making sure it only runs once using a class
        if (!fieldDiv.hasClass('ot_inserted') && !currentPageUrl.includes('summary')) {
            fieldDiv.addClass('ot_inserted');
            insertOT();
        }
    });
});

function setupObserver() {
    observer.observe(document.querySelector('body'), {
        childList: true,
        subtree: true
    });

    if (currentPageUrl.includes('summary')) {
        insertOT();
    }
}

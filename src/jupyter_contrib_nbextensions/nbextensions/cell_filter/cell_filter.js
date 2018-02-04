/**
 * cell_filter.js
 * An extension that allows you to filter cells by tags. Keywords entered into the search bar separated by spaces joins them with logical AND.
 *
 *
 * @version 0.1.0
 * @author  Benjamin Ellenberger, https://github.com/benelot
 * @updated 2018-02-03
 *
 *
 */
define([
    'require',
    'jqueryui',
    'base/js/namespace',
    'base/js/utils',
    'services/config'
], function (
    requirejs,
    $,
    Jupyter,
    utils
) {
    'use strict';

    function filterRows (filterText, caseSensitive, useRegex) {
        var input = $('#filterkeyword');
        var btnRegex = $('#filterisreg');

        filterText = filterText !== undefined ? filterText : input.val();
        useRegex = useRegex !== undefined ? useRegex : btnRegex.attr('aria-pressed') === 'true';
        caseSensitive = caseSensitive !== undefined ? caseSensitive : $('#filtercase').attr('aria-pressed') === 'true';

        if (!useRegex) {
            // escape any regex special chars
            filterText = filterText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
            var keywords = filterText.split(' ');                                                                   // get all space separated keywords
            filterText = '.*';                                                                                      // catch all stuff before the keywords
            keywords.forEach(function(keyword){                                                                     // find all keywords we are looking for with regex (?=.*keyword)
                filterText += '(?=.*' + keyword + ')';
            });
            filterText += '.*';                                                                                     // catch all stuff after the keywords
        }
        var matchExpr;
        try {
            matchExpr = new RegExp(filterText, caseSensitive ? '' : 'i');                                           // prepare regex
        }
        catch (err) {
            // do nothing, error is handled based on undefined matchExpr
        }

        var invalidRegex = matchExpr === undefined;                                                                 // indicate invalid regex
        btnRegex.toggleClass('btn-danger', invalidRegex);
        btnRegex.toggleClass('btn-default', !invalidRegex);
        btnRegex.closest('.form-group').toggleClass('has-error has-feedback', invalidRegex);

        Jupyter.notebook.get_cells().forEach(function (cell, idx, cells) {                                          // toggle visibility of cells depending on their tags
            var tags = cell.metadata.tags || [];
            tags = tags.join(' ');                   
            if(tags.search(matchExpr) !== -1){
                cell.element.find("div.input").show(); // cell.element.style.display = '';
            }
            else{
                cell.element.find("div.input").hide(); // cell.element.style.display = 'none';
            }
        });
    }

    function filterRowsDefaultParams () {
        return filterRows();
    }

    function load_ipython_extension () {

        var form = $('<form/>')                                                                                     // insert a form into the main toolbar container
            .css('padding', '0 7px 4px')
            .appendTo('#maintoolbar-container');

        var frm_grp = $('<div/>')
            .addClass('form-group')                                                                                 // insert a form-group
            .css('margin-bottom', 0)
            .appendTo(form);

        var grp = $('<div/>')
            .addClass('input-group')                                                                                // insert an input-group
            .appendTo(frm_grp);

        $('<input/>')                                                                                               // insert search bar
            .attr('type', 'text')
            .addClass('form-control input-sm')
            .attr('title', 'Keyword for filtering cells by tags')
            .attr('id', 'filterkeyword')
            .attr('placeholder', 'Filter')
            .css('font-weight', 'bold')
            .appendTo(grp);

        var btns = $('<div/>')
            .addClass('input-group-btn')                                                                            // insert a div to group buttons
            .appendTo(grp);

        $('<button/>')
            .attr('type', 'button')                                                                                 // insert regex button
            .attr('id', 'filterisreg')
            .addClass('btn btn-default btn-sm')
            .attr('data-toggle', 'button')
            .css('font-weight', 'bold')
            .attr('title', 'Use regex (JavaScript regex syntax)')
            .text('.*')
            .on('click', function (evt) { setTimeout(filterRowsDefaultParams); })
            .appendTo(btns);

        $('<button/>')                                                                                              // insert case sensitive button
            .attr('type', 'button')
            .attr('id', 'filtercase')
            .addClass('btn btn-default btn-sm')
            .attr('data-toggle', 'button')
            .attr('tabindex', '0')
            .attr('title', 'Match case')
            .css('font-weight', 'bold')
            .text('Aa')
            .on('click', function (evt) { setTimeout(filterRowsDefaultParams); })
            .appendTo(btns);

        $('#filterkeyword').on('keyup', filterRowsDefaultParams);                                                   // trigger filtering right with typing
    }

    return {
        load_ipython_extension : load_ipython_extension
    };

});

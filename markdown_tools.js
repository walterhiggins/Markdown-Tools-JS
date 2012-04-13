/**
 * Insert markdown-style quotes on selection
 */
function markdown_quote_selection(the_id)
{
    var text = get_selection(the_id).text;
    text = markdown_quote(text);
    replace_selection(the_id,text);
}
function markdown_quote(text)
{
    var result = text;
    result = result.replace(new RegExp("^"), "> "); 
    result = result.replace(new RegExp("\n", 'g'),"\n> "); 
    return result;
}
function fill_paragraph(str)
{
    var result = "";
    var l = str.length;
    var lastSpacePos = 0;
    var sol = 0;
    for (i = 0; i < l; i++){
        if (str.charAt(i) == ' '){
            if (i > sol + 72){
                var line = str.substring(sol,lastSpacePos+1);
                result += line + "\n";
                sol = lastSpacePos+1;
            }
            lastSpacePos = i;
        }
    }
    result += str.substring(sol,l);
    return result;
}

function fill_text (str)
{
    var result = "";
    var re = new RegExp("([^\n])\n([^\n])","g");
    str = str.replace(re,"$1 $2");
    str = str.replace(new RegExp(" +","g")," ");
    
    var paragraphs = [];
    for (var j = 0; j < str.length; j++){
        if (str.charAt(j) == '\n'){
            paragraphs.push(j);
        }
    }
    if (paragraphs.length == 0){
        return fill_paragraph(str);
    }else{
        if (paragraphs[paragraphs.length-1] != str.length){
            paragraphs.push(str.length);
        }
        var s,i  = 0;
        
        for (i = 0; i < paragraphs.length; i++){
            var paragraph = str.substring(s,paragraphs[i]);
            var filled_paragraph = fill_paragraph(paragraph);
            result += filled_paragraph + (i==paragraphs.length-1?"":"\n");
            s = paragraphs[i]+1;
        }
        result += str.substring(paragraphs[i-1]+1,str.length);
    }
    result = result.replace( new RegExp("\n\n", 'g'),"\n \n"); 
    
    return result;
}
/**
 * insert hard line-wrap on or before the 72th character.
 * This should work exactly like Emacs' fill-region command.
 * (Makes text more readable).
 */
function fill_region(the_id)
{
    var text = get_selection(the_id).text;
    var filled = fill_text(text);
    replace_selection(the_id,filled);
}
/**
 * Indent selection in markdown-style (4 spaces) - useful if you want to include code in your page.
 */
function markdown_indent_selection(the_id)
{
    var text = get_selection(the_id).text;
    
    text = text.replace(new RegExp("^"), "    "); 
    text = text.replace( new RegExp("\n", 'g'),"\n    "); 
    
    replace_selection(the_id,text);

}
//
// following code was copied from 
//
function padzero(n) {
    return n < 10 ? '0' + n : n;
}

function pad2zeros(n) {
    if (n < 100) {
        n = '0' + n;
    }
    if (n < 10) {
        n = '0' + n;
    }
    return n;     
}

function toISOString(d) {
    return d.getUTCFullYear() + '/' 
        + padzero(d.getUTCMonth() + 1) + '/' 
        + padzero(d.getUTCDate()) + ' ' 
        + padzero(d.getUTCHours()) + ':' 
        +  padzero(d.getUTCMinutes()) ;
    
}
//
// Following code was copied from http://stackoverflow.com/questions/401593/javascript-textarea-selection/2966703#2966703
// 
function get_selection(the_id)
{
    var e = document.getElementById(the_id);
    
    //Mozilla and DOM 3.0
    if('selectionStart' in e)
        {
            var l = e.selectionEnd - e.selectionStart;
            return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
    }
    //IE
    else if(document.selection) {
        e.focus();
        var r = document.selection.createRange();
        var tr = e.createTextRange();
        var tr2 = tr.duplicate();
        tr2.moveToBookmark(r.getBookmark());
        tr.setEndPoint('EndToStart',tr2);
        if (r == null || tr == null) {
            return { 
                start: e.value.length, 
                end: e.value.length, 
                length: 0, 
                text: '' };
        }
        var text_part = r.text.replace(/[\r\n]/g,'.'); //for some reason IE doesn't always count the \n and \r in the length
        var text_whole = e.value.replace(/[\r\n]/g,'.');
        var the_start = text_whole.indexOf(text_part,tr.text.length);
        return { 
            start: the_start, 
            end: the_start + text_part.length, 
            length: text_part.length, 
            text: r.text };
    }
    //Browser not supported
    else {
        return { 
            start: e.value.length, 
            end: e.value.length, 
            length: 0, 
            text: '' };
    }
}
function set_selection(the_id,start_pos,end_pos)
{
    var e = document.getElementById(the_id);

    //Mozilla and DOM 3.0
    if('selectionStart' in e) {
        e.focus();
        e.selectionStart = start_pos;
        e.selectionEnd = end_pos;
    }
    //IE
    else if(document.selection) {
        e.focus();
        var tr = e.createTextRange();
        
        //Fix IE from counting the newline characters as two seperate characters
        var stop_it = start_pos;
        for (i=0; i < stop_it; i++) {
            if( e.value[i].search(/[\r\n]/) != -1 ){
                start_pos = start_pos - .5;
            }
        }
        stop_it = end_pos;
        for (i=0; i < stop_it; i++) {
            if( e.value[i].search(/[\r\n]/) != -1 ) {
                end_pos = end_pos - .5;
            }
        }
        tr.moveEnd('textedit',-1);
        tr.moveStart('character',start_pos);
        tr.moveEnd('character',end_pos - start_pos);
        tr.select();
    }
    return get_selection(the_id);
}

function replace_selection(the_id,replace_str)
{
    var e = document.getElementById(the_id);
    selection = get_selection(the_id);
    var start_pos = selection.start;
    var end_pos = start_pos + replace_str.length;
    e.value = e.value.substr(0, start_pos) + replace_str + e.value.substr(selection.end, e.value.length);
    set_selection(the_id,start_pos,end_pos);
    return {start: start_pos, end: end_pos, length: replace_str.length, text: replace_str};
}
function wrap_selection(the_id, left_str, right_str, sel_offset, sel_length)
{
    var the_sel_text = get_selection(the_id).text;
    var selection =  replace_selection(the_id, left_str + the_sel_text + right_str );
    if(sel_offset !== undefined && sel_length !== undefined) {
        selection = set_selection(the_id, selection.start +  sel_offset, selection.start +  sel_offset + sel_length);
    }
    else if(the_sel_text == '') {
        selection = set_selection(the_id, selection.start + left_str.length, selection.start + left_str.length);
    }
    return selection;
}
MARKDOWN_TOOLS_LOADED=true;
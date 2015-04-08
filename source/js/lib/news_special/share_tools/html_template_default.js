define(function () {
    return '<div class="share ns__share">' +
                '<h2 class="share__title"><%=header %></h2>' +
                '<ul class="share__tools ">' +
                    '<% for ( var i = 0; i < networks.length; i++ ) { %>' + 
                        '<li class="share__tool share__tool--<%=networks[i].target %>">' +
                            '<a href="<%=networks[i].share %>" target="_blank" >' + 
                                '<span><%=networks[i].target.charAt(0).toUpperCase() + networks[i].target.slice(1) %></span>' +
                            '</a>' + 
                        '</li>' +
                    '<% } %>' +
                '</ul>' +
            '</div>';
});
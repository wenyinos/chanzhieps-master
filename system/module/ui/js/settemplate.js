$(document).ready(function()
{
    $('.theme').on('click', '.theme-img, .theme-name', function(e)
    {
        e.preventDefault();
        var $this = $(this).closest('.theme');
        if($this.hasClass('current')) return;

        $.getJSON($this.data('url'), function(response)
        {
            if(response.result == 'success')
            {
                messager.success(response.message);

                var $themes = $this.closest('.themes');
                $themes.attr('data-theme', $this.data('theme'))
                       .find('.theme.current').removeClass('current');
                $this.addClass('current');

                var $menu = $('#menu');
                $menu.find('.menu-theme-img').attr('src', $this.find('.theme-img img').attr('src'));
                $menu.find('.menu-theme-name').text($this.find('.theme-name').text());
            }
            else
            {
                bootbox.alert(response.message);
            }
        });
    });
});

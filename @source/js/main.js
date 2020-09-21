
$(function () {
    $('#navbarDropdown a').click(function (e) {
        $('.active').removeClass('active');
    });
});

// $('.collapse').on('shown.bs.collapse', function(e) {
//     var $card = $(this).closest('.card');
//     $('html,body').animate({
//       scrollTop: $card.offset().top
//     }, 500);
//   });


// function scroll() {
//   var elmnt = document.getElementById("carouselExampleIndicators-2");
//   elmnt.scrollIntoView();
// }

$('.collapse').on('shown.bs.collapse', function(e) {
    console.log(e.currentTarget.parentNode);
    var elmnt = e.currentTarget.parentNode.parentNode;
    // elmnt.scrollTop = elmnt.scrollHeight - 1000;
    elmnt.scrollIntoView({behavior: "smooth", block: "start"});
  });
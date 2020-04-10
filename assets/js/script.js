// ------------------------------
// https://twitter.com/mattsince87
// ------------------------------

$(document).ready(function() {
	var topMenu = $("#documenter_nav"),
		topMenuHeight = topMenu.outerHeight() + 100;

	// Bind click handler to menu items
	topMenu.on("click", 'a', function(e) {
		var href = $(this).attr("href"),
			offsetTop = href === "#" ? 0 : $(href).offset().top - topMenuHeight + 80;
		$('html, body').stop().animate({
			scrollTop: offsetTop
		}, 300);
		e.preventDefault();
	});

	// Bind to scroll
$(window).on("scroll", function() {
	// All list items
	var menuItems = topMenu.find("a");

	// Anchors corresponding to menu items
	var scrollItems = menuItems.map(function() {
		var item = $($(this).attr("href"));
		if (item.length) {
			return item;
		}
	});

	// Get container scroll position
	var fromTop = $(this).scrollTop() + topMenuHeight;

	// Get id of current scroll item
	var cur = scrollItems.map(function() {
		if ($(this).offset().top < fromTop)
			return this;
	});
	// Get the id of the current element
	cur = cur[cur.length - 1];
	var id = cur && cur.length ? cur[0].id : "";

	var lastId;

	if (lastId !== id) {
		lastId = id;
		// Set remove active class
		menuItems
			.parent().removeClass("active")
			.end().filter("[href='#" + id + "']").parent().addClass("active");
		}
	})
});
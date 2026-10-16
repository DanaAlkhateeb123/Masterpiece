document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('feedback-form');
    var thanks = document.getElementById('feedback-thanks');
    var sellerRating = document.getElementById('seller-star-rating');
    var ratingValue = document.getElementById('seller-rating-value');
    var starLabels = Array.from(sellerRating.querySelectorAll('.seller-star'));

    function showSellerRating(value) {
        starLabels.forEach(function (label) {
            label.classList.toggle('is-filled', Number(label.dataset.stars) <= value);
        });
        ratingValue.textContent = value ? value + ' out of 5 stars' : 'Choose a rating from 1 to 5';
    }

    starLabels.forEach(function (label) {
        var input = label.querySelector('input');
        label.addEventListener('pointerenter', function () {
            showSellerRating(Number(label.dataset.stars));
        });
        input.addEventListener('change', function () {
            showSellerRating(Number(input.value));
        });
    });

    sellerRating.addEventListener('pointerleave', function () {
        var selected = form.querySelector('input[name="sellerRating"]:checked');
        showSellerRating(selected ? Number(selected.value) : 0);
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // TODO: send the rating and feedback to the backend
        form.hidden = true;
        thanks.hidden = false;
    });
});

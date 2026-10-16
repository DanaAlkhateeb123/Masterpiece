document.addEventListener('DOMContentLoaded', function () {
    var list = document.getElementById('conv-list');
    var convs = list.querySelectorAll('button.conv');
    var search = document.getElementById('conv-search');
    var chatName = document.getElementById('chat-name');
    var chatAvatar = document.getElementById('chat-avatar');
    var sellerDialog = document.getElementById('seller-profile');
    var sellerProfileAvatar = document.getElementById('seller-profile-avatar');
    var sellerProfileName = document.getElementById('seller-profile-name');
    var sellerProfileRating = document.getElementById('seller-profile-rating');
    var sellerProfileStars = document.getElementById('seller-profile-stars');
    var sellerMemberSince = document.getElementById('seller-member-since');
    var sellerResponseTime = document.getElementById('seller-response-time');
    var sellerLocation = document.getElementById('seller-location');
    var itemTitle = document.getElementById('item-title');
    var itemImage = document.querySelector('.item-bar-thumb');
    var itemPrice = document.getElementById('item-price');
    var thread = document.getElementById('thread');
    var conversationThreads = { zaid: thread.innerHTML };
    var activeConversation = "zaid";
    var shell = document.querySelector(".shell");
    var form = document.getElementById('composer');
    var input = document.getElementById('composer-input');
 
    var checkIcon = '<svg class="icon" aria-hidden="true"><use href="../assets/icons/icons.svg#check-check"/></svg>';
 
    function timeNow() {
        return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
 
    function addMessage(text, sent, time) {
        var wrap = document.createElement('div');
        wrap.className = 'msg ' + (sent ? 'msg--sent' : 'msg--received');
 
        var bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = text;          // textContent keeps user text safe from HTML injection
 
        var stamp = document.createElement('span');
        stamp.className = 'msg-time';
        stamp.textContent = time + ' ';
        if (sent) stamp.insertAdjacentHTML('beforeend', checkIcon);
 
        wrap.appendChild(bubble);
        wrap.appendChild(stamp);
        thread.appendChild(wrap);
        thread.scrollTop = thread.scrollHeight;
    }
 
    // Start at the latest message
    thread.scrollTop = thread.scrollHeight;
 
    // Open a conversation: update header, item bar and clear the unread badge
    convs.forEach(function (conv) {
        conv.addEventListener('click', function () {
            conversationThreads[activeConversation] = thread.innerHTML;
            activeConversation = conv.dataset.id;
            shell.classList.add("is-chat-open");
            convs.forEach(function (c) { c.classList.toggle('is-active', c === conv); });
 
            chatName.textContent = conv.dataset.name;
            chatAvatar.src = conv.dataset.avatar;
            chatAvatar.alt = conv.dataset.name;
            sellerProfileAvatar.src = conv.dataset.avatar.replace('w=120', 'w=240');
            sellerProfileAvatar.alt = conv.dataset.name;
            sellerProfileName.textContent = conv.dataset.name;
            var rating = Math.max(0, Math.min(5, Math.round(Number(conv.dataset.sellerRating) || 0)));
            sellerProfileRating.textContent = rating + '/5';
            sellerProfileStars.textContent = '\u2605'.repeat(rating) + '\u2606'.repeat(5 - rating);
            sellerProfileStars.setAttribute('aria-label', rating + ' out of 5 stars');
            sellerMemberSince.textContent = conv.dataset.memberSince;
            sellerResponseTime.textContent = conv.dataset.responseTime;
            sellerLocation.textContent = conv.dataset.location;
            itemTitle.textContent = conv.dataset.item;
            itemImage.src = conv.dataset.itemImage;
            itemImage.alt = conv.dataset.item;
            itemPrice.textContent = conv.dataset.price;
 
            var badge = conv.querySelector('.unread');
            if (badge) badge.remove();
 
            if (Object.prototype.hasOwnProperty.call(conversationThreads, activeConversation)) {
                thread.innerHTML = conversationThreads[activeConversation];
            } else {
                thread.innerHTML = "";
                addMessage(conv.dataset.last, false, conv.dataset.time);
            }
            convs.forEach(function (entry) { entry.setAttribute("aria-pressed", String(entry === conv)); });
            thread.scrollTop = thread.scrollHeight;
        });
    });

    document.getElementById('seller-profile-trigger').addEventListener('click', function () {
        sellerDialog.showModal();
    });
    document.getElementById('seller-dialog-close').addEventListener('click', function () {
        sellerDialog.close();
    });
    sellerDialog.addEventListener('click', function (event) {
        if (event.target === sellerDialog) sellerDialog.close();
    });
 
    convs.forEach(function (conv) { conv.setAttribute("aria-pressed", String(conv.classList.contains("is-active"))); });
    document.getElementById("back-to-inbox").addEventListener("click", function () {
        shell.classList.remove("is-chat-open");
        var active = list.querySelector(".is-active");
        if (active) active.focus();
    });
    // Filter conversations while typing
    search.addEventListener('input', function () {
        var q = search.value.trim().toLowerCase();
        var visibleCount = 0;
        convs.forEach(function (conv) {
            var text = (conv.dataset.name + ' ' + conv.dataset.item).toLowerCase();
            conv.parentElement.hidden = q !== '' && text.indexOf(q) === -1;
            if (!conv.parentElement.hidden) visibleCount++;
        });
        document.getElementById('search-empty').hidden = visibleCount > 0;
    });
 
    // Quick replies fill the input
    document.querySelectorAll('.quick-replies button').forEach(function (btn) {
        btn.addEventListener('click', function () {
            input.value = btn.textContent;
            input.focus();
        });
    });
 
    // Send
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = input.value.trim();
        if (!text) return;
        addMessage(text, true, timeNow());
        input.value = '';
        var current = list.querySelector(".is-active");
        current.querySelector(".conv-last > span").textContent = "You: " + text;
        current.querySelector("time").textContent = "Now";
        input.focus();
        // TODO: send the message to the backend
    });
});
 

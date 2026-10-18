document.addEventListener('DOMContentLoaded', function () {
    var store = window.NostalgiaNotifications, filter = 'all', items = [];
    var list = document.getElementById('notification-list');
    var camera = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=100&q=80';
    var examples = [
        {id:'demo-new-order',type:'seller_order_received',orderId:'NOST-0012',itemName:'Vintage Camera',category:'selling',kind:'bag',title:'New Order Received',body:'Your Vintage Camera has been ordered. Please prepare the item and provide your pickup location so we can arrange collection.',href:'../user-listings/user-listings.html',image:camera,read:false},
        {id:'demo-confirmed',category:'orders',kind:'check',title:'Order Confirmed',body:'Your order #NOST-0012 has been placed successfully.',href:'../order-tracking/order-tracking.html',read:false},
        {id:'demo-preparing',category:'orders',kind:'box',title:'Your Item Is Being Prepared',body:'The seller has started preparing your “Vintage Camera”.',href:'../order-tracking/order-tracking.html',image:camera,read:false},
        {id:'demo-shipped',category:'orders',kind:'truck',title:'Your Order Is On the Way',body:'Your “Vintage Camera” has been shipped and is on its way to you.',href:'../order-tracking/order-tracking.html',image:camera,read:false},
        {id:'demo-buyer-cancelled',category:'selling',kind:'cancel',title:'Order Cancelled by Buyer',body:'Dana cancelled order #NOST-0012. You no longer need to prepare the item.',href:'../user-listings/user-listings.html',read:false},
        {id:'demo-cancellation',category:'orders',kind:'cancel',title:'Cancellation Confirmed',body:'Your order #NOST-0012 has been cancelled successfully.',href:'../user-orders/user-orders.html',read:false},
        {id:'demo-seller-cancelled',category:'orders',kind:'cancel',title:'Order Cancelled by Seller',body:'Unfortunately, the seller can no longer fulfill order #NOST-0012.',href:'../user-orders/user-orders.html',read:false},
        {id:'demo-delivered',category:'orders',kind:'truck',title:'Order Delivered',body:'Your order has been delivered. Please confirm that you received it.',href:'../order-tracking/order-tracking.html',read:false},
        {id:'demo-received',category:'selling',kind:'check',title:'Delivery Confirmed',body:'The buyer confirmed receiving the “Vintage Camera”.',href:'../user-listings/user-listings.html',image:camera,read:false},
        {id:'demo-waiting',category:'selling',kind:'box',title:'Order Waiting for Preparation',body:'You have a new order that still needs to be prepared.',href:'../user-listings/user-listings.html',read:false},
        {id:'demo-message',category:'messages',kind:'message',title:'New Message',body:'You received a new message from Dana.',href:'../messeges/messages.html',read:false},
        {id:'demo-new-bid',category:'auctions',kind:'auction',title:'New Bid Received',body:'A new bid of 120 JOD was placed on your “Antique Clock”.',href:'../antiqes/antiqes.html',read:false},
        {id:'demo-bid-placed',category:'auctions',kind:'auction',title:'Bid Placed Successfully',body:'Your bid of 120 JOD has been placed successfully.',href:'../antiqes/antiqes.html',read:false},
        {id:'demo-outbid',category:'auctions',kind:'auction',title:'You’ve Been Outbid',body:'Another bidder placed a higher bid on the “Antique Clock”.',href:'../antiqes/antiqes.html',read:false},
        {id:'demo-auction-soon',category:'auctions',kind:'clock',title:'Auction Ending Soon',body:'The “Antique Clock” auction ends in 30 minutes.',href:'../antiqes/antiqes.html',read:false},
        {id:'demo-auction-won',category:'auctions',kind:'auction',title:'You Won the Auction!',body:'Congratulations! You won the “Antique Clock” for 180 JOD.',href:'../antiqes/antiqes.html',read:false},
        {id:'demo-auction-ended',category:'auctions',kind:'auction',title:'Auction Ended',body:'Dana won your “Antique Clock” for 180 JOD.',href:'../antiqes/antiqes.html',read:false},
        {id:'demo-sold',category:'selling',kind:'check',title:'Item Sold',body:'Your “Vintage Camera” has been sold.',href:'../user-listings/user-listings.html',image:camera,read:false},
        {id:'demo-unavailable',category:'listings',kind:'cancel',title:'Item No Longer Available',body:'An item from your wishlist has been sold and is no longer available.',href:'../saved-favorites/saved-favorites.html',read:false},
        {id:'demo-live',category:'listings',kind:'check',title:'Listing Is Live',body:'Your “Antique Vase” has been approved and is now visible on Nostalgia.',href:'../user-listings/user-listings.html',read:false},
        {id:'demo-changes',category:'listings',kind:'box',title:'Listing Needs Changes',body:'Your listing could not be published. Please review the feedback and update it.',href:'../user-listings/user-listings.html',read:false},
        {id:'demo-paid',category:'payments',kind:'payment',title:'Payment Successful',body:'Your payment for order #NOST-0012 was completed successfully.',href:'../user-orders/user-orders.html',read:false},
        {id:'demo-cod',category:'payments',kind:'payment',title:'Cash on Delivery Selected',body:'Your order has been confirmed. Payment will be collected upon delivery.',href:'../user-orders/user-orders.html',read:false},
        {id:'demo-refund-processing',category:'payments',kind:'refund',title:'Refund Processing',body:'Your refund for order #NOST-0012 is being processed.',href:'../user-orders/user-orders.html',read:false},
        {id:'demo-refund-complete',category:'payments',kind:'refund',title:'Refund Completed',body:'Your refund for order #NOST-0012 has been completed successfully.',href:'../user-orders/user-orders.html',read:false}
    ];
    var icons = {
        bag: '<path fill="#bd9190" d="m7 10 2-5h14l2 5v17H7Z"/><path fill="#eddbd5" d="M5 9h18v19H5Z"/><path fill="#a97778" d="m23 9 4 3v13l-4 3Z"/><path d="M11 11V8a4 4 0 0 1 8 0v3"/><path stroke="#fff5ed" d="M8 13v11"/><circle cx="22" cy="23" r="6" fill="#fff8f1" stroke="#a17c64"/><path stroke="#88694d" d="m19.5 23 1.7 1.7 3.4-3.7"/>',
        box: '<path fill="#e6d2ad" d="m4 10 12-6 12 6-12 6Z"/><path fill="#c7ad80" d="M4 10v14l12 6V16Z"/><path fill="#ab8b61" d="m16 16 12-6v14l-12 6Z"/><path fill="#f7edd5" stroke="none" d="m10 7 12 6v6l-4 2v-6L6 9Z"/><path d="m4 10 12 6 12-6M16 16v14"/><path stroke="#f6e9ce" d="m7 22 5 2.5"/>',
        truck: '<path fill="#bac7c3" d="M3 7h16v17H3Z"/><path fill="#879f9a" d="M19 13h6l5 6v5H19Z"/><path fill="#edf2eb" d="M22 15h2l3 4h-5Z"/><path d="M3 24h27"/><circle cx="9" cy="25" r="3.5" fill="#665a54" stroke="#665a54"/><circle cx="25" cy="25" r="3.5" fill="#665a54" stroke="#665a54"/><circle cx="9" cy="25" r="1.3" fill="#f6ebdd" stroke="none"/><circle cx="25" cy="25" r="1.3" fill="#f6ebdd" stroke="none"/><path stroke="#f6f4e9" d="M6 11h10M6 14h7"/><path stroke="#869d95" d="M1 17h7M1 20h4"/>',
        check: '<path fill="#c7ceb0" d="M7 6h18v23H7Z"/><rect x="11" y="3" width="10" height="5" rx="2" fill="#929d79"/><path stroke="#fff9e9" d="M11 12h10M11 16h5M11 20h4"/><circle cx="24" cy="24" r="7" fill="#e4e8d8" stroke="#889574"/><path stroke="#6f805b" stroke-width="2" d="m20.5 24 2.4 2.4 4.7-5"/>'
    };
    icons.cancel = '<rect x="7" y="4" width="18" height="25" rx="3" fill="#e7d2cc"/><path d="M11 10h10M11 14h6" stroke="#ae857b"/><circle cx="23" cy="23" r="7" fill="#f5e4de" stroke="#a77369"/><path d="m20 20 6 6m0-6-6 6" stroke="#a0645b"/>';
    icons.message = '<path d="M4 5h24v18H14l-7 5v-5H4Z" fill="#dfd4cf"/><path d="M9 11h14M9 16h10" stroke="#95786e"/>';
    icons.auction = '<path d="m10 5 5-3 9 12-5 4Z" fill="#d9b79e"/><path d="m13 13-9 13 3 2 10-12" fill="#b78e75"/><path d="M18 26h10v4H16v-2Z" fill="#e7d2b4"/>';
    icons.clock = '<circle cx="16" cy="17" r="12" fill="#e6d6b6"/><circle cx="16" cy="17" r="9" fill="#fff5df"/><path d="M16 10v8l5 3M12 2h8" stroke="#9b8056"/>';
    icons.payment = '<rect x="3" y="6" width="26" height="20" rx="4" fill="#b6c3af"/><path d="M3 12h26" stroke="#7d9278" stroke-width="4"/><rect x="7" y="18" width="6" height="4" rx="1" fill="#f4e7bc" stroke="none"/><path d="M20 21h5" stroke="#eef2e7"/>';
    icons.refund = '<circle cx="17" cy="18" r="10" fill="#ded1b1"/><path d="M19 13h-4a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4h-4m3-10v12M9 6H3v6M3 6a14 14 0 0 1 23-1" stroke="#9b8159"/>';
    function el(tag, cls, value) { var node=document.createElement(tag); if(cls)node.className=cls; if(value)node.textContent=value; return node; }
    function save() {  if(!store.save(items))document.getElementById('notification-status').textContent='Changes could not be saved in this browser.'; }
    function relative(date) { var minutes=Math.max(0,Math.floor((Date.now()-date.getTime())/60000)); if(minutes<1)return 'Just now'; if(minutes<60)return minutes+' minutes ago'; var hours=Math.floor(minutes/60); if(hours<24)return hours+(hours===1?' hour ago':' hours ago'); var days=Math.floor(hours/24); return days+(days===1?' day ago':' days ago'); }
    function render() {
        document.querySelectorAll('[data-filter]').forEach(function(b){var f=b.dataset.filter;b.querySelector('b').textContent=items.filter(function(n){return f==='all'||(f==='unread'?!n.read:n.category===f);}).length;b.classList.toggle('active',f===filter);b.setAttribute('aria-pressed',String(f===filter));});
        var shown=items.filter(function(n){return filter==='all'||(filter==='unread'?!n.read:n.category===filter);});
        var direction=document.getElementById('notification-sort').value==='newest'?-1:1;
        shown.sort(function(a,b){return direction*(new Date(a.createdAt)-new Date(b.createdAt));});
        document.getElementById('mark-all').disabled=!items.some(function(n){return !n.read;});

        document.getElementById('empty-state').hidden=shown.length>0;
        list.replaceChildren();
        shown.forEach(function(n){
            var row=el('article','notification '+(['selling','orders','auctions','messages','listings','payments'].indexOf(n.category)>=0?n.category:'orders')+(!n.read?' is-unread':''));
            var dot=el('span','unread-dot');dot.setAttribute('aria-hidden','true');
            var symbol=el('span','notification-symbol');symbol.setAttribute('aria-hidden','true');
            var kind=n.kind||(/delivered|complete/.test(n.id)?'check':/shipping/.test(n.id)?'truck':n.category==='selling'?'bag':'box');
            symbol.dataset.kind=kind;
            symbol.innerHTML='<svg class="ui-icon" viewBox="0 0 32 32">'+(icons[kind]||icons.box)+'</svg>';
            var copy=el('div');var heading=el('h2');var link=el('a','notification-link',n.title);
            var allowed=['../user-listings/user-listings.html','../order-tracking/order-tracking.html','../user-orders/user-orders.html','../messeges/messages.html','../antiqes/antiqes.html','../saved-favorites/saved-favorites.html'];
            link.href=allowed.indexOf(n.href)>=0?n.href:allowed[2];link.addEventListener('click',function(){n.read=true;save();});heading.append(link);copy.append(heading,el('p','',n.body));
            if (window.NostalgiaPickup.eligible(n)) {
                var pickupAction=el('div','pickup-action');
                var pickupButton=el('button','pickup-button',window.NostalgiaPickup.hasDetails(n)?'View Pickup Details':'Arrange Pickup');
                pickupButton.type='button';pickupButton.setAttribute('aria-haspopup','dialog');pickupButton.setAttribute('aria-controls','pickup-dialog');
                pickupButton.addEventListener('click',function(){window.NostalgiaPickup.open(n.id);});
                pickupAction.append(pickupButton);
                if(window.NostalgiaPickup.hasDetails(n))pickupAction.append(el('span','pickup-status','Pickup Scheduled'));
                copy.append(pickupAction);
            }
            var thumb=el('span');
            if(n.image){try{var url=new URL(n.image,location.href);if(url.protocol==='https:'&&url.hostname==='images.unsplash.com'){thumb=el('img','notification-thumb');thumb.src=url.href;thumb.alt='';thumb.loading='lazy';}}catch(_){}}
            var date=new Date(n.createdAt),time=el('time');if(Number.isFinite(date.getTime())){time.dateTime=date.toISOString();time.textContent=relative(date);time.title=date.toLocaleString('en-GB',{timeZone:'Asia/Amman'});}
            var options=el('div','row-options');var trigger=el('button','options-trigger','⋮');trigger.type='button';trigger.setAttribute('aria-label','Options for '+n.title);trigger.setAttribute('aria-expanded','false');var menu=el('div','row-menu');menu.hidden=true;
            var read=el('button','',n.read?'Mark as unread':'Mark as read');read.type='button';read.addEventListener('click',function(){n.read=!n.read;save();render();});var remove=el('button','','Dismiss');remove.type='button';remove.addEventListener('click',function(){items=items.filter(function(entry){return entry.id!==n.id;});save();render();});
            menu.append(read,remove);trigger.addEventListener('click',function(){var open=menu.hidden;document.querySelectorAll('.row-menu').forEach(function(m){m.hidden=true;});document.querySelectorAll('.options-trigger').forEach(function(t){t.setAttribute('aria-expanded','false');});menu.hidden=!open;trigger.setAttribute('aria-expanded',String(open));});options.append(trigger,menu);row.append(dot,symbol,copy,thumb,time,options);list.append(row);
        });
    }
    function load() {
        items = store.read();
        var legacyOrder = items.find(function (n) { return n.id === "demo-new-order" && !n.type; });
        if (legacyOrder) {
            Object.assign(legacyOrder, { type: "seller_order_received", orderId: "NOST-0012", itemName: "Vintage Camera", body: examples[0].body });
            store.save(items);
        }
        try {
            var user = JSON.parse(localStorage.getItem('nostalgiaUser') || 'null');
            var seedKey = 'nostalgiaNotificationCatalog:v1:' + (user && (user.id || user.email) || 'guest');
            if (!localStorage.getItem(seedKey)) {
                var existing = new Set(items.map(function (n) { return n.id; }));
                var added = examples.filter(function (n) { return !existing.has(n.id); }).map(function (n) {
                    var index = examples.indexOf(n);
                    return Object.assign({}, n, { createdAt: new Date(Date.now() - (15 + index * 60) * 60000).toISOString() });
                });
                items = items.concat(added);
                if (store.save(items)) localStorage.setItem(seedKey, '1');
                else document.getElementById('notification-status').textContent = 'Notifications could not be saved in this browser.';
            }
        } catch (_) {
            document.getElementById('notification-status').textContent = 'Notifications could not be saved in this browser.';
        }
        render();
    }
    document.querySelectorAll('[data-filter]').forEach(function(b){b.addEventListener('click',function(){filter=b.dataset.filter;render();});});
    document.getElementById('notification-sort').addEventListener('change',render);
    document.getElementById('mark-all').addEventListener('click',function(){items.forEach(function(n){n.read=true;});save();render();document.getElementById('notification-status').textContent='All notifications marked as read.';});
    document.addEventListener('click',function(e){if(!e.target.closest('.row-options')){document.querySelectorAll('.row-menu').forEach(function(m){m.hidden=true;});document.querySelectorAll('.options-trigger').forEach(function(t){t.setAttribute('aria-expanded','false');});}});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){document.querySelectorAll('.row-menu').forEach(function(m){if(!m.hidden){m.hidden=true;var t=m.parentElement.querySelector('button');t.setAttribute('aria-expanded','false');t.focus();}});}});
    window.addEventListener('nostalgia-pickup-updated',load);
    window.addEventListener('storage',load);window.addEventListener('nostalgia-auth-changed',load);load();
});
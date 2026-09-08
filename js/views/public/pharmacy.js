(function () {
    const esc = str => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;

    window.App.Views.Pharmacy = function () {
        const { state, setView, navigate, getPharmacyOrders, createPharmacyOrder, updatePharmacyOrderStatus, getPrescriptionByRxId } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell';

        let activeTab = 'patient'; // 'patient' or 'dispensary'
        let fulfillmentType = 'counter'; // 'counter' or 'delivery'

        // Sample catalog of generic vs branded items
        const defaultItems = [
            { id: 'm-1', name: 'Paracetamol 650 mg', brand: 'Generic Jan Aushadhi', price: 20, mrp: 35, type: 'prescription', qty: 1 },
            { id: 'm-2', name: 'Salbutamol Inhaler 100 mcg', brand: 'Asthalin (Cipla)', price: 145, mrp: 175, type: 'prescription', qty: 1 },
            { id: 'm-3', name: 'Pantoprazole 40 mg', brand: 'Pan-40 (Alkem)', price: 65, mrp: 95, type: 'prescription', qty: 1 },
            { id: 'm-4', name: 'ORS Electrolyte Sachet', brand: 'Electral', price: 22, mrp: 25, type: 'otc', qty: 2 },
            { id: 'm-5', name: 'Digital Clinical Thermometer', brand: 'SmartCare CareGear', price: 180, mrp: 250, type: 'otc', qty: 1 }
        ];

        let cart = [
            { id: 'm-1', name: 'Paracetamol 650 mg', price: 20, qty: 1 },
            { id: 'm-2', name: 'Salbutamol Inhaler 100 mcg', price: 145, qty: 1 }
        ];

        function render() {
            const orders = getPharmacyOrders();
            const patientOrders = orders.filter(o => !state.loggedEmail || o.patientName.toLowerCase().includes(state.loggedEmail.split('@')[0].toLowerCase()) || true);
            const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

            container.innerHTML = `
                <div class="flow-topbar">
                    <a class="brand-lockup" data-route="/" href="/">
                        <span class="brand-mark" style="background:#2b6cb0">${icon('pill', 20)}</span>
                        <span><span class="brand-name">SmartCare</span><span class="brand-caption" style="color:#2b6cb0;font-weight:700">In-House Pharmacy</span></span>
                    </a>
                    <div class="flow-topbar-actions">
                        ${window.App.UI.topbarControls(false)}
                        <a class="back-link" data-route="/" href="/">${icon('arrow-left', 16)} Back to home</a>
                    </div>
                </div>

                <main class="pharmacy-main-shell" style="max-width:960px;margin:1.5rem auto;padding:0 1rem" role="main">
                    <!-- Pharmacy Header -->
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
                        <div>
                            <span class="badge" style="background:#ebf8ff;color:#2b6cb0;font-weight:700;padding:.35rem .85rem;border-radius:20px;display:inline-flex;align-items:center;gap:.35rem;font-size:.82rem">
                                ${icon('store', 14)} SmartCare Hospital Pharmacy Counter #02
                            </span>
                            <h1 style="font-size:clamp(1.5rem, 4vw, 2rem);margin:.4rem 0 .2rem;color:var(--ink)">
                                Prescription Pharmacy &amp; Pickup
                            </h1>
                            <p style="color:var(--muted);margin:0;font-size:.9rem">
                                Skip lobby queues. Verified medicines dispensed directly from hospital inventory.
                            </p>
                        </div>

                        <!-- Role view switch -->
                        <div class="pill-group" style="display:inline-flex;background:var(--canvas);padding:.25rem;border-radius:8px;border:1px solid var(--line)">
                            <button type="button" id="tab-patient-view" class="pill-btn ${activeTab === 'patient' ? 'active' : ''}" style="padding:.45rem .9rem;border-radius:6px;border:none;background:${activeTab === 'patient' ? 'var(--surface)' : 'transparent'};color:${activeTab === 'patient' ? 'var(--teal)' : 'var(--muted)'};font-weight:600;font-size:.85rem;cursor:pointer">
                                Patient Order
                            </button>
                            <button type="button" id="tab-dispensary-view" class="pill-btn ${activeTab === 'dispensary' ? 'active' : ''}" style="padding:.45rem .9rem;border-radius:6px;border:none;background:${activeTab === 'dispensary' ? 'var(--surface)' : 'transparent'};color:${activeTab === 'dispensary' ? 'var(--teal)' : 'var(--muted)'};font-weight:600;font-size:.85rem;cursor:pointer">
                                Hospital Dispenser Queue (${orders.length})
                            </button>
                        </div>
                    </div>

                    ${activeTab === 'patient' ? `
                        <!-- PATIENT ORDER VIEW -->
                        <div style="display:grid;grid-template-columns:1fr;gap:1.5rem">
                            
                            <!-- Prescription Prescribed Meds Auto-import Banner -->
                            <div style="background:#ebf8ff;border:1px solid #bee3f8;border-radius:12px;padding:1.1rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
                                <div style="display:flex;align-items:center;gap:.75rem">
                                    <span style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;background:#2b6cb0;color:#fff">
                                        ${icon('file-text', 20)}
                                    </span>
                                    <div>
                                        <strong style="color:#2c5282;font-size:.95rem;display:block">Imported from Verified Prescription (RX-2026-DEMO01)</strong>
                                        <span style="font-size:.82rem;color:#4a5568">Dr Meera Shah · 2 items pre-filled with generic subsidy discount</span>
                                    </div>
                                </div>
                                <a href="/verify-rx?id=RX-2026-DEMO01" data-route="/verify-rx?id=RX-2026-DEMO01" class="btn-secondary btn-icon" style="font-size:.8rem;padding:.35rem .75rem">
                                    ${icon('shield-check', 14)} View Digital Rx
                                </a>
                            </div>

                            <div class="pharmacy-grid-layout" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:1.5rem">
                                
                                <!-- Left Column: Medicines Catalog -->
                                <div>
                                    <h2 style="font-size:1.15rem;margin-bottom:.75rem;display:flex;align-items:center;gap:.4rem">
                                        ${icon('shopping-bag', 18)} Available Hospital Inventory
                                    </h2>
                                    <div class="medicine-item-list" style="display:flex;flex-direction:column;gap:.75rem">
                                        ${defaultItems.map(item => {
                                            const inCart = cart.find(c => c.id === item.id);
                                            return `
                                                <div class="provider-card" style="padding:.9rem 1.1rem;display:flex;justify-content:space-between;align-items:center;margin:0">
                                                    <div>
                                                        <div style="display:flex;align-items:center;gap:.4rem">
                                                            <strong style="font-size:.95rem;color:var(--ink)">${esc(item.name)}</strong>
                                                            ${item.type === 'prescription' ? `<span class="badge" style="background:#fed7d7;color:#9b2c2c;font-size:.7rem">Rx Req</span>` : ''}
                                                        </div>
                                                        <small style="color:var(--muted);display:block">${esc(item.brand)}</small>
                                                        <div style="margin-top:.25rem;font-size:.85rem">
                                                            <strong style="color:var(--teal)">₹${item.price}</strong>
                                                            <del style="color:var(--muted);font-size:.75rem;margin-left:.35rem">₹${item.mrp}</del>
                                                            <span style="color:#38a169;font-weight:600;font-size:.75rem;margin-left:.35rem">Save ₹${item.mrp - item.price}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        ${inCart ? `
                                                            <span class="badge" style="background:#e6fffa;color:#234e52;font-weight:700;padding:.35rem .7rem">Added (${inCart.qty})</span>
                                                        ` : `
                                                            <button type="button" class="btn-secondary btn-icon btn-add-cart" data-item-id="${item.id}" style="font-size:.8rem;padding:.35rem .75rem">
                                                                ${icon('plus', 14)} Add
                                                            </button>
                                                        `}
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>

                                <!-- Right Column: Order Checkout & Fulfillment -->
                                <div>
                                    <div class="provider-card" style="padding:1.25rem;position:sticky;top:1rem">
                                        <h2 style="font-size:1.15rem;margin-bottom:1rem;display:flex;align-items:center;gap:.4rem">
                                            ${icon('receipt', 18)} Order Summary
                                        </h2>

                                        <!-- Cart Items List -->
                                        <div style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.25rem;border-bottom:1px solid var(--line);padding-bottom:1rem">
                                            ${cart.length ? cart.map(item => `
                                                <div style="display:flex;justify-content:space-between;align-items:center;font-size:.88rem">
                                                    <span>${esc(item.name)} <small style="color:var(--muted)">x${item.qty}</small></span>
                                                    <strong>₹${item.price * item.qty}</strong>
                                                </div>
                                            `).join('') : `<p style="color:var(--muted);font-size:.85rem;margin:0">Cart is empty.</p>`}
                                        </div>

                                        <!-- Fulfillment Type Selector -->
                                        <div style="margin-bottom:1.25rem">
                                            <label style="font-weight:600;font-size:.85rem;display:block;margin-bottom:.5rem">Choose Fulfillment Method</label>
                                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
                                                <div id="select-counter" style="border:2px solid ${fulfillmentType === 'counter' ? 'var(--teal)' : 'var(--line)'};padding:.75rem;border-radius:8px;cursor:pointer;background:${fulfillmentType === 'counter' ? 'var(--mint)' : 'var(--surface)'}">
                                                    <strong style="font-size:.85rem;display:block">${icon('store', 14)} Counter Pickup</strong>
                                                    <small style="color:var(--muted)">Ready in ~10 mins</small>
                                                    <div style="color:#38a169;font-weight:700;font-size:.78rem;margin-top:.25rem">FREE</div>
                                                </div>
                                                <div id="select-delivery" style="border:2px solid ${fulfillmentType === 'delivery' ? 'var(--teal)' : 'var(--line)'};padding:.75rem;border-radius:8px;cursor:pointer;background:${fulfillmentType === 'delivery' ? 'var(--mint)' : 'var(--surface)'}">
                                                    <strong style="font-size:.85rem;display:block">${icon('truck', 14)} Home Delivery</strong>
                                                    <small style="color:var(--muted)">Within 45 mins</small>
                                                    <div style="color:var(--ink);font-weight:700;font-size:.78rem;margin-top:.25rem">₹30 Fee</div>
                                                </div>
                                            </div>
                                        </div>

                                        ${fulfillmentType === 'delivery' ? `
                                            <div class="field" style="margin-bottom:1.25rem">
                                                <label for="delivery-addr" style="font-weight:600;font-size:.85rem;display:block;margin-bottom:.3rem">Delivery Address</label>
                                                <input id="delivery-addr" type="text" value="Flat 402, Aditya Towers, Gachibowli, Hyderabad" required style="width:100%;padding:.6rem .8rem;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:.88rem">
                                            </div>
                                        ` : ''}

                                        <!-- Price Breakdown -->
                                        <div style="margin-bottom:1.25rem;font-size:.88rem">
                                            <div style="display:flex;justify-content:space-between;color:var(--muted);margin-bottom:.25rem">
                                                <span>Subtotal</span>
                                                <span>₹${cartTotal}</span>
                                            </div>
                                            <div style="display:flex;justify-content:space-between;color:var(--muted);margin-bottom:.5rem">
                                                <span>Fulfillment Fee</span>
                                                <span>${fulfillmentType === 'delivery' ? '₹30' : '₹0 (Free)'}</span>
                                            </div>
                                            <div style="display:flex;justify-content:space-between;font-size:1.1rem;font-weight:700;border-top:1px solid var(--line);padding-top:.5rem;color:var(--ink)">
                                                <span>Total Payable</span>
                                                <span style="color:var(--teal)">₹${cartTotal + (fulfillmentType === 'delivery' ? 30 : 0)}</span>
                                            </div>
                                        </div>

                                        <button type="button" id="btn-place-pharm-order" class="btn-primary btn-icon" style="width:100%;justify-content:center;padding:.75rem;font-size:.95rem" ${cart.length ? '' : 'disabled'}>
                                            ${icon('check', 16)} Place Pharmacy Order (₹${cartTotal + (fulfillmentType === 'delivery' ? 30 : 0)})
                                        </button>
                                        <small style="color:var(--muted);display:block;text-align:center;margin-top:.5rem;font-size:.75rem">
                                            Pay cash at counter or UPI upon delivery.
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <!-- Previous Pharmacy Orders History -->
                            <section class="provider-card" style="margin-top:1rem;padding:1.25rem">
                                <h2 style="font-size:1.15rem;margin-bottom:1rem;display:flex;align-items:center;gap:.4rem">
                                    ${icon('clock', 18)} Your Pharmacy Orders
                                </h2>
                                <div class="queue-table-wrap">
                                    <table class="queue-table" style="font-size:.88rem">
                                        <thead>
                                            <tr>
                                                <th>Order Ref</th>
                                                <th>Items</th>
                                                <th>Fulfillment</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${patientOrders.map(o => `
                                                <tr>
                                                    <td><strong>${esc(o.id)}</strong><br><small style="color:var(--muted)">${esc(o.rxId)}</small></td>
                                                    <td>${o.items.map(i => `${esc(i.name)} (${i.qty})`).join(', ')}</td>
                                                    <td>${esc(o.counterNo || o.fulfillmentType)}</td>
                                                    <td><strong>₹${o.total}</strong></td>
                                                    <td>
                                                        <span class="badge" style="background:${o.status === 'ready' ? '#e6fffa' : o.status === 'completed' ? '#edf2f7' : '#ebf8ff'};color:${o.status === 'ready' ? '#234e52' : o.status === 'completed' ? '#4a5568' : '#2b6cb0'};font-weight:600">
                                                            ${o.status === 'ready' ? '🟢 Ready for Pickup' : o.status === 'placed' ? '🟡 Being Packed' : 'Completed'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    ` : `
                        <!-- HOSPITAL DISPENSARY STAFF VIEW -->
                        <section class="provider-card" style="padding:1.5rem">
                            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.25rem">
                                <div>
                                    <h2 style="font-size:1.25rem;margin:0">Dispensary Order Processing Queue</h2>
                                    <p style="color:var(--muted);margin:.2rem 0 0;font-size:.85rem">Incoming digital prescriptions pending packing and pickup calling.</p>
                                </div>
                                <span class="badge" style="background:var(--mint);color:var(--teal);font-weight:700">${orders.length} Active Orders</span>
                            </div>

                            <div class="queue-table-wrap">
                                <table class="queue-table" style="font-size:.9rem">
                                    <thead>
                                        <tr>
                                            <th>Order &amp; Rx</th>
                                            <th>Patient</th>
                                            <th>Prescribed Medications</th>
                                            <th>Fulfillment</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${orders.map(order => `
                                            <tr>
                                                <td data-label="Order">
                                                    <strong>${esc(order.id)}</strong><br>
                                                    <small style="color:var(--teal);font-weight:600">${esc(order.rxId)}</small>
                                                </td>
                                                <td data-label="Patient">
                                                    <strong>${esc(order.patientName)}</strong><br>
                                                    <small style="color:var(--muted)">${esc(order.patientPhone)}</small>
                                                </td>
                                                <td data-label="Items">
                                                    <ul style="margin:0;padding-left:1.2rem;font-size:.85rem">
                                                        ${order.items.map(i => `<li>${esc(i.name)} (Qty: ${i.qty})</li>`).join('')}
                                                    </ul>
                                                </td>
                                                <td data-label="Pickup">
                                                    <strong>${esc(order.counterNo)}</strong><br>
                                                    <small>Total: ₹${order.total}</small>
                                                </td>
                                                <td data-label="Status">
                                                    <span class="badge" style="background:${order.status === 'ready' ? '#e6fffa' : order.status === 'completed' ? '#edf2f7' : '#fefcbf'};color:${order.status === 'ready' ? '#234e52' : order.status === 'completed' ? '#4a5568' : '#744210'};font-weight:700">
                                                        ${order.status === 'ready' ? 'Ready for Counter #02' : order.status === 'placed' ? 'Packing Order' : 'Dispensed'}
                                                    </span>
                                                </td>
                                                <td data-label="Action">
                                                    ${order.status === 'placed' ? `
                                                        <button type="button" class="btn-primary btn-icon btn-advance-order" data-order-id="${order.id}" data-next-status="ready" style="font-size:.78rem;padding:.35rem .75rem">
                                                            ${icon('bell', 13)} Call to Counter
                                                        </button>
                                                    ` : order.status === 'ready' ? `
                                                        <button type="button" class="btn-secondary btn-icon btn-advance-order" data-order-id="${order.id}" data-next-status="completed" style="font-size:.78rem;padding:.35rem .75rem">
                                                            ${icon('check-circle', 13)} Complete Pickup
                                                        </button>
                                                    ` : `
                                                        <span style="font-size:.8rem;color:var(--muted)">Fulfilled</span>
                                                    `}
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    `}
                </main>
                ${window.App.UI.footer(false)}
            `;

            window.App.UI.bindTopbarControls(container);
            if (window.lucide) window.lucide.createIcons();

            // Tab switching
            const patTab = container.querySelector('#tab-patient-view');
            if (patTab) patTab.onclick = () => { activeTab = 'patient'; render(); };

            const disTab = container.querySelector('#tab-dispensary-view');
            if (disTab) disTab.onclick = () => { activeTab = 'dispensary'; render(); };

            // Fulfillment choice
            const counterChoice = container.querySelector('#select-counter');
            if (counterChoice) counterChoice.onclick = () => { fulfillmentType = 'counter'; render(); };

            const deliveryChoice = container.querySelector('#select-delivery');
            if (deliveryChoice) deliveryChoice.onclick = () => { fulfillmentType = 'delivery'; render(); };

            // Add to cart buttons
            container.querySelectorAll('.btn-add-cart').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.dataset.itemId;
                    const item = defaultItems.find(i => i.id === id);
                    if (item && !cart.find(c => c.id === id)) {
                        cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
                        render();
                    }
                };
            });

            // Place order button
            const placeOrderBtn = container.querySelector('#btn-place-pharm-order');
            if (placeOrderBtn) {
                placeOrderBtn.onclick = () => {
                    const total = cartTotal + (fulfillmentType === 'delivery' ? 30 : 0);
                    const newOrder = createPharmacyOrder({
                        rxId: 'RX-2026-DEMO01',
                        items: [...cart],
                        total,
                        fulfillmentType,
                        deliveryAddress: fulfillmentType === 'delivery' ? (container.querySelector('#delivery-addr')?.value || 'Hyderabad') : ''
                    });
                    window.App.UI.toast(`Order placed successfully! Token: ${newOrder.id}. Ready at Counter #02 in 10 mins.`, 'success');
                    cart = [];
                    render();
                };
            }

            // Dispensary advance order buttons
            container.querySelectorAll('.btn-advance-order').forEach(btn => {
                btn.onclick = () => {
                    const orderId = btn.dataset.orderId;
                    const nextStatus = btn.dataset.nextStatus;
                    updatePharmacyOrderStatus(orderId, nextStatus);
                    window.App.UI.toast(`Order ${orderId} updated to ${nextStatus}.`, 'info');
                    render();
                };
            });
        }

        render();
        return container;
    };
})();
